import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";

const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false); // Start as false, will check localStorage
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true); // Show banner only if no consent has been set
    }

    // Handle dark mode
    const isDarkMode = document.body.classList.contains('dark-mode') || 
                      localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);

    const handleDarkModeChange = () => {
      setDarkMode(document.body.classList.contains('dark-mode'));
    };

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          handleDarkModeChange();
        }
      });
    });

    observer.observe(document.body, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setModalMessage("You have accepted all cookies.");
    setShowModal(true);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setModalMessage("You have rejected all cookies.");
    setShowModal(true);
    setShowBanner(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      {showBanner && (
        <div className={`cookie-banner fixed-bottom shadow p-3 border-top ${darkMode ? 'bg-dark' : 'bg-white'}`}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-8 text-center text-md-start">
                <h2
                  className="mb-0"
                  style={{
                    fontFamily: "'Livvic', sans-serif",
                    fontSize: 14,
                    fontWeight: 300,
                    color: darkMode ? "#ffffff" : "#2c3e50",
                  }}
                >
                  We use cookies to enhance your learning experience, remember preferences, and improve our platform. By clicking
                  &ldquo;Accept All&rdquo;, you agree to our use of cookies. Manage preferences anytime.
                  <br />
                  <Link href="/privacy&policy" 
                    className="text-decoration-none" 
                    style={{ 
                      fontWeight: 600,
                      fontFamily: "'Livvic', sans-serif",
                      color: darkMode ? "#F37832" : undefined
                    }}>
                    Learn More
                  </Link>{" "}
                  |{" "}
                  <Link href="/cookie-settings" 
                    className="text-decoration-none" 
                    style={{ 
                      fontWeight: 600,
                      fontFamily: "'Livvic', sans-serif",
                      color: darkMode ? "#F37832" : undefined
                    }}>
                    Cookie Settings
                  </Link>
                </h2>
              </div>
              <div className="col-md-4 text-center text-md-end mt-3 mt-md-0" style={{border: "0px solid"}}>
                <Button
                  variant={darkMode ? "outline-light" : "outline-secondary"}
                  onClick={handleRejectAll}
                  className="me-2"
                  style={{ borderRadius: 10 }}
                >
                  Reject All
                </Button>
                <Button
                  variant="warning"
                  style={{ backgroundColor: "#F37832", color: "#fff", borderRadius: 10 }}
                  onClick={handleAcceptAll}
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal 
        show={showModal}
        onHide={handleCloseModal} 
        centered
        contentClassName={darkMode ? "bg-dark text-white" : ""}
      >
        <Modal.Header closeButton className={darkMode ? "border-secondary" : ""}>
          <Modal.Title className="w-100 text-center">Cookie Preference</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center" style={{ fontSize: 20 }}>{modalMessage}</Modal.Body>
        <Modal.Footer style={{border: "0px solid"}} className={`d-flex justify-content-center ${darkMode ? "border-secondary" : ""}`}>
          <button 
            className="btn searhc-btn" 
            style={{ width: 120, height: 45, fontFamily: "'Livvic', sans-serif", fontSize: "16px", letterSpacing: "1px", marginBottom: 20 }} 
            onClick={handleCloseModal}
          >
            Okay
          </button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .dark-mode .cookie-banner a:hover {
          color: #ffffff !important;
        }
      `}</style>
    </>
  );
};

export default CookieConsentBanner;