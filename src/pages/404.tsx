'use client';

import Link from 'next/link';
import Head from 'next/head';
import { useEffect, useState, ChangeEvent, MouseEvent } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import error404 from '@/assets/animation/404.json';

interface TextInputProps {
  label: string;
  value?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  name: string;
  required?: boolean;
  type?: string;
  multiple?: boolean;
}

const TextInput = ({ 
  label, 
  value, 
  onChange, 
  name, 
  required = false, 
  type = "text", 
  multiple = false 
}: TextInputProps) => {
  return (
    <div className="form-floating mb-3">
      <input
        type={type}
        name={name}
        value={type !== 'file' ? value : undefined}
        onChange={onChange}
        required={required}
        className="form-control"
        placeholder={label}
        multiple={multiple}
        style={{ borderRadius: 15 }}
      />
      <label>{label}</label>
    </div>
  );
};

interface FloatingTextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  rows?: number;
}

const FloatingTextarea = ({ 
  label, 
  name, 
  value, 
  onChange, 
  required = false, 
  rows = 3 
}: FloatingTextareaProps) => (
  <div className="form-floating mb-3">
    <textarea
      className="form-control"
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={label}
      style={{
        height: `${rows * 2.5}rem`,
        borderRadius: 15,
        letterSpacing: "0px",
        fontFamily: "'Livvic', sans-serif",
        fontWeight: 500
      }}
    />
    <label>{label}</label>
  </div>
);

interface FormData {
  name: string;
  email: string;
  position: string;
  address: string;
  images: File[] | null;
  message: string;
}

export default function NotFound() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    position: '',
    address: '',
    images: null,
    message: ''
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    console.log('Lottie Animation File:', error404);
  }, []);

  const handleContactClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const files = (e.target as HTMLInputElement).files;
    
    if (name === 'images' && files) {
      const limitedFiles = Array.from(files).slice(0, 5);
      setFormData(prev => ({ ...prev, [name]: limitedFiles }));
      const previews = limitedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveImage = (index: number) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newFiles = formData.images ? Array.from(formData.images).filter((_, i) => i !== index) : [];
    setImagePreviews(newPreviews);
    setFormData(prev => ({ ...prev, images: newFiles.length ? newFiles : null }));
  };

  return (
    <>
      <Head>
        <title>DG Next - Error 404</title>
        <link rel="icon" href="/dglogo.ico" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.0/font/bootstrap-icons.css" />
      </Head>

      <div className="container-fluid error-page">
        <div className="row min-vh-100 align-items-center justify-content-center">
          <div className="col-md-8 text-center">
            <div className="animation-container mb-4" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {error404 ? (
                <Lottie
                  animationData={error404}
                  style={{ width: 350, height: 350 }}
                  loop
                  autoPlay
                  onError={(error) => {
                    console.error('Lottie Animation Error:', error);
                  }}
                />
              ) : (
                <div className="text-warning">
                  Animation could not be loaded
                </div>
              )}
            </div>

            <h2 className="error-message mb-3" style={{ color: "#2c3e50" }}>
              Oops! The page you&apos;re looking for doesn&apos;t exist.
            </h2>
            <p className="error-subtitle mb-4" style={{ color: "#2c3e50", fontFamily: "'Livvic', sans-serif", fontWeight: 400 }}>
              Don&apos;t worry, let&apos;s help you find your way back.
            </p>

            <div className="action-buttons" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
              <Link href="/" className="btn search-btn" style={{ fontFamily: "'Acme', sans-serif", fontSize: 16, width: 200, height: 45, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 15 }} legacyBehavior={false}>
                Return to Homepage
              </Link>
              <Link href="/support" className="btn btn-outline-secondary" style={{ fontFamily: "'Acme', sans-serif", fontSize: 16, width: 200, height: 45, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 15 }} onClick={handleContactClick}>
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ paddingRight: 15, paddingLeft: 15, paddingTop: 5, paddingBottom: 10, borderRadius: 20 }}>
              <div
                className="modal-header"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                <h5
                  className="modal-title"
                  style={{ fontFamily: "'Acme', sans-serif", color: "#2c3e50" }}
                >
                  Contact Support
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  style={{
                    position: 'absolute',
                    right: 10
                  }}
                />
              </div>

              <div className="modal-body">
                <form>
                  <TextInput label="Name" name="name" value={formData.name} onChange={handleInputChange} required />
                  <TextInput label="Email" name="email" value={formData.email} onChange={handleInputChange} required />
                  <TextInput label="Position" name="position" value={formData.position} onChange={handleInputChange} required />
                  <TextInput label="Address" name="address" value={formData.address} onChange={handleInputChange} required />
                  <TextInput
                    label="Upload Image (screenshot or capture)"
                    name="images"
                    onChange={handleInputChange}
                    type="file"
                    multiple
                    required
                  />

                  {imagePreviews.length > 0 && (
                    <div className="mb-3">
                      <div className="d-flex flex-wrap gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="position-relative" style={{ width: 80, height: 80 }}>
                            <Image
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              width={80}
                              height={80}
                              style={{ objectFit: 'cover', borderRadius: 10 }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0"
                              style={{ borderRadius: '50%', width: 20, height: 20, padding: 0, fontSize: 10 }}
                              onClick={() => handleRemoveImage(index)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <FloatingTextarea label="Message" name="message" value={formData.message} onChange={handleInputChange} required rows={4} />

                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary" style={{ borderRadius: 15 }}>
                      Submit
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}