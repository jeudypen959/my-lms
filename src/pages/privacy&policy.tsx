// pages/privacy-policy.js
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import dynamic from 'next/dynamic';
import Privacy from "@/assets/animation/privacy.json";

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>DG Next - Privacy&Policy</title>
        <link rel="icon" href="/dglogo.ico" />
      </Head>
      <Header />

      <div className="container py-5" style={{ marginTop: 40, paddingBottom: 100, marginBottom: 70 }}>


        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div className="card shadow-sm" style={{ borderRadius: 20, padding: 25 }}>
              <h1 className="text-center mb-0" style={{ fontSize: 35, color: "#2c3e50" }}>Privacy & Policy</h1>
              <div className="card-body">
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
                    animationData={Privacy}
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

                {/* Introduction */}
                <section className="privacy-section">
                  <h2 style={{ fontSize: 25 }}>1. Introduction</h2>
                  <p style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400 }}>
                    Welcome to our Learning Management System (LMS). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
                  </p>
                </section>

                {/* Information We Collect */}
                <section className="privacy-section">
                  <h2 style={{ fontSize: 25 }}>2. Information We Collect</h2>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item" style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400 }}>Personal Information (name, email, etc.)</li>
                    <li className="list-group-item" style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400 }}>Course progress and completion data</li>
                    <li className="list-group-item" style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400 }}>Payment information</li>
                    <li className="list-group-item" style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400 }}>Technical data (IP address, browser type)</li>
                  </ul>
                </section>

                {/* How We Use Information */}
                <section className="privacy-section">
                  <h2 style={{ fontSize: 25 }}>3. How We Use Your Information</h2>
                  <p style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400, fontSize: 20 }}>We use the information we collect to:</p>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item" style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400 }}>Provide and improve our LMS services</li>
                    <li className="list-group-item" style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400 }}>Process payments and prevent fraud</li>
                    <li className="list-group-item" style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400 }}>Send important updates and notifications</li>
                    <li className="list-group-item" style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400 }}>Personalize your learning experience</li>
                  </ul>
                </section>

                {/* Data Sharing */}
                <section className="privacy-section">
                  <h2 style={{ fontSize: 25 }}>4. Data Sharing</h2>
                  <p style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400, fontSize: 20 }}>We may share your information with:</p>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item" style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400 }}>Service providers and partners</li>
                    <li className="list-group-item" style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400 }}>Legal authorities when required</li>
                    <li className="list-group-item" style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400 }}>Course instructors (limited data)</li>
                  </ul>
                </section>

                {/* User Rights */}
                <section className="privacy-section">
                  <h2 style={{ fontSize: 25 }}>5. Your Rights</h2>
                  <p style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400, fontSize: 20 }}>You have the right to:</p>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item" style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400 }}>Access your personal data</li>
                    <li className="list-group-item" style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400 }}>Request data correction</li>
                    <li className="list-group-item" style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400 }}>Request data deletion</li>
                    <li className="list-group-item" style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400 }}>Opt-out of marketing communications</li>
                  </ul>
                </section>

                {/* Contact */}
                <section className="privacy-section">
                  <h2 style={{ fontSize: 25 }}>6. Contact Us</h2>
                  <p style={{ fontFamily: "'Livvic', sans-serif", color: "#2c3e50", fontWeight: 400 }}>
                    If you have any questions about this Privacy Policy, please contact us at:
                    <br />
                    Email: privacy@lmsplatform.com
                    <br />
                    Last Updated: April 3, 2025
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
          body {
            background-color: #f8f9fa;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          }
          
          .privacy-section {
            margin-bottom: 2rem;
          }
          
          .privacy-section h2 {
            color: #2c3e50;
            margin-bottom: 1rem;
            border-bottom: 1px solid #2c3e50;
            padding-bottom: 0.5rem;
          }
          
          .card {
            border: none;
            border-radius: 10px;
          }
          
          .list-group-item {
            border: none;
            padding: 0.5rem 1rem;
          }
        `}</style>

      <Footer />
    </>
  );
}