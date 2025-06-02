import Head from 'next/head';
import React, { useEffect, useState, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Image from 'next/image';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/config/firebaseConfig';
import Link from 'next/link';
import NothingLottie from '@/assets/animation/nothing-found.json';
import { onAuthStateChanged } from 'firebase/auth';
import dynamic from 'next/dynamic';
import SearchBar from '@/components/SearchBar/SearchBar';
import { Col, Container, Row, Form } from 'react-bootstrap';

const Lottie = dynamic(() => import('lottie-react'), {
    ssr: false
});

// Define proper interfaces for TypeScript
interface Course {
    id: string;
    courseTitle: string;
    instructor: string;
    price: number;
    duration: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    categories: string;
    thumbnail: string;
    profileimg: string;
    featured?: boolean;
    isEnrolled?: boolean;
    description?: string;
}

interface Enrollment {
    courseId: string;
    enrollmentDate?: Date | string;
    status?: string;
}

interface PaginationProps {
    totalItems: number;
    itemsPerPage?: number;
    currentPage: number;
    setCurrentPage: (page: number) => void;
}

const Pagination = ({ totalItems, itemsPerPage = 8, currentPage, setCurrentPage }: PaginationProps) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const getPageNumbers = () => {
        const pages = [];
        pages.push(1);

        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            if (i === 2 && currentPage > 3) {
                pages.push('...');
            } else if (i === totalPages - 1 && currentPage < totalPages - 2) {
                pages.push('...');
            } else {
                pages.push(i);
            }
        }

        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo(0, 0);
        }
    };

    return (
        <nav className="mt-5" style={{ padding: '0px' }}>
            <ul className="pagination justify-content-center custom-pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="page-link custom-page-link"
                        style={{ borderRadius: 10, backgroundColor: "transparent", border: "0px solid #fff", fontSize: 22 }}
                        disabled={currentPage === 1}
                    >
                        « Previous
                    </button>
                </li>

                {getPageNumbers().map((page, index) => (
                    <li key={index} className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}>
                        {page === '...' ? (
                            <span className="page-link custom-page-link">...</span>
                        ) : (
                            <button
                                onClick={() => handlePageChange(page as number)}
                                className="page-link custom-page-link"
                            >
                                {page}
                            </button>
                        )}
                    </li>
                ))}

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="page-link custom-page-link"
                        style={{ borderRadius: 10, backgroundColor: "transparent", border: "0px solid #fff", fontSize: 22 }}
                        disabled={currentPage === totalPages}
                    >
                        Next »
                    </button>
                </li>
            </ul>
        </nav>
    );
};

const CoursesSection = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [userId, setUserId] = useState<string | null>(null);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
    const itemsPerPage = 8;

    const categories = ['All', 'AI', 'Leadership', 'Innovation', 'Strategy', 'Finance', 'Selling', 'Communication'];

    // Check user's enrollment status for courses
    const checkEnrollmentStatus = useCallback(async (uid: string) => {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                const enrollments: Enrollment[] = userData.enrollment || [];
                const enrolledIds = enrollments.map(enrollment => enrollment.courseId);
                setEnrolledCourseIds(enrolledIds);

                setCourses(prevCourses =>
                    prevCourses.map(course => ({
                        ...course,
                        isEnrolled: enrolledIds.includes(course.id)
                    }))
                );
            }
        } catch (error) {
            console.error("Error checking enrollment status:", error);
        }
    }, []);

    // Function to refresh enrollment status
    const refreshEnrollmentStatus = useCallback(() => {
        if (userId) {
            checkEnrollmentStatus(userId);
        }
    }, [userId, checkEnrollmentStatus]);

    useEffect(() => {
        // Set up authentication listener
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                checkEnrollmentStatus(user.uid);
            } else {
                setUserId(null);
                setEnrolledCourseIds([]);
            }
        });

        // Clean up subscription on unmount
        return () => unsubscribe();
    }, [checkEnrollmentStatus]);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, "courses"));
                const coursesList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    price: Number(doc.data().price) || 0,
                    categories: doc.data().categories || '',
                    isEnrolled: enrolledCourseIds.includes(doc.id)
                })) as Course[];

                if (activeCategory === 'All') {
                    setCourses(coursesList);
                } else {
                    setCourses(coursesList.filter(course =>
                        course.categories && course.categories === activeCategory
                    ));
                }
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
        setCurrentPage(1);
    }, [activeCategory, enrolledCourseIds]);

    useEffect(() => {
        const searchFiltered = courses.filter(course =>
            course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredCourses(searchFiltered);

        if (searchQuery) {
            setCurrentPage(1);
        }
    }, [courses, searchQuery]);

    // Refresh enrollment status when component mounts or when URL has query params
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('payment') === 'success' && userId) {
                refreshEnrollmentStatus();
            }
        }
    }, [userId, refreshEnrollmentStatus]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setActiveCategory(e.target.value);
    };

    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCourses.slice(startIndex, startIndex + itemsPerPage);
    };

    // Get category color based on category name
    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            'AI': '#3498db',
            'Leadership': '#3498db',
            'Innovation': '#3498db',
            'Strategy': '#3498db',
            'Finance': '#3498db',
            'Selling': '#3498db',
            'Communication': '#3498db'
        };
        return colors[category] || '#6c757d';
    };

    return (
        <div className="container" style={{ paddingBottom: 100 }}>
            {/* Course Stats and Filter Section */}
            <div className="row mb-4 align-items-center">
                <div className="col-md-9 col-sm-8">
                    <SearchBar placeholder="Explore courses..." onSearch={setSearchQuery} />
                </div>
                <div className="col-md-3 col-sm-4">
                    <Form.Group>
                        <Form.Select
                            value={activeCategory}
                            onChange={handleCategoryChange}
                            className="form-select custom-select"
                            style={{
                                borderRadius: 10,
                                height: '38px',
                                fontSize: '16px',
                                fontFamily: "'Acme', sans-serif",
                                border: '1px solid #2c3e50',
                                boxShadow: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </div>
            </div>

            {/* Course Stats */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 style={{ color: '#2c3e50', fontFamily: "'Acme', sans-serif" }}>
                            {filteredCourses.length} Course{filteredCourses.length !== 1 ? 's' : ''} Found
                        </h5>
                        {activeCategory !== 'All' && (
                            <span 
                                className="badge"
                                style={{ 
                                    backgroundColor: getCategoryColor(activeCategory),
                                    fontSize: '14px',
                                    padding: '8px 16px'
                                }}
                            >
                                {activeCategory}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="row g-4">
                {loading ? (
                    <div className="col-12 text-center py-5">
                        <div className="spinner-border" style={{ color: '#2c3e50' }} role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3" style={{ color: '#2c3e50', fontFamily: "'Acme', sans-serif" }}>
                            Loading courses...
                        </p>
                    </div>
                ) : getCurrentPageItems().length === 0 ? (
                    <div className="col-12 text-center py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                        <div className="text-center">
                            <Lottie
                                animationData={NothingLottie}
                                loop={true}
                                style={{ width: 200, height: 200, marginBottom: 20 }}
                            />
                            <h4 style={{ fontFamily: "'Carter One', cursive", color: "#2c3e50", marginBottom: '1rem' }}>
                                No courses found
                            </h4>
                            <p style={{ color: "#6c757d" }}>
                                Try adjusting your search or filter criteria
                            </p>
                        </div>
                    </div>
                ) : (
                    getCurrentPageItems().map((course, index) => (
                        <div key={index} className="col-md-6 col-lg-3">
                            <div
                                className="card h-100 custom-card enhanced-card"
                                style={{
                    borderRadius: "15px",
                    overflow: "hidden",
                    border: "1px solid #bdbdbd",
                  }}
                            >
                                <div className="position-relative" style={{ overflow: 'hidden' }}>
                                    <div className="thumbnail-container">
                                        <Image
                                            src={course.thumbnail}
                                            alt={course.courseTitle}
                                            width={400}
                                            height={200}
                                            layout="responsive"
                                            objectFit="cover"
                                            className="card-img-top thumbnail-image"
                                            style={{ borderRadius: '5px 5px 0 0', padding: 0 }}
                                        />
                                    </div>
                                    <div
                                        className="position-absolute"
                                        style={{
                                            top: 15,
                                            right: 15,
                                            backgroundColor: "#2c3e50",
                                            padding: "6px 12px",
                                            borderRadius: 10,
                                        }}
                                    >
                                        <h5 className="mb-0" style={{
                                            color: "#fff",
                                            fontFamily: "'Acme', sans-serif",
                                            fontSize: 16
                                        }}>
                                            {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                                        </h5>
                                    </div>
                                </div>
                                
                                <div className="card-body" style={{ padding: '20px' }}>
                                    {course.featured && (
                                        <span className="badge mb-2" style={{ backgroundColor: '#ffd700', color: '#000' }}>
                                            ⭐ Featured
                                        </span>
                                    )}
                                    
                                    <div style={{ display: "inline-block", marginBottom: '0px' }}>
                                        <span style={{
                                            backgroundColor: getCategoryColor(course.categories),
                                            color: "#fff",
                                            padding: '4px 15px',
                                            borderRadius: 8,
                                            fontSize: '15px',
                                            letterSpacing: "1px",
                                            fontFamily: "'Livvic', sans-serif",
                                            fontWeight: 'bold'
                                        }}>
                                            {course.categories}
                                        </span>
                                    </div>
                                    
                                    <h5
                                        className="mt-2"
                                        style={{
                                            color: "#2c3e50",
                                            fontFamily: "'Acme', sans-serif",
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            minHeight: '3em',
                                            lineHeight: '1.3em',
                                            margin: 0,
                                            fontSize: '18px'
                                        }}
                                    >
                                        {course.courseTitle}
                                    </h5>
                                    
                                    <div
                                        className="card-text"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontFamily: "'Livvic', sans-serif",
                                            fontWeight: 400,
                                            color: "#2c3e50",
                                            marginTop: 5,
                                            marginBottom: 20
                                        }}
                                    >
                                        <Image
                                            src={course.profileimg}
                                            alt={`${course.instructor}'s profile`}
                                            width={40}
                                            height={40}
                                            style={{
                                                borderRadius: '50%',
                                                marginRight: 10,
                                                objectFit: 'cover',
                                                border: '2px solid #bdbdbd'
                                            }}
                                        />
                                        <span style={{ color: "#2c3e50", fontSize: '14px' }}>
                                            {course.instructor}
                                        </span>
                                    </div>

                                    {course.isEnrolled ? (
                                        <Link href={`/course/${course.id}/learn`} passHref style={{ display: 'block', width: '100%' }}>
                                            <button
                                                style={{
                                                    fontFamily: "'Livvic', sans-serif",
                                                    fontSize: "16px",
                                                    width: "100%",
                                                    letterSpacing: "1px",
                                                    backgroundColor: "#198754",
                                                    borderColor: "#198754",
                                                }}
                                                className="btn search-btn"
                                            >
                                                <i className="bi bi-play-circle me-2"></i> Continue Learning
                                            </button>
                                        </Link>
                                    ) : (
                                        <Link href={`/payment/${course.id}`} passHref style={{ display: 'block', width: '100%' }}>
                                            <button
                                                style={{ 
                                                    fontFamily: "'Livvic', sans-serif", 
                                                    fontSize: "16px", 
                                                    width: "100%", 
                                                    letterSpacing: "1px",
                                                    color: 'white',
                                                }}
                                                className="btn search-btn"
                                            >
                                                Enroll Now!
                                            </button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Conditionally render Pagination only when filteredCourses.length > 0 */}
            {filteredCourses.length > 0 && filteredCourses.length > itemsPerPage && (
                <Pagination
                    totalItems={filteredCourses.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            )}

            <style jsx global>{`
                .thumbnail-container {
                    overflow: hidden;
                }
                
                .thumbnail-image {
                    transition: transform 0.4s ease;
                }
                
                .enhanced-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(44, 62, 80, 0.2);
                    border-color: #2c3e50;
                }
                
                .enhanced-card:hover .thumbnail-image {
                    transform: scale(1.1);
                }
                
                .custom-select {
                    transition: all 0.3s ease;
                }
                
                .custom-select:focus {
                    border-color: #2c3e50;
                    box-shadow: 0 0 0 0.25rem rgba(44, 62, 80, 0.25);
                }

                .enroll-btn:hover {
                    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(44, 62, 80, 0.3);
                }

                .custom-pagination .page-link {
                    color: #2c3e50;
                    border: 1px solid #2c3e50;
                    margin: 0 3px;
                    border-radius: 8px;
                }

                .custom-pagination .page-item.active .page-link {
                    background-color: #2c3e50;
                    border-color: #2c3e50;
                }

                .custom-pagination .page-link:hover {
                    color: white;
                    background-color: #2c3e50;
                    border-color: #2c3e50;
                }
            `}</style>
        </div>
    );
};

export default function CourseList() {
    return (
        <>
            <Head>
                <title>DG Next - Course Listing</title>
                <link rel="icon" href="/dglogo.ico" />
            </Head>
            <Header />
            <Container fluid className="min-vh-100 container" style={{ paddingTop: '120px', paddingBottom: '0px', backgroundColor: 'transparent' }}>
                <Row className="text-center mb-5 mb-4">
                    <Col>
                        <h1 className="display-4 fw-bold" style={{ color: '#2c3e50', fontSize: 25, letterSpacing: "1px" }}>
                            Courses List
                        </h1>
                        <h2 style={{ fontFamily: "'Livvic', sans-serif", fontSize: 20 }} className="lead text-muted">Browse Courses. Build Your Future.</h2>
                    </Col>
                </Row>
                <CoursesSection />
            </Container>
            <Footer />
        </>
    );
}