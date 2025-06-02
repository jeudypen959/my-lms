import Footer from '@/components/Footer/Footer';
import Header from '@/components/Header/Header';
import Head from 'next/head';
import Forstudnet from "@/assets/animation/for-student.json"
import Forprofessional from "@/assets/animation/professional.json"
import Foreducator from "@/assets/animation/Educator.json"
import Fororganizatin from "@/assets/animation/organization.json"

import dynamic from 'next/dynamic';

// Replace the static Lottie import with dynamic import
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

// Rest of your code remains the same


import { Col, Container, Row } from 'react-bootstrap';
import Link from 'next/link';

export default function Services() {
    // const serviceItems = [
    //     {
    //         icon: "bi bi-laptop",
    //         title: "For Students",
    //     },
    //     {
    //         icon: "bi bi-phone",
    //         title: "For Professional",
    //     },
    //     {
    //         icon: "bi bi-cloud",
    //         title: "For Educators",
    //         description: "Scalable cloud solutions with reliable hosting and deployment services.",
    //     },
    //     {
    //         icon: "bi bi-shield-check",
    //         title: "For Organizations",
    //     },
    // ];

    return (
        <>
            <Head>
                <title>DG Next - Services</title>
                <link rel="icon" href="/dglogo.ico" />
            </Head>

            <Header />

            <div >

                <Container  fluid className="min-vh-100 container" style={{ paddingTop: '120px', paddingBottom: '0px', backgroundColor: 'transparent' }}>

                    <Row className="text-center mb-5 mb-4">
                        <Col>
                            <h1 className="display-4 fw-bold" style={{ color: '#2c3e50', fontSize: 25, letterSpacing: "1px" }}>
                                Services
                            </h1>
                            <h2 style={{ fontFamily: "'Livvic', sans-serif", fontSize: 20 }} className="lead text-muted">Empowering Learning Through Seamless, Scalable Services.</h2>
                        </Col>
                    </Row>
                    <div className="row">
                        <div className="row col-lg mb-0 " style={{ border: "0px solid #2c3e50", borderRadius: 25, margin: 15 }}>
                            <div className="custom-card h-100 border-1 " style={{ backgroundColor: "#fff", borderRadius: 15, justifyContent: "center", alignItems: "center", paddingTop: 30, paddingBottom: 20 }}>
                                {/* Image on Top */}
                                <Lottie
                                    animationData={Forstudnet}
                                    loop={true}
                                    style={{
                                        width: "220px",
                                        height: "220px",
                                        justifyContent: "center",
                                        margin: "0 auto" // Center the animation
                                    }}
                                />

                                <div className="card-body text-center">
                                    <h5 className="card-title" style={{ color: "#2c3e50", fontFamily: "'Acme', sans-serif" }}>For Students</h5>
                                    <Link href="/forstudent" className="btn search-btn" style={{ paddingLeft: 50, paddingRight: 50, marginTop: 10, marginBottom: 10 }}>View</Link>
                                </div>
                            </div>
                        </div>

                        <div className="col-6 col-md-4 col-lg mb-0" style={{ border: "0px solid #2c3e50", borderRadius: 15, margin: 15 }}>
                            <div className="custom-card h-100 border-0" style={{ backgroundColor: "#fff", borderRadius: 15, justifyContent: "center", alignItems: "center", paddingTop: 30, paddingBottom: 20 }}>
                                {/* Image on Top */}
                                <Lottie
                                    animationData={Forprofessional}
                                    loop={true}
                                    style={{
                                        width: "220px",
                                        height: "220px",
                                        justifyContent: "center",
                                        margin: "0 auto" // Center the animation
                                    }}
                                />

                                <div className="card-body text-center">
                                    <h5 className="card-title" style={{ color: "#2c3e50", fontFamily: "'Acme', sans-serif" }}>For Professionals</h5>
                                    <Link href="/forprofessional" className="btn search-btn" style={{ paddingLeft: 50, paddingRight: 50, marginTop: 10, marginBottom: 10 }}>View</Link>
                                </div>
                            </div>
                        </div>

                        <div className="col-6 col-md-4 col-lg mb-0" style={{ border: "0px solid #2c3e50", borderRadius: 15, margin: 15 }}>
                            <div className="custom-card h-100 border-0" style={{ backgroundColor: "#fff", borderRadius: 15, justifyContent: "center", alignItems: "center", paddingTop: 30, paddingBottom: 20 }}>
                                {/* Image on Top */}
                                <Lottie
                                    animationData={Foreducator}
                                    loop={true}
                                    style={{
                                        width: "220px",
                                        height: "220px",
                                        justifyContent: "center",
                                        margin: "0 auto" // Center the animation
                                    }}
                                />

                                <div className="card-body text-center">
                                    <h5 className="card-title" style={{ color: "#2c3e50", fontFamily: "'Acme', sans-serif" }}>For Educators</h5>
                                    <a href="/foreducator77" className="btn search-btn" style={{ paddingLeft: 50, paddingRight: 50, marginTop: 10, marginBottom: 10 }}>View</a>
                                </div>
                            </div>
                        </div>

                        <div className="col-6 col-md-4 col-lg mb-0" style={{ border: "0px solid #2c3e50", borderRadius: 15, margin: 15 }}>
                            <div className="custom-card h-100 border-0" style={{ backgroundColor: "#fff", borderRadius: 15, justifyContent: "center", alignItems: "center", paddingTop: 30, paddingBottom: 20 }}>
                                {/* Image on Top */}
                                <Lottie
                                    animationData={Fororganizatin}
                                    loop={true}
                                    style={{
                                        width: "220px",
                                        height: "220px",
                                        justifyContent: "center",
                                        margin: "0 auto" // Center the animation
                                    }}
                                />

                                <div className="card-body text-center">
                                    <h5 className="card-title" style={{ color: "#2c3e50", fontFamily: "'Acme', sans-serif" }}>For Organizations</h5>
                                    <a href="fororganization" className="btn search-btn" style={{ paddingLeft: 50, paddingRight: 50, marginTop: 10, marginBottom: 10 }}>View</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            <Footer />
        </>
    );
}
