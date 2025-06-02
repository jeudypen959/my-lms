import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import dynamic from 'next/dynamic';
import Term from "@/assets/animation/term.json";


const Lottie = dynamic(() => import('lottie-react'), { ssr: false });


export default function TermsAndConditions() {
    return (
        <>
            <Head>
                <title>DG Next - Term&Condition</title>
                <link rel="icon" href="/dglogo.ico" />
            </Head>
            <Header />

            <div className="container my-5">
                <main style={{ marginTop: 90, paddingBottom: 100, marginBottom: 0 }}>
                    <div className="card p-4 shadow-sm" style={{ borderRadius: 20 }}>
                        <h1 className="text-center mb-0" style={{ fontSize: 35, color: "#2c3e50" }}>Terms & Conditions</h1>
                        {/* Lottie */}
                        <section
                            style={{
                                display: "flex",
                                justifyContent: "center",   // Horizontally centers the content
                                alignItems: "center",       // Vertically centers the content
                                height: "50vh",            // Full viewport height to center the content in the middle of the screen
                            }}
                        >
                            <Lottie
                                animationData={Term}
                                height={50}
                                width={50}
                                style={{
                                    width: 350,
                                    height: 350,
                                }}
                                autoPlay
                                loop
                            />
                        </section>
                        <section className="mb-4" style={{ padding: 10 }}>
                            <h2 className="h4" style={{ fontFamily: "'Livvic', sans-serif", fontSize: 25, fontWeight: 600, color: "#2c3e50" }}>1. Introduction</h2>
                            <p style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400, fontSize: 20 }}>
                                Welcome to our Learning Management System (LMS). By accessing or using our platform, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our services.
                            </p>
                        </section>

                        <section className="mb-4">
                            <h2 className="h4" style={{ fontFamily: "'Livvic', sans-serif", fontSize: 25, fontWeight: 600, color: "#2c3e50" }}>2. Use of the Platform</h2>
                            <p style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400, fontSize: 20 }}>
                                The LMS is provided for educational purposes. You agree to use the platform only for lawful purposes and in a way that does not infringe the rights of others or restrict their use of the service.
                            </p>
                        </section>

                        <section className="mb-4" style={{ padding: 10 }}>
                            <h2 className="h4" style={{ fontFamily: "'Livvic', sans-serif", fontSize: 25, fontWeight: 600, color: "#2c3e50" }}>3. User Accounts</h2>
                            <p style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400, fontSize: 20 }}>
                                To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
                            </p>
                        </section>

                        <section className="mb-4" style={{ padding: 10 }}>
                            <h2 className="h4" style={{ fontFamily: "'Livvic', sans-serif", fontSize: 25, fontWeight: 600, color: "#2c3e50" }}>4. Intellectual Property</h2>
                            <p style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400, fontSize: 20 }}>
                                All content provided on the LMS, including text, graphics, and course materials, is the property of the LMS or its licensors and is protected by copyright laws. You may not reproduce or distribute this content without permission.
                            </p>
                        </section>

                        <section className="mb-4" style={{ padding: 10 }}>
                            <h2 className="h4" style={{ fontFamily: "'Livvic', sans-serif", fontSize: 25, fontWeight: 600, color: "#2c3e50" }}>5. Limitation of Liability</h2>
                            <p style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400, fontSize: 20 }}>
                                The LMS is provided as is without warranties of any kind. We are not liable for any damages arising from your use of the platform, including but not limited to data loss or service interruptions.
                            </p>
                        </section>

                        <section className="mb-4" style={{ padding: 10 }}>
                            <h2 className="h4" style={{ fontFamily: "'Livvic', sans-serif", fontSize: 25, fontWeight: 600, color: "#2c3e50" }}>6. Termination</h2>
                            <p style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400, fontSize: 20 }}>
                                We reserve the right to terminate or suspend your account at our discretion, with or without notice, for any violation of these terms or for any other reason.
                            </p>
                        </section>

                        <section className="mb-4" style={{ padding: 10 }}>
                            <h2 className="h4" style={{ fontFamily: "'Livvic', sans-serif", fontSize: 25, fontWeight: 600, color: "#2c3e50" }}>7. Changes to Terms</h2>
                            <p style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400, fontSize: 20 }}>
                                We may update these Terms & Conditions from time to time. Any changes will be posted on this page, and your continued use of the LMS after such changes constitutes acceptance of the new terms.
                            </p>
                        </section>

                        <section className="mb-4" style={{ padding: 10 }}>
                            <h2 className="h4" style={{ fontFamily: "'Livvic', sans-serif", fontSize: 25, fontWeight: 600, color: "#2c3e50" }}>8. Contact Us</h2>
                            <p style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400, fontSize: 20 }}>
                                If you have any questions about these Terms & Conditions, please contact us at <a href="mailto:support@lms.com" style={{ fontSize: 20, fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 600 }}>support@lms.com</a>.
                            </p>
                        </section>
                    </div>
                </main>
            </div>

            <Footer />
        </>

    );
}