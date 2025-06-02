'use client';

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const AppDownloadSection = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
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

  return (
    <div className="container py-5" style={{marginBottom: 100}}>
      <div className="row justify-content-center">
        <div className="col-12 text-center mb-4">
          <h2 className="download-title" style={{color: "#2c3e50", fontSize: 25}}>Download Our App</h2>
          <h2 className="download-subtitle" style={{fontWeight: 400, fontFamily: "'Livvic', sans-serif"}}>Get our app for iOS and Android</h2>
          <div className="divider-line" />
        </div>
        <div className="col-12 col-md-8 col-lg-6 d-flex justify-content-center gap-3">
          <a href="#" className="app-store-btn">
            <i className="bi bi-apple me-2" style={{ color: darkMode ? '#ffffff' : 'inherit' }}></i>
            <span>
              Download on the<br />
              <strong>App Store</strong>
            </span>
          </a>
          <a href="#" className="play-store-btn">
            <i className="bi bi-google-play me-2" style={{ color: darkMode ? '#ffffff' : 'inherit' }}></i>
            <span>
              Get it on<br />
              <strong>Google Play</strong>
            </span>
          </a>
        </div>
      </div>

      <style jsx>{`
        .download-title {
          font-size: 2rem;
          font-weight: 600;
          color: ${darkMode ? '#fff' : '#333'};
          margin-bottom: 0.5rem;
        }
        
        .download-subtitle {
          font-size: 1.1rem;
          color: ${darkMode ? '#ccc' : '#666'};
          margin-bottom: 2rem;
        }
        
        .app-store-btn,
        .play-store-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 20px;
          border-radius: 15px;
          text-decoration: none;
          color: #fff;
          transition: all 0.3s ease;
          min-width: 160px;
        }
        
        .app-store-btn {
          background-color: #000;
        }
        
        .play-store-btn {
          background-color: #01875f;
        }
        
        .app-store-btn:hover {
          background-color: #333;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .play-store-btn:hover {
          background-color: #02a978;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .app-store-btn i,
        .play-store-btn i {
          font-size: 1.8rem;
        }
        
        .app-store-btn span,
        .play-store-btn span {
          display: inline-block;
          text-align: left;
          line-height: 1.2;
          font-size: 0.8rem;
        }
        
        .app-store-btn strong,
        .play-store-btn strong {
          font-size: 1.1rem;
        }
        
        @media (max-width: 576px) {
          .col-12.col-md-8.col-lg-6 {
            flex-direction: column;
            align-items: center;
          }
          
          .app-store-btn,
          .play-store-btn {
            width: 80%;
            margin-bottom: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default AppDownloadSection;