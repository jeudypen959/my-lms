import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import dgnextlogo from "@/assets/png/award.png";
import dgtralogo from "@/assets/png/Tra-DGAcademy.png";
import certificateBackground from "@/assets/png/backgound-certificate-1.png";
import { Col, Container, Row, Dropdown } from 'react-bootstrap';

interface Course {
    id: string;
    courseTitle: string;
    instructor?: string;
}

interface UserProgress {
    completedCourse: boolean;
    courseTitle: string;
    certificateGenerated?: boolean;
    certificateId?: string;
}

interface Html2CanvasOptions {
    useCORS?: boolean;
    scale?: number;
    width?: number;
    height?: number;
}

const Certificate = () => {
    const router = useRouter();
    const { id } = router.query;
    const [course, setCourse] = useState<Course | null>(null);
    const [userName, setUserName] = useState<string>('User Name');
    const [instructor, setInstructor] = useState<string>('Instructor Name');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const certificateRef = useRef<HTMLDivElement>(null);
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const generateCertificateId = () => {
        const prefix = 'DGNEXT-';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomPart = '';
        for (let i = 0; i < 8; i++) {
            randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return `${prefix}${randomPart}`;
    };

    useEffect(() => {
        const fetchCourseDetail = async () => {
            if (!id || typeof id !== 'string') {
                setError('No course ID provided');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const docRef = doc(db, 'courses', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const courseData = docSnap.data();
                    setCourse({
                        id: docSnap.id,
                        courseTitle: courseData.courseTitle || 'Untitled Course',
                        instructor: courseData.instructor,
                    });
                    setInstructor(courseData.instructor || 'Instructor Name');
                } else {
                    setError('Course not found');
                }
            } catch (err) {
                console.error('Error fetching course:', err);
                setError('Failed to load course data');
            } finally {
                setLoading(false);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserName(user.displayName || 'User Name');
                const progressDocId = `${user.uid}_${id}`;
                const progressRef = doc(db, 'userProgress', progressDocId);
                try {
                    const progressSnap = await getDoc(progressRef);
                    if (progressSnap.exists()) {
                        const data = progressSnap.data() as UserProgress;
                        if (!data.certificateGenerated) {
                            setError('Certificate not available. Please complete the course first.');
                            return;
                        }
                        if (!data.certificateId) {
                            const newCertificateId = generateCertificateId();
                            await setDoc(
                                progressRef,
                                { certificateId: newCertificateId },
                                { merge: true }
                            );
                        }
                    } else {
                        setError('Progress not found. Please complete the course to view the certificate.');
                    }
                } catch (err) {
                    console.error('Error fetching user progress:', err);
                    setError('Failed to load progress data');
                }
            } else {
                setError('Please sign in to view your certificate');
            }
        });

        fetchCourseDetail();
        return () => unsubscribe();
    }, [id]);

    const downloadPDF = async () => {
        if (!certificateRef.current) return;

        try {
            const options: Html2CanvasOptions = {
                useCORS: true,
                scale: 6, // Increased scale for higher resolution
                width: 794,
                height: 1123,
            };
            const canvas = await html2canvas(certificateRef.current, options);
            const imgData = canvas.toDataURL('image/png', 4.0); // Maximum quality
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: false, // Disable compression for maximum quality
            });
            const imgWidth = 210;
            const imgHeight = 297;
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'NONE'); // No compression
            pdf.save(`${course?.courseTitle}_Certificate.pdf`);
        } catch (err) {
            console.error('Error generating PDF:', err);
            setError('Failed to download PDF. Please try again.');
        }
    };

    const downloadPNG = async () => {
        if (!certificateRef.current) return;

        try {
            const options: Html2CanvasOptions = {
                useCORS: true,
                scale: 6, // Increased scale for higher resolution
                width: 794,
                height: 1123,
            };
            const canvas = await html2canvas(certificateRef.current, options);
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png', 1.0); // Maximum quality
            link.download = `${course?.courseTitle}_Certificate.png`;
            link.click();
        } catch (err) {
            console.error('Error generating PNG:', err);
            setError('Failed to download PNG. Please try again.');
        }
    };

    const downloadJPG = async () => {
        if (!certificateRef.current) return;

        try {
            const options: Html2CanvasOptions = {
                useCORS: true,
                scale: 6, // Increased scale for higher resolution
                width: 794,
                height: 1123,
            };
            const canvas = await html2canvas(certificateRef.current, options);
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/jpeg', 1.0); // Maximum quality
            link.download = `${course?.courseTitle}_Certificate.jpg`;
            link.click();
        } catch (err) {
            console.error('Error generating JPG:', err);
            setError('Failed to download JPG. Please try again.');
        }
    };

    const downloadSVG = async () => {
        if (!certificateRef.current) return;

        try {
            const options: Html2CanvasOptions = {
                useCORS: true,
                scale: 6, // Increased scale for higher resolution
                width: 794,
                height: 1123,
            };
            const canvas = await html2canvas(certificateRef.current, options);
            const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality
            const svg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123">
                    <image width="794" height="1123" href="${imgData}" style="image-rendering: crisp-edges;"/>
                </svg>`;
            const link = document.createElement('a');
            link.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
            link.download = `${course?.courseTitle}_Certificate.svg`;
            link.click();
        } catch (err) {
            console.error('Error generating SVG:', err);
            setError('Failed to download SVG. Please try again.');
        }
    };

    const printCertificate = async () => {
        if (!certificateRef.current) return;

        try {
            const options: Html2CanvasOptions = {
                useCORS: true,
                scale: 6, // Increased scale for higher resolution
                width: 794,
                height: 1123,
            };
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
                iframeDoc.write(`
                    <html>
                        <head>
                            <style>
                                body { margin: 0; }
                                img { width: 794px; height: 1123px; image-rendering: crisp-edges; }
                            </style>
                        </head>
                        <body>
                            <div id="certificate"></div>
                        </body>
                    </html>
                `);
                const canvas = await html2canvas(certificateRef.current, options);
                const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality
                const img = iframeDoc.createElement('img');
                img.src = imgData;
                iframeDoc.getElementById('certificate')?.appendChild(img);
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
                document.body.removeChild(iframe);
            }
        } catch (err) {
            console.error('Error printing certificate:', err);
            setError('Failed to print certificate. Please try again.');
        }
    };

    const shareCertificate = async () => {
        const shareUrl = `${window.location.origin}/certificate/${id}`;
        const shareData = {
            title: `Certificate of Completion - ${course?.courseTitle}`,
            text: `I completed the ${course?.courseTitle} course on DG Next!`,
            url: shareUrl,
        };

        try {
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareUrl);
                alert('Certificate link copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing certificate:', err);
            setError('Failed to share certificate. Link copied to clipboard.');
            await navigator.clipboard.writeText(shareUrl);
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
                <div
                    className="container text-center"
                    style={{ minHeight: '70vh', paddingTop: '90px' }}
                >
                    <div className="alert alert-danger mt-5" role="alert">
                        {error || 'No course data available'}
                    </div>
                    <Link
                        href="/coursedetail"
                        className="btn p-0 border-0 bg-transparent shadow-none text-decoration-none"
                        style={{
                            fontFamily: '"Livvic", sans-serif',
                            fontSize: 20,
                            color: '#6c757d',
                            transition: 'color 0.15s ease-in-out',
                        }}
                    >
                        <span className="d-flex align-items-center" style={{ fontSize: 20 }}>
                            <i className="bi bi-arrow-left me-3" style={{ fontSize: 20, marginRight: 10 }}></i>
                            Courses Details
                        </span>
                    </Link>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Head>
                <title>{`DG Next - Certificate - ${course.courseTitle}`}</title>
                <meta name="description" content={`Certificate for ${course.courseTitle}`} />
                <link rel="icon" href="/dglogo.ico" />
            </Head>

            <Header />

            <Container className="flex-grow-1" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
                <Row className="text-center mb-4">
                    <Col>
                        <h1 className="display-4 fw-bold" style={{ color: '#2c3e50', fontSize: 25, letterSpacing: "1px" }}>
                            Get Certificate
                        </h1>
                        <h2 style={{ fontFamily: "'Livvic', sans-serif", fontSize: 20 }} className="lead text-muted">
                            Learn Together, Lead Together: Mastering Group Communication for Real-World Impact
                        </h2>
                    </Col>
                </Row>
                <div
                    className="container d-flex flex-column justify-content-center align-items-center"
                    style={{ minHeight: '70vh', paddingTop: '30px', paddingBottom: '50px' }}
                >
                    <div
                        className="d-flex justify-content-between align-items-center mb-4"
                        style={{ maxWidth: '794px', width: '100%' }}
                    >
                        <Link
                            href={`/course/${course.id}`}
                            className="btn p-0 border-0 bg-transparent shadow-none text-decoration-none"
                            style={{
                                fontFamily: '"Livvic", sans-serif',
                                fontSize: 20,
                                color: '#6c757d',
                                transition: 'color 0.15s ease-in-out',
                            }}
                        >
                            <span className="d-flex align-items-center" style={{ fontSize: 20 }}>
                                <i className="bi bi-arrow-left me-3" style={{ fontSize: 20, marginRight: 10 }}></i>
                                Courses Details
                            </span>
                        </Link>
                        <div className="d-flex align-items-center gap-3">
                            <Dropdown>
                                <Dropdown.Toggle
                                    variant="primary"
                                    style={{
                                        fontFamily: "'Livvic', sans-serif",
                                        fontSize: '16px',
                                        letterSpacing: '1px',
                                        backgroundColor: '#2c3e50',
                                        borderColor: '#2c3e50',
                                        minWidth: '120px',
                                        padding: '6px 12px',
                                        height: '38px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    Download
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={downloadPDF}>PDF</Dropdown.Item>
                                    <Dropdown.Item onClick={downloadPNG}>PNG</Dropdown.Item>
                                    <Dropdown.Item onClick={downloadJPG}>JPG</Dropdown.Item>
                                    <Dropdown.Item onClick={downloadSVG}>SVG</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <button
                                className="btn btn-primary"
                                style={{
                                    fontFamily: "'Livvic', sans-serif",
                                    fontSize: '16px',
                                    backgroundColor: '#F47834',
                                    borderColor: '#F47834',
                                    minWidth: '50px',
                                    padding: '6px 12px',
                                    height: '38px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onClick={shareCertificate}
                                title="Share Certificate"
                            >
                                <i className="bi bi-share-fill"></i>
                            </button>
                            <button
                                className="btn btn-primary"
                                style={{
                                    fontFamily: "'Livvic', sans-serif",
                                    fontSize: '16px',
                                    backgroundColor: '#17a2b8',
                                    borderColor: '#17a2b8',
                                    minWidth: '50px',
                                    padding: '6px 12px',
                                    height: '38px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onClick={printCertificate}
                                title="Print Certificate"
                            >
                                <i className="bi bi-printer-fill"></i>
                            </button>
                        </div>
                    </div>

                    {/* Certificate content */}
                    <div
                        ref={certificateRef}
                        style={{
                            width: '794px',
                            height: '1123px',
                            backgroundImage: `url(${certificateBackground.src})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '40px',
                            boxSizing: 'border-box',
                            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                            imageRendering: 'crisp-edges', // Ensure sharp rendering
                            transform: 'scale(1)', // Avoid browser scaling issues
                        }}
                    >
                        <div className="mb-4">
                            <Image
                                src={dgnextlogo}
                                alt="DG Next Logo"
                                style={{ margin: '0 auto', marginBottom: 10 }}
                            />
                        </div>
                        <h1
                            style={{
                                fontFamily: "'Acme', sans-serif",
                                color: '#2c3e50',
                                fontSize: '30px',
                                marginBottom: '20px',
                                textAlign: 'center',
                            }}
                        >
                            CERTIFICATE OF COMPLETION
                        </h1>
                        <p
                            style={{
                                fontFamily: "'Livvic', sans-serif",
                                fontSize: '20px',
                                color: '#2c3e50',
                                marginBottom: '20px',
                                fontWeight: 400,
                                textAlign: 'center',
                            }}
                        >
                            This is to certify that
                        </p>
                        <h2
                            style={{
                                fontFamily: "'Acme', sans-serif",
                                color: '#2c3e50',
                                fontSize: '30px',
                                marginBottom: '20px',
                                textAlign: 'center',
                                marginTop: 25,
                            }}
                        >
                            {userName}
                        </h2>
                        <p
                            style={{
                                fontFamily: "'Livvic', sans-serif",
                                fontSize: '20px',
                                color: '#2c3e50',
                                marginBottom: '0px',
                                textAlign: 'center',
                                fontWeight: 400,
                            }}
                        >
                            successfully completed the DG Next in
                        </p>
                        <h3
                            style={{
                                fontFamily: "'Acme', sans-serif",
                                color: '#F37932',
                                fontSize: '40px',
                                paddingRight: 30,
                                paddingLeft: 30,
                                marginBottom: 45,
                                textAlign: 'center',
                                marginTop: 45,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: '1.2',
                                minHeight: '84px',
                            }}
                        >
                            {course.courseTitle}
                        </h3>
                        <p
                            style={{
                                fontFamily: "'Livvic', sans-serif",
                                fontSize: '20px',
                                color: '#2c3e50',
                                marginBottom: '0px',
                                textAlign: 'center',
                                fontWeight: 400,
                            }}
                        >
                            Phnom Penh, Cambodia, {currentDate}
                        </p>
                        <div
                            style={{
                                textAlign: 'center',
                                marginTop: '20px',
                            }}
                        >
                            <p
                                style={{
                                    fontFamily: "'Livvic', sans-serif",
                                    fontSize: '20px',
                                    color: '#2c3e50',
                                    marginBottom: '20px',
                                    textAlign: 'center',
                                    fontWeight: 400,
                                }}
                            >
                                Facilitated by
                            </p>
                            <div
                                style={{
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '20px',
                                    marginTop: '10px',
                                    paddingBottom: 100,
                                }}
                            >
                                <h4
                                    style={{
                                        fontFamily: "'Acme', sans-serif",
                                        color: '#2c3e50',
                                        fontSize: '24px',
                                        margin: '0',
                                        position: 'absolute',
                                        left: '-25%', // Position instructor name 5% from the left
                                    }}
                                >
                                    {instructor}
                                </h4>
                                <Image
                                    src={dgtralogo}
                                    alt="DG Tra Logo"
                                    width={150}
                                    height={98}
                                    style={{ position: 'relative', left: '25%' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Container>

            <Footer />
        </>
    );
};

export default Certificate;