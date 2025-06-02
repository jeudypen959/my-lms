import Head from 'next/head';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Image from 'next/image';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  orderBy,
  query,
  updateDoc,
  Timestamp,
  onSnapshot,
  arrayUnion,
} from 'firebase/firestore';
import { db, auth } from '@/config/firebaseConfig';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import CommentsSection from '@/components/Comment/CommentsSection';
import NothingLottie from '@/assets/animation/nothing-found.json';
import dynamic from 'next/dynamic';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false,
});

// Interfaces
interface Course {
  id: string;
  courseTitle: string;
  description: string;
  instructor: string;
  profileimg: string;
  categories: string;
  duration: string;
  price: number;
  thumbnail: string;
  learningOutcomes: string[];
  modules: Module[];
  startDate: string;
  level: string;
  enrolledStudents: number;
  language: string;
}

interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: Timestamp;
  replies: Reply[];
  reactions: Reaction[];
}

interface Reply {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: Timestamp;
  reactions: Reaction[];
}

interface Reaction {
  type: 'like' | 'heart' | 'smile' | 'wow' | 'angry' | 'sad';
  count: number;
  userIds: string[];
}

interface Rating {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  userName: string;
  createdAt: Timestamp;
}

interface Module {
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  title: string;
  duration: string;
}

interface Enrollment {
  courseId: string;
  enrollmentDate?: Timestamp;
  status?: string;
}

// Format rating function
const formatRating = (number: number) => {
  if (number < 1000) {
    return number.toFixed(1);
  } else if (number < 10000) {
    return (number / 1000).toFixed(1) + 'k';
  } else if (number < 1000000) {
    return (number / 1000).toFixed(1).replace('.0', '') + 'k';
  } else {
    return (number / 1000000).toFixed(1).replace('.0', '') + 'M';
  }
};

// Calculate total rating sum
const calculateTotalRatingSum = (ratingsData: Rating[]) => {
  return ratingsData.reduce((sum, rating) => sum + (rating.rating || 0), 0);
};

// Custom CSS for borderless accordion
const customStyles = `
  .accordion-item {
    border: none !important;
    background: transparent;
    margin-bottom: 10px;
  }
  .accordion-button {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    font-family: 'Acme', sans-serif;
    color: #2c3e50;
    padding: 15px;
    border-radius: 10px !important;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    transition: background-color 0.2s ease;
  }
  .accordion-button:hover {
    background: #f1f3f5 !important;
  }
  .accordion-button.active {
    background: #f8f9fa !important;
    color: #2c3e50;
  }
  .accordion-button-title {
    text-align: left;
    flex-grow: 1;
    font-size: 1.1rem;
  }
  .accordion-button-icon {
    flex-shrink: 0;
    font-size: 1.2rem;
    color: #2c3e50;
  }
  .accordion-button-icon::before,
  .accordion-button-icon::after {
    content: none !important;
  }
  .bi-chevron-up,
  .bi-chevron-down {
    display: inline-block;
  }
  .accordion-content {
    padding: 15px;
    background: transparent;
    display: none;
  }
  .accordion-content.active {
    display: block;
  }
`;

const CourseDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [averageRating, setAverageRating] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [totalRatingSum, setTotalRatingSum] = useState<number>(0);
  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(null);

  // Inject custom styles for borderless accordion
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = customStyles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Log modules for debugging
  useEffect(() => {
    if (course && course.modules && course.modules.length > 0) {
      console.log('Modules loaded:', course.modules);
    }
  }, [course]);

  const checkEnrollmentStatus = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const enrollmentArray: Enrollment[] = userData.enrollment || [];
        const enrolled = enrollmentArray.some((enrollment: Enrollment) => enrollment.courseId === id);
        setIsEnrolled(enrolled);
        return enrolled;
      }
      setIsEnrolled(false);
      return false;
    } catch (err) {
      console.error('Error checking enrollment:', err);
      setError('Failed to check enrollment status');
      setIsEnrolled(false);
      return false;
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    if (!id) return;
    try {
      const commentsRef = collection(db, 'courses', id as string, 'forums');
      const q = query(commentsRef, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const commentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          replies: doc.data().replies || [],
        })) as Comment[];
        setComments(commentsData);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    }
  }, [id]);

  const fetchRatings = useCallback(async () => {
    if (!id) return;
    try {
      const ratingsRef = collection(db, 'courses', id as string, 'ratings');
      const q = query(ratingsRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const ratingsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Rating[];
        setRatings(ratingsData);

        const totalSum = calculateTotalRatingSum(ratingsData);
        setTotalRatingSum(totalSum);

        if (ratingsData.length > 0) {
          const avg = totalSum / ratingsData.length;
          setAverageRating(avg);
        } else {
          setAverageRating(0);
        }

        if (auth.currentUser && auth.currentUser.uid) {
          const userRatingData = ratingsData.find((r) => r.userId === auth.currentUser!.uid);
          if (userRatingData) {
            setUserRating(userRatingData.rating || 0);
          }
        }
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error fetching ratings:', err);
      setError('Failed to load ratings');
    }
  }, [id]);

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || userRating === 0 || !id) return;

    try {
      const ratingsRef = collection(db, 'courses', id as string, 'ratings');
      await addDoc(ratingsRef, {
        rating: userRating,
        comment: ratingComment,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous',
        createdAt: Timestamp.now(),
      });
      setRatingComment('');
      setUserRating(0);
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Failed to submit rating');
    }
  };

  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const docRef = doc(db, 'courses', id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const courseData = docSnap.data();
          console.log('Raw courseData.modules:', courseData.modules); // Debug
          const modulesArray = courseData.modules
            ? Object.keys(courseData.modules).map((key) => ({
                title: courseData.modules[key].title || '',
                lessons: courseData.modules[key].lessons || [],
              }))
            : [];
          console.log('Processed modulesArray:', modulesArray); // Debug

          const courseWithModules: Course = {
            id: docSnap.id,
            courseTitle: courseData.courseTitle || '',
            description: courseData.description || '',
            instructor: courseData.instructor || '',
            profileimg: courseData.profileimg || '',
            categories: courseData.categories || '',
            duration: courseData.duration || '',
            price: Number(courseData.price) || 0,
            thumbnail: courseData.thumbnail || '',
            learningOutcomes: courseData.learningOutcomes || [],
            modules: modulesArray,
            startDate: courseData.startDate || '',
            level: courseData.level || '',
            enrolledStudents: courseData.enrolledStudents || 0,
            language: courseData.language || 'English',
          };

          setCourse(courseWithModules);
        } else {
          setError('Course not found');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        setUserId(user.uid);
        await checkEnrollmentStatus(user.uid);
      } else {
        setUserId(null);
        setIsEnrolled(false);
      }
    });

    if (id) {
      fetchComments();
      fetchRatings();
    }

    if (router.query.payment === 'success' && auth.currentUser) {
      checkEnrollmentStatus(auth.currentUser.uid).then(() => {
        console.log('Checked enrollment after payment success');
      });
    }

    return () => unsubscribe();
  }, [id, router.query, checkEnrollmentStatus, fetchComments, fetchRatings]);

  const handleRefreshEnrollment = async () => {
    const user = auth.currentUser;
    if (user) {
      await checkEnrollmentStatus(user.uid);
    }
  };

  // Handle accordion toggle
  const toggleModule = (index: number) => {
    console.log('Toggling module:', index, 'Current open index:', openModuleIndex, 'New index:', openModuleIndex === index ? null : index);
    setOpenModuleIndex(openModuleIndex === index ? null : index);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '70vh', paddingTop: '90px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !course) {
    return (
      <>
        <Header />
        <div className="container text-center" style={{ minHeight: '70vh', paddingTop: '90px' }}>
          <div className="col-12 text-center py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <div className="text-center">
              <Lottie
                animationData={NothingLottie}
                loop={true}
                style={{ width: 170, height: 170, marginBottom: 0, marginTop: 20 }}
              />
              <p style={{ fontFamily: "'Carter One', cursive", color: "#2c3e50" }}>Courses not found.</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`DG Next - ${course.courseTitle}`}</title>
        <meta name="description" content={course.description || 'Course details'} />
        <link rel="icon" href="/dglogo.ico" />
      </Head>

      <Header />

      <div className="container" style={{ paddingTop: '90px', paddingBottom: '50px' }}>
        <div className="row mb-4">
          <div className="col-12">
            <Link
              href="/courselist"
              className="btn p-0 border-0 bg-transparent shadow-none text-decoration-none"
              style={{
                fontFamily: '"Livvic", sans-serif',
                fontSize: 20,
                color: '#6c757d',
                transition: 'color 0.15s ease-in-out',
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#2c3e50')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#6c757d')}
              onMouseDown={(e) => (e.currentTarget.style.color = '#2c3e50')}
              onMouseUp={(e) => (e.currentTarget.style.color = '#2c3e50')}
            >
              <span className="d-flex align-items-center" style={{ fontSize: 20 }}>
                <i className="bi bi-arrow-left me-3" style={{ fontSize: 20, marginRight: 10 }}></i>
                Courses List
              </span>
            </Link>
          </div>
        </div>

        {/* Thumbnail and Course Header */}
        <div className="row mb-5">
          <div className="col-lg-6">
            <div style={{ borderRadius: '15px', overflow: 'hidden' }}>
              <Image
                src={course.thumbnail || '/placeholder-image.jpg'}
                alt={course.courseTitle}
                width={600}
                height={300}
                layout="responsive"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="col-lg-6">
            <span
              style={{
                backgroundColor: '#2c3e50',
                border: '1px solid #2c3e50',
                borderWidth: '2px',
                paddingLeft: 10,
                paddingRight: 10,
                paddingTop: 3,
                paddingBottom: 3,
                borderRadius: 10,
                color: '#fff',
                letterSpacing: '1px',
                marginBottom: '15px',
                display: 'inline-block',
              }}
            >
              {course.categories}
            </span>
            <h1 style={{ color: '#2c3e50', fontFamily: '"Acme", sans-serif', fontSize: 25, letterSpacing: '1.5px' }}>{course.courseTitle}</h1>
            <div className="d-flex align-items-center mb-3">
              <Image
                src={course.profileimg}
                alt={`Instructor ${course.instructor}`}
                width={60}
                height={60}
                className="rounded-circle me-3"
                style={{ objectFit: 'cover' }}
              />
              <h1 className="lead mb-0" style={{ fontFamily: '"Livvic", sans-serif', color: '#2c3e50', fontSize: 22 }}>
                Instructor:{' '}
                <strong style={{ fontWeight: 400, color: '#2c3e50', fontSize: 22 }}>{course.instructor}</strong>
              </h1>
            </div>
            <div className="d-flex flex-wrap gap-3 mb-3">
              <div className="badge p-2" style={{ border: '0px solid #fff' }}>
                <div className="d-flex align-items-center">
                  <i className="bi bi-clock me-2" style={{ color: '#2c3e50', fontSize: 22 }}></i>
                  <span style={{ fontFamily: '"Livvic", sans-serif', letterSpacing: '1px', color: '#2c3e50', fontSize: 22, border: '0px solid #fff' }}>
                    {course.duration || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="badge p-2" style={{ border: '0px solid #fff' }}>
                <div className="d-flex align-items-center">
                  <i className="bi bi-cash-coin me-2" style={{ color: '#2c3e50', fontSize: 22 }}></i>
                  <span style={{ fontFamily: '"Livvic", sans-serif', letterSpacing: '1px', color: '#2c3e50', fontSize: 22, border: '0px solid #fff' }}>
                    {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                  </span>
                </div>
              </div>
              <div className="badge p-2" style={{ border: '0px solid #fff' }}>
                <div className="d-flex align-items-center">
                  <i className="bi bi-star-fill me-1" style={{ color: '#2c3e50', fontSize: 22 }}></i>
                  <i className="bi bi-star-fill me-1" style={{ color: '#2c3e50', fontSize: 22 }}></i>
                  <i className="bi bi-star-fill me-1" style={{ color: '#2c3e50', fontSize: 22 }}></i>
                  <i className="bi bi-star-fill me-1" style={{ color: '#2c3e50', fontSize: 22 }}></i>
                  <i className="bi bi-star-fill me-1" style={{ color: '#2c3e50', fontSize: 22 }}></i>
                  <span style={{ fontFamily: '"Livvic", sans-serif', letterSpacing: '1px', color: '#2c3e50', fontSize: 22, border: '0px solid #fff' }}>
                    {formatRating(totalRatingSum)}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              {isAuthenticated ? (
                isEnrolled ? (
                  <Link href={`/course/${course.id}/learn`}>
                    <button className="btn btn-success btn-lg w-100" style={{ height: 45, borderRadius: 10 }}>
                      <i className="bi bi-play-circle me-2"></i> Start Learning
                    </button>
                  </Link>
                ) : (
                  <Link href={`/payment/${course.id}`}>
                    <button className="btn search-btn w-100" style={{ height: 45, borderRadius: 10, fontFamily: "'Acme', sans-serif", fontSize: '16px' }}>
                      <i className="bi bi-cart-plus me-2"></i> Enroll Now
                    </button>
                  </Link>
                )
              ) : (
                <Link href="/authstudent">
                  <button className="btn search-btn w-100" style={{ height: 45, borderRadius: 10, fontFamily: "'Acme', sans-serif", fontSize: '16px' }}>
                    <i className="bi bi-lock me-2"></i> Please Login First
                  </button>
                </Link>
              )}
              {isAuthenticated && (
                <button
                  className="btn btn-outline-secondary mt-2 w-100"
                  style={{ borderRadius: 10 }}
                  onClick={handleRefreshEnrollment}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i> Refresh Enrollment Status
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Course Description and Details */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card mb-4" style={{ borderRadius: '15px' }}>
              <div className="card-body">
                <h5 className="card-title" style={{ fontFamily: '"Acme", sans-serif', color: '#2c3e50', fontSize: 22 }}>
                  Course Description
                </h5>
                <hr />
                <div className="card-text">
                  <li className="list-group-item d-flex justify-content-between align-items-center bg-transparent">
                    <h5 style={{ fontFamily: '"Livvic", sans-serif', fontSize: 18, color: '#2c3e50', fontWeight: 400 }}>{course.description || 'No description available for this course.'}</h5>
                  </li>
                </div>
                <h5 className="mt-4" style={{ fontFamily: '"Acme", sans-serif', color: '#2c3e50', fontSize: 22 }}>
                  Course Details
                </h5>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center bg-transparent">
                    <h5 style={{ fontFamily: '"Livvic", sans-serif', fontSize: 18, color: '#2c3e50', fontWeight: 400 }}>
                      <i className="bi bi-calendar3 me-2"></i> Start Date
                    </h5>
                    <h5 style={{ fontFamily: '"Livvic", sans-serif', fontSize: 18, color: '#2c3e50', fontWeight: 400 }}>{course.startDate || 'Flexible'}</h5>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center bg-transparent">
                    <h5 style={{ fontFamily: '"Livvic", sans-serif', fontSize: 18, color: '#2c3e50', fontWeight: 400 }}>
                      <i className="bi bi-clock-history me-2"></i> Duration
                    </h5>
                    <h5 style={{ fontFamily: '"Livvic", sans-serif', fontSize: 18, color: '#2c3e50', fontWeight: 400 }}>{course.duration}</h5>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center bg-transparent">
                    <h5 style={{ fontFamily: '"Livvic", sans-serif', fontSize: 18, color: '#2c3e50', fontWeight: 400 }}>
                      <i className="bi bi-bar-chart me-2"></i> Level
                    </h5>
                    <h5 style={{ fontFamily: '"Livvic", sans-serif', fontSize: 18, color: '#2c3e50', fontWeight: 400 }}>{course.level}</h5>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center bg-transparent">
                    <h5 style={{ fontFamily: '"Livvic", sans-serif', fontSize: 18, color: '#2c3e50', fontWeight: 400 }}>
                      <i className="bi bi-people me-2"></i> Students
                    </h5>
                    <h5 style={{ fontFamily: '"Livvic", sans-serif', fontSize: 18, color: '#2c3e50', fontWeight: 400 }}>{course.enrolledStudents}</h5>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center bg-transparent">
                    <h5 style={{ fontFamily: '"Livvic", sans-serif', fontSize: 18, color: '#2c3e50', fontWeight: 400 }}>
                      <i className="bi bi-translate me-2"></i> Language
                    </h5>
                    <h5 style={{ fontFamily: '"Livvic", sans-serif', fontSize: 18, color: '#2c3e50', fontWeight: 400 }}>{course.language}</h5>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card mb-4" style={{ borderRadius: '15px' }}>
              <div className="card-body">
                <h4 className="card-title" style={{ fontFamily: '"Acme", sans-serif', color: '#2c3e50', fontSize: 22 }}>
                  What You will Learn
                </h4>
                <hr />
                <ul className="list-group list-group-flush">
                  {course.learningOutcomes.length > 0 ? (
                    course.learningOutcomes.map((outcome, index) => (
                      <li key={index} className="list-group-item bg-transparent">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        {outcome}
                      </li>
                    ))
                  ) : (
                    <li style={{ fontFamily: '"Livvic", sans-serif', fontSize: 18, color: '#2c3e50', fontWeight: 400 }} className="list-group-item bg-transparent">Learning outcomes not specified for this course.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="card mb-4" style={{ borderRadius: '15px' }}>
              <div className="card-body">
                <h4 className="card-title" style={{ fontFamily: '"Acme", sans-serif', color: '#2c3e50', fontSize: 22 }}>
                  Course Content
                </h4>
                <hr />
                <div className="accordion">
                  {course.modules.length > 0 ? (
                    course.modules.map((module, index) => (
                      <div className="accordion-item" key={index}>
                        <div
                          className={`accordion-button ${openModuleIndex === index ? 'active' : ''}`}
                          onClick={() => toggleModule(index)}
                        >
                          <span className="accordion-button-title">{module.title}</span>
                          <i
                            className={`bi accordion-button-icon ${openModuleIndex === index ? 'bi-chevron-up' : 'bi-chevron-down'}`}
                          ></i>
                        </div>
                        <div
                          className={`accordion-content ${openModuleIndex === index ? 'active' : ''}`}
                        >
                          <ul className="list-group list-group-flush">
                            {module.lessons.length > 0 ? (
                              module.lessons.map((lesson, lessonIndex) => (
                                <li
                                  key={lessonIndex}
                                  className="list-group-item d-flex justify-content-between align-items-center"
                                >
                                  <div>
                                    <i className={`bi ${isEnrolled ? 'bi-play-circle' : 'bi-lock'} me-2`}></i>
                                    {lesson.title}
                                  </div>
                                  <span className="badge bg-light text-dark">{lesson.duration}</span>
                                </li>
                              ))
                            ) : (
                              <li className="list-group-item">No lessons available for this module.</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="card-body">
                      <p className="card-text">No module information available for this course.</p>
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        Course content is being prepared and will be available soon.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments and Ratings */}
        <div className="row">
          <div className="col-lg-6">
            <CommentsSection
              comments={comments}
              isAuthenticated={isAuthenticated}
              isEnrolled={isEnrolled}
              courseId={id as string}
              userId={userId || ''}
              onCommentSubmit={async (commentText: string) => {
                try {
                  const commentsRef = collection(db, 'courses', id as string, 'forums');
                  await addDoc(commentsRef, {
                    text: commentText,
                    userId: auth.currentUser?.uid,
                    userName: auth.currentUser?.displayName || 'Anonymous',
                    createdAt: Timestamp.now(),
                    replies: [],
                    reactions: [],
                  });
                  await fetchComments();
                } catch (err) {
                  console.error('Error posting comment:', err);
                  setError('Failed to post comment');
                }
              }}
              onReplySubmit={async (commentId: string, replyText: string) => {
                try {
                  const commentRef = doc(db, 'courses', id as string, 'forums', commentId);
                  const commentSnap = await getDoc(commentRef);
                  const currentReplies = commentSnap.data()?.replies || [];

                  await updateDoc(commentRef, {
                    replies: [
                      ...currentReplies,
                      {
                        id: crypto.randomUUID(),
                        text: replyText,
                        userId: auth.currentUser?.uid,
                        userName: auth.currentUser?.displayName || 'Anonymous',
                        createdAt: Timestamp.now(),
                        reactions: [],
                      },
                    ],
                  });
                  await fetchComments();
                } catch (err) {
                  console.error('Error posting reply:', err);
                  setError('Failed to post reply');
                }
              }}
              onReactionSubmit={(
                commentId: string,
                reactionType: string | null,
                isReply?: boolean,
                replyId?: string
              ) => {
                try {
                  if (!userId) {
                    console.error('User ID is missing');
                    setError('User authentication required');
                    return;
                  }
                  const validReactions = ['like', 'heart', 'smile', 'wow', 'angry', 'sad'];
                  if (reactionType && !validReactions.includes(reactionType)) {
                    console.error('Invalid reaction type:', reactionType);
                    setError('Invalid reaction type');
                    return;
                  }
                  if (!isReply) {
                    const commentRef = doc(db, 'courses', id as string, 'forums', commentId);
                    updateDoc(commentRef, {
                      reactions: arrayUnion({
                        type: reactionType || 'like',
                        count: 1,
                        userIds: [userId],
                      })
                    }).catch((err) => {
                      console.error('Error updating comment reaction:', err);
                      setError('Failed to submit reaction');
                    });
                  } else if (replyId) {
                    const commentRef = doc(db, 'courses', id as string, 'forums', commentId);
                    getDoc(commentRef).then((commentSnap) => {
                      const currentReplies = commentSnap.data()?.replies || [];
                      const replyIndex = currentReplies.findIndex((r: Reply) => r.id === replyId);

                      if (replyIndex !== -1) {
                        currentReplies[replyIndex].reactions = currentReplies[replyIndex].reactions || [];
                        const existingReaction = currentReplies[replyIndex].reactions.find(
                          (r: Reaction) => r.type === reactionType
                        );
                        if (existingReaction) {
                          if (!existingReaction.userIds.includes(userId)) {
                            existingReaction.count += 1;
                            existingReaction.userIds.push(userId);
                          }
                        } else {
                          currentReplies[replyIndex].reactions.push({
                            type: reactionType || 'like',
                            count: 1,
                            userIds: [userId],
                          });
                        }
                        updateDoc(commentRef, {
                          replies: currentReplies,
                        }).catch((err) => {
                          console.error('Error updating reply reaction:', err);
                          setError('Failed to submit reaction');
                        });
                      }
                    }).catch((err) => {
                      console.error('Error fetching comment for reply:', err);
                      setError('Failed to submit reaction');
                    });
                  }
                } catch (err) {
                  console.error('Error submitting reaction:', err);
                  setError('Failed to submit reaction');
                }
              }}
            />
          </div>
          <div className="col-lg-6">
            <div className="card mb-4" style={{ borderRadius: '15px' }}>
              <div className="card-body">
                <h4 className="card-title" style={{ fontFamily: '"Acme", sans-serif', color: '#2c3e50', fontSize: 22 }}>
                  Course Ratings
                </h4>
                <hr />
                <div className="mb-3">
                  <h5 style={{ fontFamily: '"Acme", sans-serif', color: '#2c3e50' }}>
                    Course Rating ({ratings.length} reviews)
                  </h5>
                  <div className="mb-3">
                    <span className="text-warning">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`bi ${i < Math.round(averageRating) ? 'bi-star-fill' : 'bi-star'}`}
                        ></i>
                      ))}
                    </span>
                    <span className="ms-2">{averageRating.toFixed(1)} / 5</span>
                    <div className="mt-2">
                      <span style={{ fontFamily: '"Livvic", sans-serif', color: '#2c3e50' }}>
                        Total Rating Points: {formatRating(totalRatingSum)}
                      </span>
                    </div>
                  </div>

                  {isAuthenticated && isEnrolled && (
                    <form onSubmit={handleRatingSubmit}>
                      <div className="mb-3">
                        <div className="d-flex justify-content-center gap-2 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className={`btn btn-link p-0 ${star <= userRating ? 'text-warning' : 'text-muted'}`}
                              onClick={() => setUserRating(star)}
                            >
                              <i className="bi bi-star-fill fs-4"></i>
                            </button>
                          ))}
                        </div>
                        <textarea
                          className="form-control"
                          rows={2}
                          placeholder="Add your review..."
                          value={ratingComment}
                          onChange={(e) => setRatingComment(e.target.value)}
                          style={{ fontFamily: '"Livvic", sans-serif', height: 45 }}
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={userRating === 0}
                        style={{ fontFamily: '"Acme", sans-serif' }}
                      >
                        <i className="bi bi-star me-2"></i>Submit Rating
                      </button>
                    </form>
                  )}

                  <div className="mt-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {ratings.map((rating) => (
                      <div key={rating.id} className="card mb-2" style={{ borderRadius: '8px' }}>
                        <div className="card-body py-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <small className="fw-bold" style={{ fontFamily: '"Acme", sans-serif', color: '#2c3e50' }}>
                                <i className="bi bi-person-lines-fill me-1"></i>
                                {rating.userName || 'Anonymous'}
                              </small>
                              <div>
                                {[...Array(5)].map((_, i) => (
                                  <i
                                    key={i}
                                    className={`bi ${i < rating.rating ? 'bi-star-fill' : 'bi-star'} text-warning me-1`}
                                  />
                                ))}
                              </div>
                              <p className="mb-0" style={{ fontFamily: '"Livvic", sans-serif', fontSize: '0.9rem' }}>
                                {rating.comment}
                              </p>
                            </div>
                            <small className="text-muted">
                              {rating.createdAt ? new Date(rating.createdAt.toDate()).toLocaleDateString() : ''}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CourseDetail;