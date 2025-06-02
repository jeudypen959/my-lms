import Head from 'next/head';
import { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Image from 'next/image';
import imgAbout from "@/assets/png/img-about.jpg";
import visionimg from "@/assets/png/vision.png";
import missionimg from "@/assets/png/mission.png";
import creativityimg from "@/assets/png/creativity.png";
import innovationimg from "@/assets/png/innovation-1.png";
import intelligenceimg from "@/assets/png/intelligence.png";
import integrityimg from "@/assets/png/integrity.png";
import empowermentimg from "@/assets/png/empowerment.png";
import BD8 from "@/assets/png/Bd-8.png";
import T1 from "@/assets/png/T1.png";
import T2 from "@/assets/png/T2.png";
import T3 from "@/assets/png/T3.png";
import T4 from "@/assets/png/T4.png";
import { Col, Container, Row } from 'react-bootstrap';


export default function About() {
    useEffect(() => {
        // Removed: import('bootstrap/dist/js/bootstrap.bundle.min.js');
    }, []);

    return (
        <>
            <Head>
                <title>DG Next - About Us</title>
                <link rel="icon" href="/dglogo.ico" />
            </Head>

            <Header />


            <Container fluid className="min-vh-100 container" style={{ paddingTop: '120px', paddingBottom: '0px', backgroundColor: 'transparent' }}>
                <Row className="text-center mb-5 mb-4">
                        <Col>
                            <h1 className="display-4 fw-bold" style={{ color: '#2c3e50', fontSize: 25, letterSpacing: "1px" }}>
                                About Us
                            </h1>
                            <h2 style={{ fontFamily: "'Livvic', sans-serif", fontSize: 20 }} className="lead text-muted">Empowering Learning Through Seamless, Scalable Services.</h2>
                        </Col>
                    </Row>
                <section id="about" className="py-5">
                    <div className="container">
                        <div className="row justify-content-center align-items-center">
                            <div className="col-md-6 px-4">
                                <h2 style={{fontSize: 20, fontWeight: 400, fontFamily: "'Livvic', sans-serif"}} className='subtext'>In an era where Artificial Intelligence (AI) evolves rapidly, enhancing one’s skills and capabilities becomes not just important, but essential. At DGacademy, we are committed to this very cause – to empower individuals to realize and unleash their full potential amidst the advancements of AI.</h2>
                                <h2 style={{fontSize: 20, fontWeight: 400, fontFamily: "'Livvic', sans-serif"}} className='subtext'>Founded by a group of visionaries and enthusiasts in digital education, DGacademy stands as a testament to our dedication. We are proudly registered with the Ministry of Commerce and Educational Authority, symbolizing our commitment to quality and excellence in digital learning.</h2>
                            </div>
                            <div className="col-md-6 px-4">
                                <Image
                                    src={imgAbout}
                                    alt="About Image"
                                    height={1000}
                                    width={500}
                                    quality={100}
                                    className="img-fluid shadow"
                                    style={{ borderRadius: 15, maxWidth: "100%" }}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section id="team" className="py-5" style={{backgroundColor: "transparent" }}>
                    <div className="container">
                        <h2 className="text-center mb-5" style={{ fontSize: 25, color: "#2c3e50" }}>Our Teamwork</h2>
                        <div className="row g-3 justify-content-center" style={{backgroundColor: "transparent" }}>
                            {[
                                { src: BD8, name: "Mr. Hin Sopheap" },
                                { src: T4, name: "Ms. Thy Sokunthea" },
                                { src: T3, name: "Ms. Non SreyPich" },
                                { src: T2, name: "Mr. Pen Jeudy" },
                                { src: T1, name: "Mr. Song Sokrith" },
                            ].map((member, index) => (
                                <div key={index} className="col-6 col-md-4 col-lg-2 mb-3 team-card" style={{backgroundColor: "transparent" }}>
                                    <div className="card h-100 border-0 text-center" style={{backgroundColor: "transparent" }}>
                                        <Image
                                            src={member.src}
                                            alt={member.name}
                                            width={240}
                                            height={265}
                                            className="card-img-top"
                                            style={{ objectFit: "cover", borderRadius: 10 }}
                                        />
                                        <div className="card-body">
                                            <h2 className="card-title" style={{ color: "#2c3e50", fontSize: 18 }}>{member.name}</h2>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="vision" className="py-0">
                    <div className="container">
                        <h2 className="text-center mb-5" style={{ fontSize: 25, color: "#2c3e50" }}>Vision</h2>
                        <div className="row justify-content-center">
                            <div className="col-12 col-md-8">
                                <div className="value-card text-center p-4">
                                    <Image src={visionimg} alt="Vision" height={50} width={50} quality={100} />
                                    <h5 style={{ color: "#2c3e50", fontSize: 25, fontWeight: 500, marginTop: 20, fontFamily: "'Acme', sans-serif" }}>We aspire to be an:</h5>
                                    <h5 style={{ fontSize: 25, fontWeight: 300, fontFamily: "'Livvic', sans-serif", color: "#2c3e50" }}>
                                        ⁕ Innovative <br />
                                        ⁕ Intelligent <br />
                                        ⁕ Engaging
                                    </h5>
                                    <h5 style={{ fontSize: 25, fontWeight: 300, fontFamily: "'Livvic', sans-serif", color: "#2c3e50" }}>digital education platform that empowers everyone <br/> to learn and grow.</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="mission" className="py-5">
                    <div className="container">
                        <h2 className="text-center mb-5" style={{ fontSize: 25, color: "#2c3e50" }}>Mission</h2>
                        <div className="row justify-content-center">
                            <div className="col-12 col-md-8">
                                <div className="value-card text-center p-4">
                                    <Image src={missionimg} alt="Mission" height={50} width={50} quality={100}/>
                                    <h5 style={{ color: "#2c3e50", fontSize: 20, fontWeight: 500, marginTop: 20, fontFamily: "'Livvic', sans-serif" }}>DG Academy’s mission is to transform education in Cambodia <br/> by embracing the latest in AI and VR technologies. We are dedicated to providing an innovative and accessible learning platform that inspires growth and success for all. As a pioneer in AI skills training, we aim to equip Cambodia’s workforce with the tools and knowledge needed to lead in the digital economy.</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="values" className="py-0" style={{marginBottom: 150}}>
                    <div className="container">
                        <h2 className="text-center mb-5" style={{ fontSize: 25, color: "#2c3e50" }}>Core Values</h2>
                        <div className="row g-2 justify-content-center">
                            {[
                                { src: creativityimg, title: "Creativity", desc: "Encouraging original thinking and fostering a culture of innovation." },
                                { src: innovationimg, title: "Innovation", desc: "Continuously embracing new technologies and approaches to stay at the forefront of educational excellence." },
                                { src: intelligenceimg, title: "Intelligence", desc: "Making informed, data-driven decisions and promoting intellectual growth." },
                                { src: integrityimg, title: "Integrity", desc: "Upholding the highest ethical standards in all our interactions and commitment." },
                                { src: empowermentimg, title: "Empowerment", desc: "Enabling individuals to reach their full potential by providing the tools, knowledge, and opportunities they need to succeed." },
                            ].map((value, index) => (
                                <div key={index} className="col-md-2 col-6">
                                    <div className="value-card text-center p-3 h-100">
                                        <Image src={value.src} alt={value.title} height={50} width={50} quality={100} />
                                        <h6 style={{ color: "#2c3e50", fontSize: 20, margin: "10px 0 5px" }}>{value.title}:</h6>
                                        <h5 style={{ fontSize: 18, fontWeight: 300, fontFamily: "'Livvic', sans-serif", color: "#2c3e50" }}>{value.desc}</h5>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </Container>

            <Footer />

            <style jsx>{`
                body {
                    overflow-x: hidden;
                }

                .container {
                    max-width: 1200px;
                    padding-left: 15px;
                    padding-right: 15px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .image-container {
                    width: 100%;
                    overflow: hidden;
                }

                .image-container img {
                    max-width: 100%;
                    height: auto;
                }

                .team-card {
                    border-radius: 15px;
                    transition: transform 0.3s ease;
                    background: white;
                }

                .team-card:hover {
                    transform: translateY(-10px);
                }

                .value-card {
                    border: 2px solid #ddd;
                    border-radius: 15px;
                    transition: transform 0.3s ease;
                    background: white;
                }

                .value-card:hover {
                    transform: translateY(-5px);
                }

                @media (max-width: 768px) {
                    .value-card p {
                        font-size: 16px !important;
                    }
                    .section-title {
                        font-size: 28px !important;
                    }
                }
            `}</style>
        </>
    );
}