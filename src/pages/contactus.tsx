import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useForm, UseFormRegisterReturn } from 'react-hook-form';
import { Modal, Button, Container, Row, Col } from 'react-bootstrap';
import { Eye, EyeOff } from 'react-feather';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import emailjs from '@emailjs/browser';

type FormData = {
  fullName: string;
  email: string;
  poSition: string;
  phone?: string;
  message: string;
};

interface FloatingInputProps {
  label: string;
  type?: string;
  name: string;
  error?: string;
  registerProps: UseFormRegisterReturn;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  darkMode?: boolean;
}

const FloatingInput = ({
  label,
  type = 'text',
  name,
  error,
  registerProps,
  showPassword,
  onTogglePassword,
  darkMode,
}: FloatingInputProps) => {
  const isPassword = type === 'password';

  return (
    <div className="form-floating mb-3 position-relative">
      <input
        type={showPassword ? 'text' : type}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        id={name}
        placeholder={label}
        {...registerProps}
        style={{
          borderRadius: 15,
          backgroundColor: darkMode ? '#2c3e50' : undefined,
          color: darkMode ? '#ffffff' : undefined,
          borderColor: darkMode ? '#495057' : undefined,
        }}
      />
      <label htmlFor={name} style={{ color: darkMode ? '#adb5bd' : undefined }}>{label}</label>
      {isPassword && (
        <button
          type="button"
          className="position-absolute top-50 end-0 translate-middle-y me-2 bg-transparent border-0"
          onClick={onTogglePassword}
          style={{ color: darkMode ? '#ffffff' : undefined }}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default function ContactPage() {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormData>({ mode: 'onChange' });

  useEffect(() => {
    const isDarkMode =
      document.body.classList.contains('dark-mode') ||
      localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);

    const handleDarkModeChange = () => {
      setDarkMode(document.body.classList.contains('dark-mode'));
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          handleDarkModeChange();
        }
      });
    });

    observer.observe(document.body, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      // Send email using EmailJS
      await emailjs.send(
        'YOUR_SERVICE_ID', // Replace with your EmailJS Service ID
        'YOUR_TEMPLATE_ID', // Replace with your EmailJS Template ID
        {
          from_name: formData.fullName,
          position: formData.poSition,
          email: formData.email,
          phone: formData.phone || 'Not provided',
          message: formData.message,
          to_email: 'contact@dgdemy.org', // The recipient email
        },
        'YOUR_PUBLIC_KEY' // Replace with your EmailJS Public Key
      );
      console.log('Email sent successfully!');
      setShowModal(true);
      reset();
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('There was an error sending your message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>DG Next - Contact Us</title>
        <link rel="icon" href="/dglogo.ico" />
      </Head>
      <Header />

      <Container className="flex-grow-1" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
        <Row className="text-center mb-5">
          <Col>
            <h1 className="display-4 fw-bold" style={{ color: '#2c3e50', fontSize: 25, letterSpacing: '1px' }}>
              Contact Us
            </h1>
            <h2
              style={{ fontFamily: "'Livvic', sans-serif", fontSize: 20 }}
              className="lead text-muted"
            >
              {`Need Help or Have Questions? We're Just a Message Away.`}
            </h2>
          </Col>
        </Row>
        <div>
          <div className="row g-0 w-100" style={{ maxWidth: '1200px', borderRadius: 35 }}>
            {/* Contact Info */}
            <div
              className={`col-lg-6 text-white ${darkMode ? 'bg-dark' : 'bg-primary'}`}
              style={{ borderTopLeftRadius: 30, borderBottomLeftRadius: 30 }}
            >
              <div className="p-5 h-100 d-flex flex-column justify-content-between">
                <div>
                  <h2 className="mb-4" style={{ fontSize: 25 }}>Get in Touch</h2>
                  <div className="contact-details mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <i
                        className="bi bi-geo-alt-fill me-3"
                        style={{ color: darkMode ? '#ffffff' : 'inherit' }}
                      ></i>
                      <p className="mb-0">
                        PPIU Building #36, Street 169,
                        <br />
                        Sangkat Veal Vong, Khan 7 Makara,
                        <br />
                        Phnom Penh, Cambodia
                      </p>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <i
                        className="bi bi-telephone-fill me-3"
                        style={{ color: darkMode ? '#ffffff' : 'inherit' }}
                      ></i>
                      <p className="mb-0">(+855) 10 801 601 | 99 200 805</p>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <i
                        className="bi bi-envelope-fill me-3"
                        style={{ color: darkMode ? '#ffffff' : 'inherit' }}
                      ></i>
                      <p className="mb-0">contact@dgdemy.org</p>
                    </div>
                  </div>
                  <div className="social-icons mb-4">
                    <a href="#" className="me-3 text-white">
                      <i className="bi bi-facebook" style={{ color: darkMode ? '#ffffff' : 'inherit' }}></i>
                    </a>
                    <a href="#" className="me-3 text-white">
                      <i className="bi bi-twitter" style={{ color: darkMode ? '#ffffff' : 'inherit' }}></i>
                    </a>
                    <a href="#" className="me-3 text-white">
                      <i className="bi bi-linkedin" style={{ color: darkMode ? '#ffffff' : 'inherit' }}></i>
                    </a>
                    <a href="#" className="text-white">
                      <i className="bi bi-instagram" style={{ color: darkMode ? '#ffffff' : 'inherit' }}></i>
                    </a>
                  </div>
                </div>
                <div className="map-container mt-4" style={{ borderRadius: 10 }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1954.4869396400986!2d104.90079973884999!3d11.563875159164138!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310951f1d21e9e71%3A0xa97d245d973de142!2sPPIU%20Main%20Campus!5e0!3m2!1sen!2skh!4v1712451003617!5m2!1sen!2skh"
                    width="100%"
                    height="200"
                    style={{ border: 0, borderRadius: 10 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div
              className={`col-lg-6 ${darkMode ? 'bg-secondary' : 'bg-white'}`}
              style={{ borderTopRightRadius: 30, borderBottomRightRadius: 30 }}
            >
              <div className="p-5">
                <h5
                  className="mb-4"
                  style={{
                    color: darkMode ? '#ffffff' : '#2c3e50',
                    fontSize: 25,
                    fontFamily: "'Acme', sans-serif",
                  }}
                >
                  Send us a Message
                </h5>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <FloatingInput
                    label="Full Name"
                    name="fullName"
                    registerProps={register('fullName', {
                      required: 'Full name is required',
                      minLength: { value: 2, message: 'Minimum 2 characters' },
                    })}
                    error={errors.fullName?.message}
                    darkMode={darkMode}
                  />
                  <FloatingInput
                    label="Position"
                    name="position"
                    registerProps={register('poSition', {
                      required: 'Position is required',
                      minLength: { value: 2, message: 'Minimum 2 characters' },
                    })}
                    error={errors.poSition?.message}
                    darkMode={darkMode}
                  />
                  <FloatingInput
                    label="Email"
                    name="email"
                    type="email"
                    registerProps={register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email format',
                      },
                    })}
                    error={errors.email?.message}
                    darkMode={darkMode}
                  />
                  <FloatingInput
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    registerProps={register('phone')}
                    darkMode={darkMode}
                  />
                  <div className="form-floating mb-3">
                    <textarea
                      className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                      id="message"
                      placeholder="Message"
                      style={{
                        height: '150px',
                        backgroundColor: darkMode ? '#2c3e50' : undefined,
                        color: darkMode ? '#ffffff' : undefined,
                        borderColor: darkMode ? '#495057' : undefined,
                      }}
                      {...register('message', {
                        required: 'Message is required',
                        minLength: { value: 10, message: 'Minimum 10 characters' },
                      })}
                    ></textarea>
                    <label
                      htmlFor="message"
                      style={{
                        backgroundColor: darkMode ? 'transparent' : undefined,
                        color: darkMode ? '#ffffff' : undefined,
                      }}
                    >
                      Message
                    </label>
                    {errors.message && <div className="invalid-feedback">{errors.message.message}</div>}
                  </div>
                  <button
                    className={`btn w-100 ${darkMode ? 'btn-outline-light' : 'btn-primary'}`}
                    type="submit"
                    disabled={!isValid || isSubmitting}
                  >
                    {isSubmitting && (
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    )}
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          contentClassName={darkMode ? 'bg-dark text-white' : ''}
        >
          <Modal.Header closeButton className={darkMode ? 'border-secondary' : ''}>
            <Modal.Title>Success!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{`Your message has been sent successfully. We'll get back to you soon!`}</p>
          </Modal.Body>
          <Modal.Footer className={darkMode ? 'border-secondary' : ''}>
            <Button
              variant={darkMode ? 'outline-light' : 'primary'}
              onClick={() => setShowModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>

      <Footer />
    </>
  );
}