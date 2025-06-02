import Image from "next/image";
import { useEffect, useState } from "react";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import Facebook from "@/assets/png/facebook.png";
import LinkedIn from "@/assets/png/linkedin.png";
import Telegram from "@/assets/png/telegram.png";
import Youtube from "@/assets/png/youtube.png";
import Tiktok from "@/assets/png/tiktok.png";
import CookieConsentBanner from "../Cookie/CookieConsent";
import Link from "next/link";
import NextNobackground from "@/assets/png/LOGO-DG-Next-nobackground.png";
import NextWhitebackground from "@/assets/png/LOGO-DG-Next-White-nobackground.png";
import { useTheme } from "next-themes";
import abalogo from "@/assets/png/aba-1.png";
import khqrlogo from "@/assets/png/KHQR.png";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("en");

  const { theme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Update isDarkMode state when theme changes or on initial load
  useEffect(() => {
    setIsDarkMode(theme === 'dark');
  }, [theme]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail("");
  };

  const socialLinks = [
    { src: Facebook, href: "https://facebook.com", label: "Facebook" },
    { src: LinkedIn, href: "https://linkedin.com", label: "LinkedIn" },
    { src: Telegram, href: "https://telegram.org", label: "Telegram" },
    { src: Youtube, href: "https://youtube.com", label: "YouTube" },
    { src: Tiktok, href: "https://tiktok.com", label: "TikTok" },
  ];

  return (
    <>
      <CookieConsentBanner />
      <footer className="py-0">
        <div className="container">
          <div className="row gy-4 pt-3">
            {/* Company Section */}
            <div className="col-12 col-md-6 col-lg-3">
              <Link href="/" className="logo-link">
                {isDarkMode ? (
                  <Image
                    src={NextWhitebackground}
                    alt="Company Logo"
                    className="mb-3"
                    style={{ borderRadius: 10 }}
                    width={230}
                    height={100}
                  />
                ) : (
                  <Image
                    src={NextNobackground}
                    alt="Company Logo"
                    className="mb-3"
                    style={{ borderRadius: 10 }}
                    width={230}
                    height={100}
                  />
                )}
              </Link>
              <ul className="list-unstyled">
                <li className="mb-2 d-flex align-items-center">
                  <MdEmail className="text-muted me-2" style={{ height: 25, width: 25 }} />
                  <a href="mailto:contact@dgdemy.org" className="text-decoration-none text-muted" style={{ fontSize: 16, fontFamily: "'Athiti', sans-serif", fontWeight: 500 }}>
                    contact@dgdemy.org
                  </a>
                </li>
                <li className="mb-2 d-flex align-items-center">
                  <MdPhone className="text-muted me-2" style={{ height: 25, width: 25 }} />
                  <a href="tel:+85599200805" className="text-decoration-none text-muted" style={{ fontSize: 16, fontFamily: "'Athiti', sans-serif", fontWeight: 500 }}>
                    (+855) 10 801 601 | 99 200 805
                  </a>
                </li>
                <li className="d-flex align-items-start">
                  <MdLocationOn className="text-muted me-2" style={{ height: 25, width: 25 }} />
                  <span className="text-muted" style={{ fontSize: 16, fontFamily: "'Athiti', sans-serif", fontWeight: 500 }}>
                    PPIU Building #36, Street 169,<br />
                    Sangkat Veal Vong, Khan 7 Makara,<br />
                    Phnom Penh, Cambodia
                  </span>
                </li>
              </ul>
            </div>

            {/* Course Categories */}
            <div className="col-6 col-md-4 col-lg-2">
              <h2 className="mb-3" style={{ color: "#2c3e50", fontFamily: "'Athiti', sans-serif", fontWeight: 600, fontSize: 18 }}>Course Categories:</h2>
              <ul className="list-unstyled">
                {["AI", "Leadership", "Strategy", "Innovation", "Personal Finance", "Selling", "Communication"].map((link) => (
                  <li key={link} className="mb-2">
                    <a href={`#${link.toLowerCase().replace(" ", "-")}`} className="text-decoration-none text-muted" style={{ fontSize: 16, fontFamily: "'Athiti', sans-serif", fontWeight: 500 }}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div className="col-6 col-md-4 col-lg-2">
              <h2 className="mb-3" style={{ color: "#2c3e50", fontFamily: "'Athiti', sans-serif", fontWeight: 600, fontSize: 18 }}>Services:</h2>
              <ul className="list-unstyled">
                {[
                  { label: "Students", path: "/forstudent" },
                  { label: "Professional", path: "/forprofessional" },
                  { label: "Educators", path: "/foreducator" },
                  { label: "Organizations", path: "/fororganization" },
                ].map(({ label, path }) => (
                  <li key={label} className="mb-2">
                    <Link href={path} className="text-decoration-none text-muted" style={{ fontSize: 16, fontFamily: "'Athiti', sans-serif", fontWeight: 500 }}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* About Us */}
            <div className="col-6 col-md-4 col-lg-2">
              <h2 className="mb-3" style={{ color: "#2c3e50", fontFamily: "'Athiti', sans-serif", fontWeight: 600, fontSize: 18 }}>About Us:</h2>
              <ul className="list-unstyled">
                {["Vision", "Mission", "Core Values"].map((link) => (
                  <li key={link} className="mb-2">
                    <a href={`#${link.toLowerCase().replace(" ", "-")}`} className="text-decoration-none text-muted" style={{ fontSize: 16, fontFamily: "'Athiti', sans-serif", fontWeight: 500 }}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter & Language */}
            <div className="col-6 col-md-6 col-lg-3">
              <h2 className="mb-3" style={{ color: "#2c3e50", fontFamily: "'Athiti', sans-serif", fontWeight: 600, fontSize: 18 }}>Contact Us:</h2>
              <form onSubmit={handleNewsletterSubmit} className="mb-3">
                <div className="input-group" style={{ borderRadius: 25 }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="form-control"
                    required
                    style={{ height: 45, fontFamily: "'Glegoo', serif", fontSize: 12 }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ borderTopRightRadius: 15, borderBottomRightRadius: 15, height: 45, letterSpacing: "1px" }}>
                    Subscribe
                  </button>
                </div>
              </form>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="form-select"
                style={{ borderRadius: 15, height: 45 }}
              >
                <option value="en" className="opt">English</option>
                <option value="kh">Khmer</option>
                <option value="ja">Japan</option>
                <option value="zh">China</option>
              </select>

              <h2 className="mb-3" style={{ color: "#2c3e50", fontFamily: "'Athiti', sans-serif", fontWeight: 600, fontSize: 18, marginTop: 20 }}>We accept:</h2>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                <Image
                  src={abalogo}
                  alt="aba Logo"
                  className="mb-3"
                  style={{ borderRadius: 8 }}
                  width={70}
                  height={40}
                />
                <Image
                  src={khqrlogo}
                  alt="khqr Logo"
                  className="mb-3"
                  style={{ borderRadius: 10 }}
                  width={70}
                  height={40}
                />
              </div>
            </div>
          </div>

          {/* Social Links & Copyright */}
          <div className="border-top py-4">
            <div className="row align-items-center">
              {/* Left: Year */}
              <div className="col-md-4 text-center text-md-start mb-0">
                <p className="text-muted mb-0" style={{ fontSize: 16, fontFamily: "'Athiti', sans-serif", fontWeight: 400 }}>
                  © {new Date().getFullYear()} DG Next. All rights reserved.
                </p>
              </div>

              {/* Middle: Terms, Privacy, and Cookie Policy */}
              <div className="col-md-4 d-flex justify-content-center">
                <div className="d-flex gap-4">
                  <Link href="/term" className="text-muted" aria-label="Terms and Conditions" style={{ fontSize: 16, fontFamily: "'Athiti', sans-serif", fontWeight: 500 }}>
                    Terms & Conditions
                  </Link>
                  <Link href="/privacy&policy" className="text-muted" aria-label="Privacy Policy" style={{ fontSize: 16, fontFamily: "'Athiti', sans-serif", fontWeight: 500 }}>
                    Privacy & Policy
                  </Link>
                  <Link href="/cookie-settings" className="text-muted" aria-label="Cookie Policy" style={{ fontSize: 16, fontFamily: "'Athiti', sans-serif", fontWeight: 500 }}>
                    Cookie
                  </Link>
                </div>
              </div>

              {/* Right: Social Links */}
              <div className="col-md-4 d-flex justify-content-center justify-content-md-end">
                <div className="d-flex gap-3">
                  {socialLinks.map(({ src, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="text-muted"
                    >
                      <Image alt={label} src={src} width={35} height={35} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .btn-primary {
            background-color: #f47834;
            border-color: #f47834;
          }
          .btn-primary:hover {
            background-color: #e06620;
            border-color: #e06620;
          }
          a.text-muted:hover {
            color: #f47834 !important;
          }
        `}</style>
      </footer>
    </>
  );
};

export default Footer;