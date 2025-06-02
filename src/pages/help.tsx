'use client';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Head from 'next/head';
import Image from 'next/image';

export default function HelpCenter() {
  const [search, setSearch] = useState('');

  useEffect(() => {
    // import('bootstrap/dist/js/bootstrap.bundle.min');
  }, []);

  return (
    <>
      <Head>
        <title>DG Next - Help</title>
        <link rel="icon" href="/dglogo.ico" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.0/font/bootstrap-icons.css" />
      </Head>
      <Header />

      <div className="py-5" style={{ marginTop: 0, marginBottom: 20 }}>
        <header className="py-5" style={{ backgroundColor: 'transparent' }}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <h1 className="display-4 fw-bold">How can we help you?</h1>
                <p className="lead">24/7 support available for all your needs</p>
                <div className="input-group mt-4">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search for help..."
                    className="form-control"
                    required
                    style={{ height: 45, fontFamily: "'Glegoo', serif", fontSize: 12 }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ height: 45, letterSpacing: '1px' }}>
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </div>
              <div className="col-lg-6" style={{ position: 'relative', height: '400px' }}>
                <Image
                  src="https://images.unsplash.com/photo-1552581234-26160f608093"
                  alt="Support Team"
                  fill
                  className="img-fluid rounded-3"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </header>

        <section id="faq" className="py-5">
          <div className="container">
            <h2 className="text-center mb-5">Frequently Asked Questions</h2>
            <div className="accordion" id="faqAccordion">
              <div className="accordion-item">
                <h3 className="accordion-header">
                  <button
                    className="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseOne"
                  >
                    How do I reset my password?
                  </button>
                </h3>
                <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                  <div className="accordion-body">
                    Click on Forgot Password link on the login page and follow the instructions sent to your email.
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h3 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseTwo"
                  >
                    How do I upgrade my account?
                  </button>
                </h3>
                <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                  <div className="accordion-body">
                    Visit your account settings and select the Upgrade Plan option to view available plans.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="resources" className="py-5" style={{ backgroundColor: 'transparent' }}>
          <div className="container">
            <h2 className="text-center mb-5">Support Resources</h2>
            <div className="row g-4">
              {[
                {
                  title: 'Video Tutorials',
                  desc: 'Learn through our comprehensive video guides',
                  img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7',
                },
                {
                  title: 'Documentation',
                  desc: 'Browse our detailed documentation',
                  img: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4',
                },
                {
                  title: 'Community Forum',
                  desc: 'Connect with other users',
                  img: 'https://images.unsplash.com/photo-1553877522-43269d4ea984',
                },
              ].map((item, index) => (
                <div className="col-md-4" key={index}>
                  <div
                    className="card h-100 custom-card"
                    style={{
                      borderRadius: 15,
                      border: '1px solid #bdbdbd',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    }}
                  >
                    <div style={{ position: 'relative', height: '250px', padding: 7 }}>
                      <Image
                        src={item.img}
                        alt={item.title}
                        fill
                        className="card-img-top"
                        style={{ borderRadius: 20, objectFit: 'cover' }}
                      />
                    </div>
                    <div className="card-body">
                      <h5 className="card-title">{item.title}</h5>
                      <p className="card-text">{item.desc}</p>
                      <a href="#" className="btn btn-outline-dark search-btn">
                        Learn More
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}