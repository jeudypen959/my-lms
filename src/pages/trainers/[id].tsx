'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import Head from 'next/head';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { Col, Container, Row } from 'react-bootstrap';
import Link from 'next/link';

interface Trainer {
    id: string;
    instructor: string;
    profile?: string;
    rating?: number | string;
    courseCount?: number;
    studentCount?: number;
    description?: string;
    skill?: string[];
    cover?: string;
    languages?: string[];
    education?: { degree: string; institution: string; year: string }[];
    experience?: { role: string; company: string; years: string }[];
    certifications?: string[];
    location?: string;
}

interface Session {
    title: string;
    date: string;
    time: string;
}

const TrainerDetail = () => {
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    const router = useRouter();

    const trainerId = params?.id as string;

    const fetchTrainerDetails = useCallback(async () => {
        if (!trainerId) {
            setError('No trainer ID provided in the URL');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const trainerRef = doc(db, 'trainers', trainerId);
            const trainerDoc = await getDoc(trainerRef);

            if (trainerDoc.exists()) {
                const trainerData: Trainer = {
                    id: trainerDoc.id,
                    ...(trainerDoc.data() as Omit<Trainer, 'id'>),
                };
                setTrainer(trainerData);
            } else {
                setError('Trainer not found');
            }
        } catch (err) {
            setError('Error fetching trainer details');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [trainerId]);

    useEffect(() => {
        fetchTrainerDetails();
    }, [fetchTrainerDetails]);

    const handleBackToTrainers = () => {
        router.push('/trainers');
    };

    const handleContactTrainer = () => {
        alert('Contact trainer functionality to be implemented');
    };

    const handleViewAllCourses = () => {
        router.push('/courselist');
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="container py-5">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="container py-5">
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                    <button className="btn btn-primary" onClick={handleBackToTrainers}>
                        Back to Trainers
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    if (!trainer) {
        return (
            <>
                <Header />
                <div className="container py-5">
                    <div className="alert alert-warning" role="alert">
                        Trainer not found
                    </div>
                    <button className="btn btn-primary" onClick={handleBackToTrainers}>
                        Back to Trainers
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    // Mock data for sessions
    const upcomingSessions: Session[] = [
        { title: "Web Development Workshop", date: "June 15, 2025", time: "9:00 AM - 12:00 PM" },
        { title: "React Deep Dive", date: "June 22, 2025", time: "2:00 PM - 5:00 PM" },
        { title: "JavaScript Q&A Session", date: "June 30, 2025", time: "7:00 PM - 8:30 PM" },
    ];

    return (
        <>
            <Head>
                <title>DG Next - Trainer Details</title>
                <link rel="icon" href="/dglogo.ico" />
            </Head>
            <Header />

            <Container style={{ paddingTop: '120px', paddingBottom: '50px' }}>
                <Row className="text-center mb-5 mb-4">
                    <Col>
                        <h1 className="display-4 fw-bold" style={{ color: '#2c3e50', fontSize: 25, letterSpacing: "1px" }}>
                            Trainer Details
                        </h1>
                        <h2 style={{ fontFamily: "'Livvic', sans-serif", fontSize: 20 }} className="lead text-muted">Cutting-Edge Insights into Artificial Intelligence</h2>
                    </Col>
                </Row>

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
                                Trainer List
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Trainer Header Section */}
                <div className=" mb-5" >
                    <div className="d-flex flex-column align-items-start">
                        <div className="d-flex align-items-start w-100">
                            <Image
                                src={trainer.profile || '/default-image.jpg'}
                                alt={trainer.instructor}
                                width={300}
                                height={300}
                                className="border me-4"
                                style={{ objectFit: 'cover', borderRadius: 20 }}
                                priority
                            />
                            <div className="flex-grow-1">
                                {/* Categories/Skills at the top */}
                                {trainer.skill && trainer.skill.length > 0 && (
                                    <div className="mb-3 d-flex gap-2 flex-wrap">
                                        {trainer.skill.map((skill, index) => (
                                            <span key={index} className="badge bg-teal text-white px-3 py-1">{skill}</span>
                                        ))}
                                    </div>
                                )}
                                <div className="mb-2">
                                    <h2 className="fw-bold text-dark mb-0">{trainer.instructor}</h2>
                                    <p className="text-muted mb-1">Web Development Lead</p>
                                </div>
                                <div className="d-flex align-items-center mb-3">
                                    <span className="text-warning me-2">
                                        {'★'.repeat(Math.floor(trainer.rating ? Number(trainer.rating) : 0))}
                                        {'☆'.repeat(5 - Math.floor(trainer.rating ? Number(trainer.rating) : 0))}
                                    </span>
                                    <span className="text-muted">
                                        ({trainer.rating ? Number(trainer.rating).toFixed(1) : 'N/A'} - {trainer.studentCount || 0} reviews)
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span className="text-muted">{trainer.courseCount || 0} courses</span>
                                    <span className="mx-2">•</span>
                                    <span className="text-muted">{trainer.studentCount || 0} students</span>
                                    <span className="mx-2">•</span>
                                    <span className="text-muted">{trainer.location || 'Location not specified'}</span>
                                </div>
                                <p className="text-muted mb-3">{trainer.description || 'No description available for this trainer.'}</p>
                                <div className="d-flex gap-3">
                                    <button className="btn btn-orange px-4 py-2" onClick={handleContactTrainer}>
                                        Contact Trainer
                                    </button>
                                    <button className="btn btn-outline-secondary px-4 py-2" onClick={handleViewAllCourses}>
                                        View All Courses
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Section */}
                <div className="row">
                    {/* Left Sidebar (70%) */}
                    <div className="col-md-8">
                        {/* Languages */}
                        <div className="mb-4">
                            <h5 className="fw-bold text-dark mb-3">LANGUAGES</h5>
                            <ul className="list-unstyled">
                                {trainer.languages?.map((language, index) => (
                                    <li key={index} className="d-flex align-items-center mb-2">
                                        <i className="bi bi-circle-fill text-primary me-2" style={{ fontSize: '8px' }}></i>
                                        <span>{language}</span>
                                    </li>
                                )) || <li className="text-muted">No languages specified</li>}
                            </ul>
                        </div>

                        {/* Education */}
                        <div className="mb-4">
                            <h5 className="fw-bold text-dark mb-3">EDUCATION</h5>
                            {trainer.education?.map((edu, index) => (
                                <div key={index} className="d-flex align-items-start mb-3">
                                    <i className="bi bi-mortarboard-fill text-primary me-2" style={{ fontSize: '20px' }}></i>
                                    <div>
                                        <p className="mb-0 fw-semibold">{edu.degree}</p>
                                        <p className="text-muted mb-0">{edu.institution} - {edu.year}</p>
                                    </div>
                                </div>
                            )) || <p className="text-muted">No education details available</p>}
                        </div>

                        {/* Professional Experience */}
                        <div className="mb-4">
                            <h5 className="fw-bold text-dark mb-3">PROFESSIONAL EXPERIENCE</h5>
                            {trainer.experience?.map((exp, index) => (
                                <div key={index} className="d-flex align-items-start mb-3">
                                    <i className="bi bi-briefcase-fill text-primary me-2" style={{ fontSize: '20px' }}></i>
                                    <div>
                                        <p className="mb-0 fw-semibold">{exp.role}</p>
                                        <p className="text-muted mb-0">{exp.company} - {exp.years}</p>
                                    </div>
                                </div>
                            )) || <p className="text-muted">No experience details available</p>}
                        </div>

                        {/* Certifications */}
                        <div className="mb-4">
                            <h5 className="fw-bold text-dark mb-3">CERTIFICATIONS</h5>
                            <ul className="list-unstyled">
                                {trainer.certifications?.map((cert, index) => (
                                    <li key={index} className="d-flex align-items-center mb-2">
                                        <i className="bi bi-check-circle-fill text-success me-2" style={{ fontSize: '16px' }}></i>
                                        <span>{cert}</span>
                                    </li>
                                )) || <li className="text-muted">No certifications specified</li>}
                            </ul>
                        </div>
                    </div>

                    {/* Right Section (30%) */}
                    <div className="col-md-4">
                        {/* Upcoming Sessions */}
                        <div className="card p-4 mb-4" style={{ borderRadius: '10px', border: '1px solid #e0e0e0' }}>
                            <h5 className="fw-bold text-dark mb-4">UPCOMING SESSIONS</h5>
                            {upcomingSessions.map((session, index) => (
                                <div key={index} className="d-flex align-items-center mb-3">
                                    <input type="checkbox" className="me-3" disabled />
                                    <div>
                                        <p className="fw-semibold mb-1">{session.title}</p>
                                        <p className="text-muted mb-0">
                                            <i className="bi bi-calendar3 me-2"></i>{session.date} • {session.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <button className="btn btn-orange w-100 mt-3" onClick={handleViewAllCourses}>
                                View All Events
                            </button>
                        </div>

                        {/* Contact Section */}
                        <div className="card p-4" style={{ borderRadius: '10px', border: '1px solid #e0e0e0' }}>
                            <h5 className="fw-bold text-dark mb-3">CONTACT {trainer.instructor.toUpperCase()}</h5>
                            <p className="text-muted mb-4">Have questions about courses or need personalized learning advice?</p>
                            <button className="btn btn-orange w-100" onClick={handleContactTrainer}>
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>
            </Container>

            <Footer />

            <style jsx global>{`
                .trainer-header {
                    background-color: #fff;
                    border: 1px solid #e0e0e0;
                    border-radius: 10px;
                }
                .badge.bg-teal {
                    background-color: #26a69a !important;
                    font-size: 14px;
                    font-weight: 500;
                }
                .btn-orange {
                    background-color: #f5a623;
                    color: white;
                    border: none;
                    font-weight: 600;
                    transition: background-color 0.3s ease;
                }
                .btn-orange:hover {
                    background-color: #e69520;
                }
                .btn-outline-secondary {
                    border-color: #6c757d;
                    color: #6c757d;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
                .btn-outline-secondary:hover {
                    background-color: #6c757d;
                    color: white;
                }
                h5.fw-bold {
                    font-size: 16px;
                    letter-spacing: 1px;
                }
                p.text-muted {
                    font-size: 14px;
                    lineHeight: 1.5;
                }
                .card {
                    background-color: #fff;
                    border: 1px solid #e0e0e0;
                    border-radius: 10px;
                }
                input[type="checkbox"]:disabled {
                    opacity: 0.5;
                }
            `}</style>
        </>
    );
};

export default TrainerDetail;