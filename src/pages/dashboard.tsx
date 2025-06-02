import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import 'bootstrap/dist/css/bootstrap.min.css';
import Image from 'next/image';
import { Col, Container, Row } from 'react-bootstrap';
import LoadingAnimaiton from "@/assets/animation/loading2.json";
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false
});

interface EnrolledCourse {
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  instructor: string;
  price: string;
  thumbnail: string;
  username: string;
  progress?: number;
}

const Dashboard = () => {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("No authenticated user found");
        setCourses([]);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const enrolledCourses = userData.enrollment || [];

          const coursesWithProgress = enrolledCourses.map((course: EnrolledCourse) => ({
            ...course,
            progress: course.progress || 0,
          }));

          setCourses(coursesWithProgress);
        } else {
          console.log("No user document found");
          setCourses([]);
        }
      } catch (err) {
        console.error("Error fetching enrolled courses:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '70vh', paddingTop: '70px' }}>
          <div style={{ width: '100px', height: '100px' }}>
            <Lottie animationData={LoadingAnimaiton} loop={true} />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>DG Next - My Dashboard</title>
        <link rel="icon" href="/dglogo.ico" />
      </Head>

      <Header />

      <Container fluid className="min-vh-100 container" style={{ paddingTop: '120px', paddingBottom: '150px', backgroundColor: 'transparent' }}>

        <Row className="text-center mb-5 mb-4">
          <Col>
            <h1 className="display-4 fw-bold" style={{ color: '#2c3e50', fontSize: 25, letterSpacing: "1px" }}>
              Courses List
            </h1>
            <h2 style={{ fontFamily: "'Livvic', sans-serif", fontSize: 20 }} className="lead text-muted">Browse Courses. Build Your Future.</h2>
          </Col>
        </Row>
        <div className="container" style={{ minHeight: '00vh' }}>
          <h1 className="mb-4" style={{ fontSize: 35, letterSpacing: "1px", color: "#2c3e50", marginTop: 15, fontFamily: "'Acme', sans-serif" }}>My Dashboard</h1>

          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card shadow-sm" style={{ borderRadius: '15px' }}>
                <div className="card-body text-center">
                  <h5 className="card-title" style={{ fontFamily: "'Acme', sans-serif", color: "#2c3e50" }}>
                    <i className="bi bi-book me-2"></i>Courses Enrolled
                  </h5>
                  <h2 className="text-primary">{courses.length}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm" style={{ borderRadius: '15px' }}>
                <div className="card-body text-center">
                  <h5 className="card-title" style={{ fontFamily: "'Acme', sans-serif", color: "#2c3e50" }}>
                    <i className="bi bi-check-circle me-2"></i>Courses Completed
                  </h5>
                  <h2 className="text-primary">{courses.filter(course => course.progress === 100).length}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm" style={{ borderRadius: '15px' }}>
                <div className="card-body text-center">
                  <h5 className="card-title" style={{ fontFamily: "'Acme', sans-serif", color: "#2c3e50" }}>
                    <i className="bi bi-clock me-2"></i>Learning Hours
                  </h5>
                  <h2 className="text-primary">12</h2> {/* Placeholder - update with real data if available */}
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm" style={{ borderRadius: '15px' }}>
            <div className="card-header" style={{ backgroundColor: '#fff', borderBottom: '1px solid #dee2e6' }}>
              <h5 className="m-0" style={{ fontFamily: "'Acme', sans-serif", color: "#2c3e50", fontSize: 22 }}>
                <i className="bi bi-collection me-2"></i>My Courses
              </h5>
            </div>
            <div className="card-body">
              {courses.length === 0 ? (
                <div className="text-center py-5">
                  <p style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50" }}>No courses enrolled yet.</p>
                  <Link href="/courselist" className="btn btn-primary" style={{ borderRadius: '5px' }}>
                    <i className="bi bi-search me-2"></i>Explore Courses
                  </Link>
                </div>
              ) : (
                <div className="row g-4">
                  {courses.map((course) => (
                    <div key={course.courseId} className="col-md-6">
                      <div className="card h-100" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                        <div className="row g-0">
                          <div className="col-md-4" style={{ position: 'relative', height: '200px' }}>
                            <Image
                              src={course.thumbnail || '/fallback-image.jpg'}
                              alt={course.courseTitle}
                              fill
                              style={{ objectFit: 'cover', borderRadius: '10px 0 0 10px' }}
                              className="img-fluid"
                            />
                          </div>
                          <div className="col-md-8">
                            <div className="card-body">
                              <h5 className="card-title" style={{ fontFamily: "'Acme', sans-serif", color: "#2c3e50" }}>
                                {course.courseTitle}
                              </h5>
                              <p className="card-text" style={{ fontFamily: "'Livvic', sans-serif", color: "#666" }}>
                                Instructor: {course.instructor}
                              </p>
                              <div className="progress mb-3" style={{ height: '20px', borderRadius: '5px' }}>
                                <div
                                  className="progress-bar bg-success"
                                  role="progressbar"
                                  style={{ width: `${course.progress}%` }}
                                  aria-valuenow={course.progress}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                >
                                  {course.progress}%
                                </div>
                              </div>
                              <Link href={`/course/${course.courseId}/learn`}>
                                <button className="btn btn-success btn-lg w-100" style={{ height: 45, borderRadius: 10 }}>
                                  <i className="bi bi-play-circle me-2"></i> Start Learning
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>


      <Footer />
    </>
  );
};

export default Dashboard;