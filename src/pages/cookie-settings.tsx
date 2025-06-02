// pages/cookie-settings.js
import { useState } from 'react';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { Button } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import Cookie from "@/assets/animation/netting.json";
import Link from 'next/link';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function CookieSettings() {
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true, // Always true as these are required
    analytics: false,
    performance: false,
    marketing: false,
  });

  // Define the type for the 'type' parameter
  type CookieType = keyof typeof cookiePreferences;

  const handleToggle = (type: CookieType) => {
    if (type !== 'necessary') {
      setCookiePreferences(prev => ({
        ...prev,
        [type]: !prev[type]
      }));
    }
  };

  const savePreferences = () => {
    // Here you would typically save to localStorage or send to an API
    console.log('Saving preferences:', cookiePreferences);
    alert('Cookie preferences saved!');
  };

  return (
    <>
      <Head>
        <title>DG Next - Cookie</title>
        <link rel="icon" href="/dglogo.ico" />
      </Head>
      <Header />

      <div className="container py-5" style={{ marginTop: 40, paddingBottom: 100, marginBottom: 20 }}>
        <div className="card mb-4" style={{ borderRadius: 20 }}>
          <div className="card-body" style={{ borderRadius: 20, padding: 30 }}>
            <h1 className="mb-4 text-center" style={{ fontSize: 35, color: "#2c3e50" }}>Cookie Settings</h1>
            <section
              style={{
                display: "flex",
                justifyContent: "center",   // Horizontally centers the content
                alignItems: "center",       // Vertically centers the content
                height: "50vh",            // Full viewport height to center the content in the middle of the screen
              }}
            >
              <Lottie
                animationData={Cookie}
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
            <h2 className="card-title h4" style={{ fontSize: 25, color: "#2c3e50" }}>Manage Consent Preferences</h2>
            <p className="text-muted" style={{ fontSize: 18, color: "#2c3e50", fontWeight: 300, fontFamily: "'Livvic', sans-serif" }}>
              We use cookies to enhance your learning experience. You can customize your preferences below.
            </p>

            {/* Necessary Cookies */}
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
              <div>
                <h3 className="h5 mb-1" style={{ fontSize: 20, fontFamily: "'Livvic', sans-serif", fontWeight: 600, color: "#2c3e50" }}>Necessary Cookies</h3>
                <p className="mb-0 small" style={{ fontSize: 18, color: "#2c3e50", fontWeight: 300, fontFamily: "'Livvic', sans-serif" }}>
                  Required for core LMS functionality (Always active)
                </p>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={cookiePreferences.necessary}
                  disabled
                />
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
              <div>
                <h3 className="h5 mb-1" style={{ fontSize: 20, fontFamily: "'Livvic', sans-serif", fontWeight: 600, color: "#2c3e50" }}>Analytics Cookies</h3>
                <p className="mb-0 small" style={{ fontSize: 18, color: "#2c3e50", fontWeight: 300, fontFamily: "'Livvic', sans-serif" }}>
                  Help us understand how you use the LMS
                </p>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={cookiePreferences.analytics}
                  onChange={() => handleToggle('analytics')}
                />
              </div>
            </div>

            {/* Performance Cookies */}
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
              <div>
                <h3 className="h5 mb-1" style={{ fontSize: 20, fontFamily: "'Livvic', sans-serif", fontWeight: 600, color: "#2c3e50" }}>Performance Cookies</h3>
                <p className="mb-0 small" style={{ fontSize: 18, color: "#2c3e50", fontWeight: 300, fontFamily: "'Livvic', sans-serif" }}>
                  Optimize platform speed and performance
                </p>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={cookiePreferences.performance}
                  onChange={() => handleToggle('performance')}
                />
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className="h5 mb-1" style={{ fontSize: 20, fontFamily: "'Livvic', sans-serif", fontWeight: 600, color: "#2c3e50" }}>Marketing Cookies</h3>
                <p className="mb-0 small" style={{ fontSize: 18, color: "#2c3e50", fontWeight: 300, fontFamily: "'Livvic', sans-serif" }}>
                  Personalize course recommendations and content
                </p>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={cookiePreferences.marketing}
                  onChange={() => handleToggle('marketing')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-center gap-2">
          <Button
            variant="outline-secondary"
            onClick={() => setCookiePreferences({
              necessary: true,
              analytics: true,
              performance: true,
              marketing: true
            })}
            style={{ height: 45, borderRadius: 10 }}
          >
            Accept All
          </Button>
          <Button
            variant="warning"
            style={{ backgroundColor: "#F37832", color: "#fff", borderRadius: 10, height: 45 }}
            onClick={savePreferences}
          >
            Save Preferences
          </Button>
        </div>

        {/* Additional Information */}
        <div className="mt-4 text-muted small">
          <p style={{ fontSize: 18, color: "#2c3e50", fontWeight: 300, fontFamily: "'Livvic', sans-serif", textAlign: "center" }}>
            Learn more about how we use cookies in our{' '}
            <Link href="/privacy&policy" className="" style={{ fontSize: 18, color: "#2c3e50", fontWeight: 600, fontFamily: "'Livvic', sans-serif" }}>
              Cookie Policy
            </Link>
            . Changes will take effect immediately upon saving.
          </p>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .form-check-input:disabled {
          opacity: 0.7;
        }
        .form-check-input {
          width: 3em;
          height: 1.3em;
          cursor: pointer;
        }
      `}</style>

      <Footer />
    </>
  );
}