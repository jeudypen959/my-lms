import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { Eye, EyeOff } from 'lucide-react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import dynamic from 'next/dynamic';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '@/config/firebaseConfig';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import defaultAnimation from '@/assets/animation/profile.json';

// Interface for ProfileImage props
interface ProfileImageProps {
  profileImage: string | null;
}

const ProfileImage = ({ profileImage }: ProfileImageProps) => {
  const isValidImageUrl = (url: string | null) => {
    return url && typeof url === 'string' && 
           (url.startsWith('https://') || url.startsWith('blob:'));
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
      <div style={{ width: '200px', height: '200px', overflow: 'hidden', borderRadius: '50%', border: '1px solid #2c3e50', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
        {isValidImageUrl(profileImage) ? (
          <Image 
            src={profileImage as string} 
            alt="Profile" 
            layout="fill" 
            objectFit="cover" 
          />
        ) : (
          <div className="text-center">
            <Lottie animationData={defaultAnimation} style={{ width: 80, height: 80 }} />
            <p style={{ marginTop: '10px', fontFamily: "'Livvic', sans-serif", color: '#2c3e50' }}>No Photo</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Interface for FloatingInput props
interface FloatingInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  required?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

const FloatingInput = ({ label, type, value, onChange, name, required, showPassword, onTogglePassword }: FloatingInputProps) => {
  const isPassword = type === 'password';
  return (
    <div className="form-floating mb-3 position-relative">
      <input
        type={showPassword ? 'text' : type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="form-control"
        placeholder={label}
        style={{ borderRadius: 15 }}
      />
      <label>{label}</label>
      {isPassword && (
        <button
          type="button"
          className="position-absolute top-50 end-0 translate-middle-y me-2 bg-transparent border-0"
          onClick={onTogglePassword}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );
};

// Interface for FloatingSelect props
interface FloatingSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}

const FloatingSelect = ({ label, name, value, onChange, options, required }: FloatingSelectProps) => (
  <div className="form-floating mb-3">
    <select
      className="form-select"
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      style={{ borderRadius: 15 }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <label>{label}</label>
  </div>
);

// Interface for FloatingTextarea props
interface FloatingTextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  rows?: number;
}

const FloatingTextarea = ({ label, name, value, onChange, required, rows = 3 }: FloatingTextareaProps) => (
  <div className="form-floating mb-3">
    <textarea
      className="form-control"
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={label}
      style={{ height: `${rows * 2.5}rem`, borderRadius: 15 }}
    />
    <label>{label}</label>
  </div>
);

export default function EditProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    job: '',
    career: '',
    degree: '',
    city: '',
    country: '',
    gender: '',
    bio: '',
    password: '',
    userImg: null as string | null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfile((prev) => ({
            ...prev,
            username: userData.username || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
            job: userData.currentJob || '',
            career: userData.career || '',
            gender: userData.gender || '',
            city: userData.address ? userData.address.split(', ')[0] : '',
            country: userData.address ? userData.address.split(', ')[1] : '',
            bio: userData.bio || '',
            userImg: userData.userImg || null
          }));
          setProfileImage(userData.userImg || null);
        }
      }
    };

    if (router.query) {
      const { userImg, username, email, phoneNumber, job, address, career, gender } = router.query;
      setProfile((prev) => ({
        ...prev,
        username: username as string || prev.username,
        email: email as string || prev.email,
        phoneNumber: phoneNumber as string || prev.phoneNumber,
        job: job as string || prev.job,
        career: career as string || prev.career,
        gender: gender as string || prev.gender,
        city: address ? (address as string).split(', ')[0] : prev.city,
        country: address ? (address as string).split(', ')[1] : prev.country
      }));
      if (userImg && typeof userImg === 'string' && !userImg.startsWith('file://')) {
        setProfileImage(userImg);
      }
    }

    fetchUserData();
  }, [router.query]);

  const degreeOptions = [
    { value: 'highschool', label: 'High School' },
    { value: 'associate', label: 'Associate' },
    { value: 'bachelors', label: 'Bachelors' },
    { value: 'masters', label: 'Masters' },
    { value: 'phd', label: 'PhD' },
    { value: 'other', label: 'Other' }
  ];

  const cities: { [key: string]: string[] } = {
    Cambodia: ['Phnom Penh', 'Siem Reap'],
    UnitedStates: ['New York', 'Los Angeles', 'San Francisco'],
    UnitedKingdom: ['London', 'Manchester'],
    Canada: ['Toronto', 'Vancouver'],
    Australia: ['Sydney', 'Melbourne'],
    China: ['Beijing', 'Shanghai'],
    Japan: ['Tokyo', 'Osaka'],
    Korea: ['Seoul', 'Busan']
  };

  const cityOptions = (cities[profile.country] || []).map((city) => ({ value: city, label: city }));
  const countryOptions = Object.keys(cities).map((country) => ({ value: country, label: country }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    setProfile((prev) => ({ ...prev, country, city: cities[country]?.[0] || '' }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const user = auth.currentUser;
      if (user) {
        try {
          // Show preview immediately
          const previewUrl = URL.createObjectURL(file);
          setProfileImage(previewUrl);

          const storageRef = ref(storage, `profileImages/${user.uid}`);
          await uploadBytes(storageRef, file);
          const imageUrl = await getDownloadURL(storageRef);

          // Update with final URL
          setProfileImage(imageUrl);
          setProfile((prev) => ({ ...prev, userImg: imageUrl }));

          console.log('Profile image updated:', imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image');
        }
      } else {
        alert('Please sign in to upload a profile image');
      }
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setProfile((prev) => ({
      ...prev,
      userImg: null
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
      const userData = {
        userImg: profileImage,
        username: profile.username,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        currentJob: profile.job,
        address: `${profile.city}, ${profile.country}`,
        career: profile.career,
        gender: profile.gender,
        bio: profile.bio
      };
      try {
        await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
        console.log('Profile data submitted:', userData);
        alert('Profile updated successfully!');
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile');
      }
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <>
      <Head>
        <title>DG Next - Edit Profile</title>
        <link rel="icon" href="/dglogo.ico" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.0/font/bootstrap-icons.css" />
      </Head>
      <Header />
      <div className="py-5" style={{ marginTop: 30, marginBottom: 20 }}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ borderLeft: '5px solid #2c3e50', height: '65px', marginRight: '20px', borderRadius: 15 }}></div>
                <h1 className="mb-1" style={{ fontSize: 35, letterSpacing: '1px', color: '#2c3e50', marginTop: 15 }}>
                  Edit Profile <br /> <span style={{ fontFamily: "'Livvic', sans-serif", fontSize: 20, marginTop: -20 }}>Update your information and preferences</span>
                </h1>
              </div>
              <Card className="border-0 rounded-bottom mt-3" style={{ backgroundColor: 'transparent' }}>
                <Card.Body className="p-4" style={{ backgroundColor: 'transparent' }}>
                  <Form onSubmit={handleSubmit} id="edit-profile-form" style={{ backgroundColor: 'transparent' }}>
                    <Row>
                      <Col md={4} className="mb-4">
                        <div className="text-center">
                          <ProfileImage profileImage={profileImage} />
                          <div className="mt-3 d-flex justify-content-center gap-3">
                            <button
                              className='btn search-btn'
                              onClick={triggerFileInput}
                              style={{ width: '140px', height: '45px', borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}
                            >
                              <i className="bi bi-camera-fill me-2"></i> Select Photo
                            </button>
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="d-none"
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={handleRemoveImage}
                              style={{ width: '140px', height: '45px', borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}
                            >
                              <i className="bi bi-trash me-1"></i> Remove
                            </Button>
                          </div>
                          <div className="mt-4">
                            <h1 style={{ fontFamily: "'Livvic', sans-serif", color: '#2c3e50', fontSize: 18, letterSpacing: '1px' }}>
                              @{profile.username}
                            </h1>
                            <p style={{ fontFamily: "'Livvic', sans-serif", fontWeight: 500, color: '#2c3e50', fontSize: 15 }} className="text-muted small">
                              Profile photos help personalize your account
                            </p>
                          </div>
                        </div>
                      </Col>
                      <Col md={8}>
                        <h4 className="border-bottom pb-2 mb-4" style={{ fontSize: 20, color: '#2c3e50' }}>
                          <i className="bi bi-info-circle me-2"></i> Personal Information:
                        </h4>
                        <Row className="mb-1">
                          <Col md={6}>
                            <FloatingInput
                              label="Username"
                              type="text"
                              name="username"
                              value={profile.username}
                              onChange={handleChange}
                              required={true}
                            />
                          </Col>
                          <Col md={6}>
                            <FloatingInput
                              label="Email"
                              type="email"
                              name="email"
                              value={profile.email}
                              onChange={handleChange}
                              required={true}
                            />
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col md={6}>
                            <FloatingInput
                              label="Phone Number"
                              type="text"
                              name="phoneNumber"
                              value={profile.phoneNumber}
                              onChange={handleChange}
                            />
                          </Col>
                          <Col md={6}>
                            <FloatingInput
                              label="Password"
                              type="password"
                              name="password"
                              value={profile.password}
                              onChange={handleChange}
                              showPassword={showPassword}
                              onTogglePassword={togglePasswordVisibility}
                            />
                          </Col>
                        </Row>
                        <Row className="mb-1">
                          <Col>
                            <label className="form-label mb-2" style={{ color: '#2c3e50' }}>Gender</label>
                            <div className="d-flex gap-4 mb-3">
                              <Form.Check
                                type="radio"
                                id="gender-male"
                                label="Male"
                                name="gender"
                                value="male"
                                checked={profile.gender === 'male'}
                                onChange={handleChange}
                                className="custom-radio"
                                style={{ color: profile.gender === 'male' ? '#F37832' : '#2c3e50' }}
                              />
                              <Form.Check
                                type="radio"
                                id="gender-female"
                                label="Female"
                                name="gender"
                                value="female"
                                checked={profile.gender === 'female'}
                                onChange={handleChange}
                                className="custom-radio"
                                style={{ color: profile.gender === 'female' ? '#F37832' : '#2c3e50' }}
                              />
                              <Form.Check
                                type="radio"
                                id="gender-other"
                                label="Other"
                                name="gender"
                                value="other"
                                checked={profile.gender === 'other'}
                                onChange={handleChange}
                                className="custom-radio"
                                style={{ color: profile.gender === 'other' ? '#F37832' : '#2c3e50' }}
                              />
                            </div>
                          </Col>
                        </Row>
                        <h4 className="border-bottom pb-2 mb-4 mt-5" style={{ fontSize: 20, color: '#2c3e50' }}>
                          <i className="bi bi-briefcase me-2"></i> Professional Details:
                        </h4>
                        <Row className="mb-1">
                          <Col md={6}>
                            <FloatingInput
                              label="Current Job/Occupation"
                              type="text"
                              name="job"
                              value={profile.job}
                              onChange={handleChange}
                            />
                          </Col>
                          <Col md={6}>
                            <FloatingInput
                              label="Career Goal"
                              type="text"
                              name="career"
                              value={profile.career}
                              onChange={handleChange}
                            />
                          </Col>
                        </Row>
                        <Row className="mb-2">
                          <Col md={6}>
                            <FloatingSelect
                              label="Degree Achieved"
                              name="degree"
                              value={profile.degree}
                              onChange={handleChange}
                              options={degreeOptions}
                            />
                          </Col>
                          <Col md={6}>
                            <FloatingTextarea
                              label="Short Bio"
                              name="bio"
                              value={profile.bio}
                              onChange={handleChange}
                              rows={3}
                            />
                          </Col>
                        </Row>
                        <h4 className="border-bottom pb-2 mb-4 mt-1" style={{ fontSize: 20, color: '#2c3e50' }}>
                          <i className="bi bi-geo-alt me-2"></i> Location:
                        </h4>
                        <Row className="mb-3">
                          <Col md={6}>
                            <FloatingSelect
                              label="Country"
                              name="country"
                              value={profile.country}
                              onChange={handleCountryChange}
                              options={countryOptions}
                            />
                          </Col>
                          <Col md={6}>
                            <FloatingSelect
                              label="City"
                              name="city"
                              value={profile.city}
                              onChange={handleChange}
                              options={cityOptions}
                            />
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <div className="d-flex justify-content-center gap-3 mt-1 mb-5">
            <Button variant="outline-secondary" style={{ borderRadius: 15, width: 150, height: 50, letterSpacing: '1px' }}>
              <i className="bi bi-x-circle me-1"></i> Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="edit-profile-form"
              style={{ borderRadius: 15, width: 150, height: 50, letterSpacing: '1px' }}
            >
              <i className="bi bi-check-circle me-1"></i> Save Changes
            </Button>
          </div>
        </Container>
      </div>
      <Footer />
      <style jsx global>{`
        .custom-radio input[type="radio"] {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #2c3e50;
          background-color: white;
          transition: background-color 0.3s, border-color 0.3s;
          position: relative;
          outline: none;
        }
        .custom-radio input[type="radio"]:checked {
          background-color: #F37832 !important;
          border-color: #F37832 !important;
        }
        .custom-radio input[type="radio"]:checked::after {
          content: '';
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: white;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .custom-radio input[type="radio"]:focus {
          border-color: #F37832 !important;
        }
        .custom-radio label {
          margin-left: 10px;
          color: #2c3e50;
          font-family: 'Livvic', sans-serif;
        }
        .custom-radio input[type="radio"]:checked + label {
          color: #F37832 !important;
        }
      `}</style>
    </>
  );
}