import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import successAnimation from '@/assets/animation/success.json';
import { getAuth } from 'firebase/auth';
import { Col, Container, Row } from 'react-bootstrap';
import { recordEnrollment } from '@/utils/paymentUtils';
import ABAPaypng from "@/assets/png/ABA BANK (1).png";

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

// Define TypeScript interfaces
interface Module {
    id: string;
    title: string;
    content?: string;
}

interface Course {
    id: string;
    courseTitle: string;
    description: string;
    price: number;
    duration: string;
    instructor: string;
    level: string;
    thumbnail: string;
    modules?: Module[];
    categories?: string;
}

export default function PaymentPage() {
    const router = useRouter();
    const { id } = router.query;

    const [course, setCourse] = useState<Course | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('aba');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourseData = async () => {
            if (!id) return;

            setLoading(true);
            try {
                const docRef = doc(db, 'courses', id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setCourse({
                        id: docSnap.id,
                        ...docSnap.data(),
                        price: Number(docSnap.data().price) || 0,
                    } as Course);
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

        fetchCourseData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setError('');

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setSuccess(true);
            await recordEnrollment(course!);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Payment processing failed. Please try again.';
            setError(errorMessage);
            console.error('Error during form submission:', err);
        } finally {
            setProcessing(false);
        }
    };

    const handleABAPayment = async () => {
        setProcessing(true);
        setError('');

        const transactionId = `DG-${course?.id}-${Date.now()}`;
        const payload = {
            tran_id: transactionId,
            amount: course?.price.toFixed(2),
            merchant_id: 'dgacademy',
            currency: 'USD',
            description: `Payment for ${course?.courseTitle}`,
            return_url: `${window.location.origin}/payment-success?courseId=${course?.id}`,
            cancel_url: `${window.location.origin}/payment-cancel?courseId=${course?.id}`,
            firstname: getAuth().currentUser?.displayName || 'Unknown User',
            email: getAuth().currentUser?.email || '',
        };

        try {
            console.log('Sending request to /api/payway with payload:', payload);
            const response = await fetch('/api/payway', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            console.log('Response status:', response.status, response.statusText);

            if (!response.ok) {
                const text = await response.text();
                console.error('API response:', text);
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log('API result:', result);

            if (result.status === 0 && result.payment_url) {
                window.location.href = result.payment_url;
            } else {
                throw new Error(result.message || 'Payment initiation failed');
            }
        } catch (err) {
            console.error('Error initiating payment:', err);
            setError(`Payment failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
            setProcessing(false);
        }
    };

    const handleContinueToPayment = () => {
        if (paymentMethod === 'aba') {
            handleABAPayment();
        } else if (paymentMethod === 'khqr') {
            handleSubmit({ preventDefault: () => { } } as React.FormEvent);
        } else {
            alert('Credit/Debit card payment is not yet implemented');
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div
                    className="container d-flex justify-content-center align-items-center"
                    style={{ minHeight: '70vh', paddingTop: '90px' }}
                >
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
                    <div className="alert alert-danger mt-5" role="alert">
                        {error || 'Course not found'}
                    </div>
                    <Link
                        href={id ? `/course/${id}` : '/courselist'}
                        passHref
                        className="mt-3"
                        style={{ border: '0px solid #fff' }}
                    >
                        Back to Course Details
                    </Link>
                </div>
                <Footer />
            </>
        );
    }

    if (success) {
        return (
            <>
                <Head>
                    <title>DG Next - Payment - {course.courseTitle} Successful</title>
                    <meta name="description" content={`Purchase ${course.courseTitle} online course`} />
                    <link rel="icon" href="/dglogo.ico" />
                </Head>

                <Header />

                <Container fluid className="min-vh-100 container" style={{ paddingTop: '120px', paddingBottom: '150px', backgroundColor: 'transparent' }}>
                    <Row className="text-center mb-5 mb-4">
                        <Col>
                            <h1 className="display-4 fw-bold" style={{ color: '#2c3e50', fontSize: 25, letterSpacing: '1px' }}>
                                Payment Successful!
                            </h1>
                            <h2 style={{ fontFamily: "'Livvic', sans-serif", fontSize: 20 }} className="lead text-muted">Payment Confirmed — Your Learning Journey Begins Now.</h2>
                        </Col>
                    </Row>
                    <div
                        className="container d-flex justify-content-center align-items-center"
                        style={{ minHeight: '35vh', padding: '0px 0' }}
                    >
                        <div className="row w-100 my-0">
                            <div className="col-lg-8 col-md-10 col-12 mx-auto">
                                <div className="alert alert-success text-center p-3" role="alert" style={{ borderRadius: 25 }}>
                                    <Lottie
                                        animationData={successAnimation}
                                        style={{ width: 250, height: 250, margin: '0 auto' }}
                                    />
                                    <p
                                        className="text-center mb-2"
                                        style={{ fontFamily: "'Livvic', sans-serif", fontWeight: 300, padding: 20 }}
                                    >
                                        Thank you for purchasing{' '}
                                        <strong style={{ fontWeight: 600 }}>{course.courseTitle}</strong>. You will
                                        receive an email with your course access details shortly.
                                    </p>
                                    <hr />
                                    <div className="d-flex justify-content-center">
                                        <Link href="/dashboard" passHref className="btn btn-outline-success" style={{ borderRadius: 10 }}>
                                            Go to My Courses
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>

                <Footer />
            </>
        );
    }

    return (
        <>
            <Head>
                <title>DG Next | Payment - {course.courseTitle}</title>
                <meta name="description" content={`Purchase ${course.courseTitle} online course`} />
                <link rel="icon" href="/dglogo.ico" />
            </Head>

            <Header />

            <Container fluid className="min-vh-100 container" style={{ paddingTop: '120px', paddingBottom: '0px', backgroundColor: 'transparent' }}>
                <Row className="text-center mb-5">
                    <Col>
                        <h1 className="display-4 fw-bold" style={{ color: '#2c3e50', fontSize: 25, letterSpacing: '1px' }}>
                            Checkout Payment
                        </h1>
                        <h2 style={{ fontFamily: "'Livvic', sans-serif", fontSize: 20 }} className="lead text-muted">Secure Your Spot — Complete Your Payment with Confidence.</h2>
                    </Col>
                </Row>

                <div className="container" style={{ paddingBottom: '100px' }}>
                    <div className="row mb-4 align-items-center">
                        <div className="col-4">
                            <Link
                                href={`/course/${course.id}`}
                                passHref
                                className="btn"
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
                                    Courses Details
                                </span>
                            </Link>
                        </div>
                        <div className="col-4 text-center">
                            <h1
                                className="mb-0"
                                style={{ fontSize: 25, letterSpacing: '1px', color: '#2c3e50' }}
                            ></h1>
                        </div>
                        <div className="col-4"></div>
                    </div>

                    <div className="row">
                        <div className="col-lg-12 mx-auto">
                            {error && <div className="alert alert-danger">{error}</div>}

                            <div
                                className="card mb-4 bg-white pt-4 pb-4"
                                style={{ borderRadius: '25px', border: '1px solid #2c3e503a', padding: 20 }}
                            >
                                <div className="card-body">
                                    <Row>
                                        {/* Left Column: Course Details */}
                                        <Col lg={6} md={12} className="d-flex flex-column align-items-start">
                                            <div
                                                style={{
                                                    borderRadius: '10px',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.041)',
                                                    width: '100%',
                                                    maxWidth: '500px',
                                                    marginBottom: '20px',
                                                }}
                                            >
                                                <Image
                                                    src={course.thumbnail}
                                                    alt={course.courseTitle}
                                                    width={300}
                                                    height={200}
                                                    layout="responsive"
                                                    objectFit="cover"
                                                    style={{ width: '100%', height: 'auto' }}
                                                />
                                            </div>
                                            <div>
                                                <h5
                                                    style={{
                                                        fontFamily: "'Acme', sans-serif",
                                                        color: '#2c3e50',
                                                        fontSize: 25,
                                                    }}
                                                >
                                                    {course.courseTitle}
                                                </h5>
                                                <div className="d-flex flex-column">
                                                    <div
                                                        className="p-2"
                                                        style={{
                                                            letterSpacing: '1px',
                                                            fontFamily: "'Acme', sans-serif",
                                                            fontSize: 20,
                                                            color: '#2c3e50',
                                                            fontWeight: 200,
                                                        }}
                                                    >
                                                        <i
                                                            className="bi bi-person-fill me-1"
                                                            style={{ color: '#2c3e50', height: 30, width: 30 }}
                                                        ></i>{' '}
                                                        {course.instructor}
                                                    </div>
                                                    <h3
                                                        className="mb-0"
                                                        style={{ fontFamily: "'Acme', sans-serif", color: '#F3894B' }}
                                                    >
                                                        <i className="bi bi-coin me-1"></i>
                                                        {course.price === 0 ? 'Free' : course.price.toFixed(2)}
                                                    </h3>
                                                </div>
                                            </div>
                                        </Col>

                                        {/* Right Column: Payment Methods */}
                                        <Col lg={6} md={12}>
                                            <div
                                                className="bg-white"
                                                style={{ borderRadius: '15px', border: '1px solid #2c3e503a', padding: 25 }}
                                            >
                                                <div style={{ textAlign: 'center' }}>
                                                    <h5
                                                        className="m-0"
                                                        style={{ fontFamily: "'Acme', sans-serif", color: '#2c3e50' }}
                                                    >
                                                        Choose payment method
                                                    </h5>
                                                </div>
                                                <div className="card-body">
                                                    <div className="payment-method-container my-4">
                                                        {/* ABA Pay Option */}
                                                        <div
                                                            className={`payment-option mb-3 ${paymentMethod === 'aba' ? 'selected' : ''}`}
                                                            onClick={() => setPaymentMethod('aba')}
                                                            style={{
                                                                border: `1px solid ${paymentMethod === 'aba' ? '#2c3e50' : '#e5e7eb'}`,
                                                                borderRadius: '15px',
                                                                padding: '10px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                cursor: 'pointer',
                                                                backgroundColor: paymentMethod === 'aba' ? '#f0f9ff' : '#f9fafb',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            <div className="d-flex align-items-center">
                                                                <Image
                                                                    src={ABAPaypng}
                                                                    width={50}
                                                                    height={50}
                                                                    alt="ABA Pay"
                                                                    style={{ borderRadius: 10, marginRight: 15 }}
                                                                />
                                                                <span style={{ fontWeight: '500', fontSize: '16px' }}>
                                                                    ABA Pay
                                                                    <br />
                                                                    <span style={{ fontFamily: "'Livvic', sans-serif" }}>Scan with any bank app.</span>
                                                                </span>
                                                            </div>
                                                            <div
                                                                className="radio-button"
                                                                style={{
                                                                    width: '20px',
                                                                    height: '20px',
                                                                    borderRadius: '50%',
                                                                    border: `2px solid ${paymentMethod === 'aba' ? '#2c3e50' : '#d1d5db'}`,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    marginRight: 10,
                                                                }}
                                                            >
                                                                {paymentMethod === 'aba' && (
                                                                    <div
                                                                        style={{
                                                                            width: '10px',
                                                                            height: '10px',
                                                                            borderRadius: '50%',
                                                                            backgroundColor: '#2c3e50'
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* KHQR Option */}
                                                        {/* <div
                                                            className={`payment-option mb-3 ${paymentMethod === 'khqr' ? 'selected' : ''}`}
                                                            onClick={() => setPaymentMethod('khqr')}
                                                            style={{
                                                                border: `1px solid ${paymentMethod === 'khqr' ? '#2c3e50' : '#e5e7eb'}`,
                                                                borderRadius: '15px',
                                                                padding: '10px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                cursor: 'pointer',
                                                                backgroundColor: paymentMethod === 'khqr' ? '#f0f9ff' : '#f9fafb',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            <div className="d-flex align-items-center">
                                                                <Image
                                                                    src={KHQRpng}
                                                                    width={60}
                                                                    height={40}
                                                                    alt="ABA Pay"
                                                                    style={{borderRadius: 10, marginRight: 15}}
                                                                />
                                                                <span style={{ fontWeight: '500', fontSize: '16px' }}>KHQR</span>
                                                            </div>
                                                            <div
                                                                className="radio-button"
                                                                style={{
                                                                    width: '20px',
                                                                    height: '20px',
                                                                    borderRadius: '50%',
                                                                    border: `2px solid ${paymentMethod === 'khqr' ? '#2c3e50' : '#d1d5db'}`,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    marginRight: 10,
                                                                }}
                                                            >
                                                                {paymentMethod === 'khqr' && (
                                                                    <div
                                                                        style={{
                                                                            width: '10px',
                                                                            height: '10px',
                                                                            borderRadius: '50%',
                                                                            backgroundColor: '#2c3e50'
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>
                                                        </div> */}

                                                        {/* Credit/Debit Card Option */}
                                                        {/* <div
                                                            className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}
                                                            onClick={() => setPaymentMethod('card')}
                                                            style={{
                                                                border: `1px solid ${paymentMethod === 'card' ? '#2c3e50' : '#e5e7eb'}`,
                                                                borderRadius: '15px',
                                                                padding: '10px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                cursor: 'pointer',
                                                                backgroundColor: paymentMethod === 'card' ? '#f0f9ff' : '#f9fafb',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            <div className="d-flex align-items-center">
                                                                <Image
                                                                    src={Creditcardpng}
                                                                    width={50}
                                                                    height={50}
                                                                    alt="ABA Pay"
                                                                    style={{ borderRadius: 10, marginRight: 15 }}
                                                                />
                                                                <span style={{ fontWeight: '500', fontSize: '16px' }}>Credit/Debit Card</span>
                                                            </div>
                                                            <div
                                                                className="radio-button"
                                                                style={{
                                                                    width: '20px',
                                                                    height: '20px',
                                                                    borderRadius: '50%',
                                                                    border: `2px solid ${paymentMethod === 'card' ? '#2c3e50' : '#d1d5db'}`,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    marginRight: 10,
                                                                }}
                                                            >
                                                                {paymentMethod === 'card' && (
                                                                    <div
                                                                        style={{
                                                                            width: '10px',
                                                                            height: '10px',
                                                                            borderRadius: '50%',
                                                                            backgroundColor: '#2c3e50'
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>
                                                        </div> */}
                                                    </div>

                                                    <div className="d-grid mt-4">
                                                        <button
                                                            className="btn search-btn"
                                                            onClick={handleContinueToPayment}
                                                            disabled={processing}
                                                            style={{
                                                                fontFamily: "'Livvic', sans-serif",
                                                                fontSize: '16px',
                                                                letterSpacing: '1px',
                                                                width: '100%',
                                                                color: 'white',
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            {processing ? 'Processing...' : 'Pay Now'}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="card-footer text-center text-muted pt-3">
                                                    <small>Your payment information is secure and encrypted</small>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>

            <Footer />
        </>
    );
}