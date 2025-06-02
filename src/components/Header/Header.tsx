import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import 'bootstrap/dist/css/bootstrap.min.css';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Notipng from "@/assets/png/noti-outline.png";
import { collection, query, orderBy, limit, getDocs, updateDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/config/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import logoutAnimation from "@/assets/animation/logout.json";
import telegramAnimation from '@/assets/animation/telegram-1.json';
import { Modal, Button, Form } from 'react-bootstrap';
import NextNobackground from "@/assets/png/LOGO-DG-Next-nobackground.png";
import NextWhitebackground from "@/assets/png/LOGO-DG-Next-White-nobackground.png";

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface Notification {
  id: string;
  title: string;
  text: string;
  thumbnailUrl: string;
  createdAt: Timestamp | Date;
  isRead?: boolean;
}

interface TelegramModalProps {
  show: boolean;
  onHide: () => void;
  onContinue: () => void;
}

const TelegramModal: React.FC<TelegramModalProps> = ({ show, onHide, onContinue }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      dialogClassName="rounded-modal"
    >
      <Modal.Body className="text-center p-4">
        <div className="d-flex flex-column align-items-center">
          <div className="telegram-logo-container mb-3">
            <Lottie animationData={telegramAnimation} style={{ width: 150, height: 150 }} />
          </div>
          <h4 style={{ fontFamily: "'Glegoo', serif", color: "#2c3e50", fontWeight: 600, fontSize: 16 }}>Contact Support via Telegram</h4>
          <p className="mt-3" style={{ fontFamily: "'Glegoo', serif", color: "#2c3e50", fontSize: 14 }}>
            You will be redirected to our support bot on Telegram <br /> to report your problem.
            Would you like to continue?
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 d-flex justify-content-center" style={{ paddingBottom: 30 }}>
        <Button variant="outline-secondary" onClick={onHide} className="px-4" style={{ width: 150, height: 50, borderRadius: 15 }}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onContinue} className="px-4 ms-2 telegram-btn" style={{ width: 150, height: 50, borderRadius: 15 }}>
          Continue
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const FlagToggle: React.FC<{ isDarkMode: boolean; onToggle: () => void }> = ({ isDarkMode, onToggle }) => {
  return (
    <Form.Check
      type="switch"
      id="dark-mode-switch"
      label={
        <span className="d-flex align-items-center" style={{ fontSize: 18, color: "#2c3e50" }}>
          <i className={`bi ${isDarkMode ? 'bi-moon-stars-fill' : 'bi-sun-fill'} me-0`} style={{ fontSize: 18 }}></i>

        </span>
      }
      checked={isDarkMode}
      onChange={onToggle}
      className="dark-mode-toggle custom-dark-mode-toggle"
    />
  );
};

const Header: React.FC = () => {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const servicesRef = useRef<HTMLLIElement>(null);
  const coursesRef = useRef<HTMLLIElement>(null);

  const handleServicesMouseEnter = () => setIsServicesOpen(true);
  const handleServicesMouseLeave = () => setIsServicesOpen(false);
  const handleCoursesMouseEnter = () => setIsCoursesOpen(true);
  const handleCoursesMouseLeave = () => setIsCoursesOpen(false);


  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.body.classList.toggle('dark-mode', newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
      setIsServicesOpen(false);
    }
    if (coursesRef.current && !coursesRef.current.contains(e.target as Node)) {
      setIsCoursesOpen(false);
    }
  };

  const handleOpenTelegramModal = () => {
    setShowTelegramModal(true);
    setShowProfileModal(false);
  };

  const handleCloseTelegramModal = () => {
    setShowTelegramModal(false);
  };

  const handleContinueToTelegram = () => {
    window.open('https://t.me/DGacademy_assistant_bot', '_blank');
    setShowTelegramModal(false);
  };

  const isValidImageUrl = (url: string | null): boolean => {
    if (!url) return false;
    if (url.startsWith('file://') ||
      url.includes('/Containers/Data/Application/') ||
      url.includes('/Library/Caches/') ||
      url.includes('ImagePicker/')) {
      return false;
    }
    const isAbsoluteUrl = /^(https?:\/\/)/.test(url);
    const isRelativePath = url.startsWith('/');
    return isAbsoluteUrl || isRelativePath;
  };

  useEffect(() => {
    const initializeDarkMode = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const storedPreference = localStorage.getItem('darkMode');

      const initialDarkMode = storedPreference !== null
        ? storedPreference === 'true'
        : prefersDark;

      setIsDarkMode(initialDarkMode);
      document.body.classList.toggle('dark-mode', initialDarkMode);
    };

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const notificationsRef = collection(db, 'notifications');
        const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const notificationData: Notification[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.thumbnailUrl && !isValidImageUrl(data.thumbnailUrl)) {
            console.warn(`Invalid thumbnailUrl in notification ${doc.id}: ${data.thumbnailUrl}`);
          }
          notificationData.push({
            id: doc.id,
            ...data as Omit<Notification, 'id'>,
            isRead: data.isRead || false,
          });
        });
        setNotifications(notificationData);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeDarkMode();
    fetchNotifications();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthenticated(!!user);
      setUserEmail(user?.email || null);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const photo = userData.userImg || user.photoURL || null;
            if (photo && !isValidImageUrl(photo)) {
              console.warn(`Invalid userPhoto for user ${user.uid}: ${photo}`);
            }
            setUserPhoto(photo);
            setUserName(userData.displayName || user.displayName || 'User');
          } else {
            if (user.photoURL && !isValidImageUrl(user.photoURL)) {
              console.warn(`Invalid photoURL for user ${user.uid}: ${user.photoURL}`);
            }
            setUserPhoto(user.photoURL || null);
            setUserName(user.displayName || 'User');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserPhoto(user.photoURL || null);
          setUserName(user.displayName || 'User');
        }
      } else {
        setUserPhoto(null);
        setUserName(null);
      }
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('darkMode') === null) {
        setIsDarkMode(e.matches);
        document.body.classList.toggle('dark-mode', e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);

    return () => {
      unsubscribe();
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileModal(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.notification-icon')) {
        setShowNotifications(false);
      }
    };

    if (showProfileModal || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileModal, showNotifications]);

  const initiateLogout = () => {
    setShowLogoutModal(true);
    setShowProfileModal(false);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      router.push('/authstudent');
      setShowLogoutModal(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    if (showProfileModal) setShowProfileModal(false);
  };

  const toggleProfileModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfileModal(!showProfileModal);
    if (showNotifications) setShowNotifications(false);
  };

  const markAsRead = async (id: string) => {
    try {
      const notificationRef = doc(db, 'notifications', id);
      await updateDoc(notificationRef, { isRead: true });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(unreadNotifications.map(async (n) => {
        const notificationRef = doc(db, 'notifications', n.id);
        await updateDoc(notificationRef, { isRead: true });
      }));
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const markAllAsUnread = async () => {
    try {
      const readNotifications = notifications.filter(n => n.isRead);
      await Promise.all(readNotifications.map(async (n) => {
        const notificationRef = doc(db, 'notifications', n.id);
        await updateDoc(notificationRef, { isRead: false });
      }));
      setNotifications(notifications.map(n => ({ ...n, isRead: false })));
    } catch (error) {
      console.error("Error marking all notifications as unread:", error);
    }
  };

  const formatTime = (timestamp: Timestamp | Date | null) => {
    if (!timestamp) return 'Unknown time';
    const date: Date = 'toDate' in timestamp ? timestamp.toDate() : timestamp;

    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderThumbnail = (notification: Notification) => {
    if (!notification.thumbnailUrl || !isValidImageUrl(notification.thumbnailUrl)) {
      return (
        <div className="notification-thumbnail">
          <div style={{ width: '40px', height: '40px', backgroundColor: '#f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#666' }}>
            {notification.title.charAt(0).toUpperCase()}
          </div>
        </div>
      );
    }
    return (
      <div className="notification-thumbnail">
        <Image
          src={notification.thumbnailUrl}
          alt="Thumbnail"
          width={45}
          height={45}
          style={{ borderRadius: '4px', objectFit: 'cover', marginRight: 10 }}
        />
      </div>
    );
  };

  return (
    <>
      <nav className={`navbar navbar-expand-lg navbar-dark py-1 shadow-sm fixed-top ${isDarkMode ? 'bg-dark' : 'bg-white'}`}>
        <div className="container">
          <Link href="/" className="navbar-brand d-flex align-items-center brand-text">
            {isDarkMode ? (
              <Image
                src={NextWhitebackground}
                alt="DG Next Logo"
                width={120}
                height={50}
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <Image
                src={NextNobackground}
                alt="DG Next Logo"
                width={120}
                height={50}
                style={{ objectFit: 'contain' }}
              />
            )}
          </Link>
          
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto" style={{ marginRight: 25 }}>
              <li className="nav-item">
                <Link href="/" className={`nav-link px-3 mx-1 ${router.pathname === '/' ? 'active-link' : ''}`} style={{ fontFamily: "'Glegoo', serif", fontSize: 14, letterSpacing: "1px" }}>Home</Link>
              </li>
              <li className="nav-item">
                <Link href="/about" className={`nav-link px-1 mx-1 ${router.pathname === '/about' ? 'active-link' : ''}`} style={{ fontFamily: "'Glegoo', serif", fontSize: 14, letterSpacing: "1px" }}>About</Link>
              </li>

              <li className="nav-item dropdown" ref={coursesRef} onMouseEnter={handleCoursesMouseEnter} onMouseLeave={handleCoursesMouseLeave}>
                <Link href="/courselist" className={`nav-link px-1 mx-1 ${router.pathname === '/courselist' ? 'active-link' : ''}`} id="coursesDropdown" aria-expanded={isCoursesOpen ? 'true' : 'false'} style={{ fontFamily: "'Glegoo', serif", fontSize: 14, letterSpacing: "1px" }}>
                  Course List
                  <i className="bi bi-chevron-down" style={{ paddingLeft: 10, fontSize: 14 }} />
                </Link>
                <ul className={`dropdown-menu ${isCoursesOpen ? 'show' : ''}`} aria-labelledby="coursesDropdown" style={{ borderRadius: 10, marginTop: 0, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                  <li><Link href="ai" className="dropdown-item" style={{ fontFamily: "'Glegoo', serif", fontSize: 13, letterSpacing: "1px" }}> AI</Link></li>
                  <li><Link href="leadership" className="dropdown-item" style={{ fontFamily: "'Glegoo', serif", fontSize: 13, letterSpacing: "1px" }}> Leadership</Link></li>
                  <li><Link href="strategy" className="dropdown-item" style={{ fontFamily: "'Glegoo', serif", fontSize: 13, letterSpacing: "1px" }}> Strategy</Link></li>
                  <li><Link href="innovation" className="dropdown-item" style={{ fontFamily: "'Glegoo', serif", fontSize: 13, letterSpacing: "1px" }}> Innovation</Link></li>
                  <li><Link href="finance" className="dropdown-item" style={{ fontFamily: "'Glegoo', serif", fontSize: 13, letterSpacing: "1px" }}> Personal Finance</Link></li>
                  <li><Link href="selling" className="dropdown-item" style={{ fontFamily: "'Glegoo', serif", fontSize: 13, letterSpacing: "1px" }}> Selling</Link></li>
                  <li><Link href="communication" className="dropdown-item" style={{ fontFamily: "'Glegoo', serif", fontSize: 13, letterSpacing: "1px" }}> Communication</Link></li>
                </ul>
              </li>

              <li className="nav-item dropdown" ref={servicesRef} onMouseEnter={handleServicesMouseEnter} onMouseLeave={handleServicesMouseLeave}>
                <Link href="/services" className={`nav-link px-1 mx-1 ${router.pathname === '/services' ? 'active-link' : ''}`} id="servicesDropdown" aria-expanded={isServicesOpen ? 'true' : 'false'} style={{ fontFamily: "'Glegoo', serif", fontSize: 14, letterSpacing: "1px" }}>
                  Services
                  <i className="bi bi-chevron-down" style={{ paddingLeft: 10, fontSize: 14 }} />
                </Link>
                <ul className={`dropdown-menu ${isServicesOpen ? 'show' : ''}`} aria-labelledby="servicesDropdown" style={{ borderRadius: 10, marginTop: 0, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                  <li><Link href="/forstudent" className="dropdown-item" style={{ fontFamily: "'Glegoo', serif", fontSize: 13, letterSpacing: "1px" }}> For Students</Link></li>
                  <li><Link href="/forprofessional" className="dropdown-item" style={{ fontFamily: "'Glegoo', serif", fontSize: 13, letterSpacing: "1px" }}> For Professionals</Link></li>
                  <li><Link href="/foreducator" className="dropdown-item" style={{ fontFamily: "'Glegoo', serif", fontSize: 13, letterSpacing: "1px" }}> For Educators</Link></li>
                  <li><Link href="/fororganization" className="dropdown-item" style={{ fontFamily: "'Glegoo', serif", fontSize: 13, letterSpacing: "1px" }}> For Organizations</Link></li>
                </ul>
              </li>

              <li className="nav-item">
                <Link href="/newsletter" className={`nav-link px-1 mx-1 ${router.pathname === '/newsletter' ? 'active-link' : ''}`} style={{ fontFamily: "'Glegoo', serif", fontSize: 14, letterSpacing: "1px" }}>AI Newsletter</Link>
              </li>
              <li className="nav-item">
                <Link href="/event" className={`nav-link px-1 mx-1 ${router.pathname === '/event' ? 'active-link' : ''}`} style={{ fontFamily: "'Glegoo', serif", fontSize: 14, letterSpacing: "1px" }}>Events</Link>
              </li>
              <li className="nav-item">
                <Link href="/pricing" className={`nav-link px-1 mx-1 ${router.pathname === '/pricing' ? 'active-link' : ''}`} style={{ fontFamily: "'Glegoo', serif", fontSize: 14, letterSpacing: "1px" }}>Plans</Link>
              </li>
              <li className="nav-item">
                <Link href="/contactus" className={`nav-link px-1 mx-1 ${router.pathname === '/contactus' ? 'active-link' : ''}`} style={{ fontFamily: "'Glegoo', serif", fontSize: 14, letterSpacing: "1px" }}>Contact Us</Link>
              </li>
              <li className="nav-item">
                <Link href="/groups" className={`nav-link px-1 mx-1 ${router.pathname === '/groups' ? 'active-link' : ''}`} style={{ fontFamily: "'Glegoo', serif", fontSize: 14, letterSpacing: "1px" }}>Group</Link>
              </li>
            </ul>

            <div className="d-flex align-items-center ms-lg-0 mt-3 mt-lg-0">
              <div className="me-0">
                <FlagToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
              </div>

              {isAuthenticated && (
                <div className="position-relative" style={{ marginRight: "10px" }}>
                  <div className="notification-icon" onClick={toggleNotifications}>
                    <Image src={Notipng} alt="Notifications" width={28} height={28} style={{ cursor: 'pointer' }} />
                    {notifications.filter(n => !n.isRead).length > 0 && (
                      <span className="notification-badge">{notifications.filter(n => !n.isRead).length}</span>
                    )}
                  </div>

                  {showNotifications && (
                    <div ref={notificationRef} className="notification-dropdown shadow">
                      <div className="notification-header">
                        <h6 className="m-0" style={{ fontFamily: "'Crimson Pro', serif", color: "#2c3e50", fontSize: 18 }}>Notifications</h6>
                        <div>
                          {notifications.some(n => !n.isRead) && (
                            <button className="btn btn-sm text-primary p-0 me-2" style={{ color: "#F4894B" }} onClick={markAllAsRead}>
                              Mark all as read
                            </button>
                          )}
                          {notifications.some(n => n.isRead) && (
                            <button className="btn btn-sm text-primary p-0" style={{ color: "#F4894B" }} onClick={markAllAsUnread}>
                              Mark all as unread
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="notification-body">
                        {loading ? (
                          <div className="text-center py-3">Loading notifications...</div>
                        ) : notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div key={notification.id} className={`notification-item ${!notification.isRead ? 'unread' : ''}`} onClick={() => markAsRead(notification.id)}>
                              {renderThumbnail(notification)}
                              <div className="notification-content">
                                <h6 className="notification-title" style={{ fontFamily: "'Crimson Pro', serif", color: "#2c3e50", fontSize: 18 }}>{notification.title}</h6>
                                <p className="notification-message" style={{ fontFamily: "'Glegoo', serif", color: "#2c3e50", fontSize: 14 }}>{notification.text}</p>
                                <small className="notification-time" style={{ fontFamily: "'Crimson Pro', serif", color: "#2c3e50", fontSize: 14 }}>{formatTime(notification.createdAt)}</small>
                              </div>
                              {!notification.isRead && <div className="unread-indicator"></div>}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-3" style={{ fontFamily: "'Crimson Pro', serif", color: "#2c3e50", fontSize: 18 }}>No notifications</div>
                        )}
                      </div>
                      <div className="notification-footer">
                        <Link href="/notifications" style={{ fontFamily: "'Crimson Pro', serif", color: "#2c3e50", fontSize: 18 }}>View all notifications</Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isAuthenticated ? (
                <div className="d-flex align-items-center position-relative">
                  {isValidImageUrl(userPhoto) ? (
                    <Image
                      src={userPhoto ?? "/user.png"}
                      alt="Profile"
                      width={40}
                      height={40}
                      style={{ borderRadius: '50%', cursor: 'pointer', marginLeft: 15 }}
                      onClick={toggleProfileModal}
                    />

                  ) : (
                    <Image src="/user.png" alt="Profile" width={40} height={40} style={{ borderRadius: '50%', cursor: 'pointer', marginLeft: 15 }} onClick={toggleProfileModal} />
                  )}

                  {showProfileModal && (
                    <div ref={profileRef} className="profile-dropdown shadow">
                      <div className="profile-header">
                        <div className="d-flex align-items-center">
                          {isValidImageUrl(userPhoto) ? (
                            <Image
                              src={userPhoto ?? "/user.png"}
                              alt="Profile"
                              width={40}
                              height={40}
                              style={{ borderRadius: '50%', marginRight: 10 }}
                            />

                          ) : (
                            <Image src="/user.png" alt="Profile" width={40} height={40} style={{ borderRadius: '50%', marginRight: 10 }} />
                          )}
                          <div>
                            <h6 className="mb-0" style={{ fontFamily: "'Crimson Pro', serif", color: "#2c3e50", fontSize: 16 }}>{userName}</h6>
                            <small style={{ fontFamily: "'Glegoo', serif", color: "#666", fontSize: 12 }}>{userEmail}</small>
                          </div>
                        </div>
                      </div>
                      <div className="profile-body">
                        <button className="btn btn-link w-100 text-start p-2 d-flex align-items-center" onClick={() => { router.push('/edit-profile'); setShowProfileModal(false); }} style={{ color: "#2c3e50", textDecoration: 'none' }}>
                          <i className="bi bi-pencil me-3"></i> Edit Profile
                        </button>
                        <button className="btn btn-link w-100 text-start p-2 d-flex align-items-center" onClick={() => { router.push('/dashboard'); setShowProfileModal(false); }} style={{ color: "#2c3e50", textDecoration: 'none' }}>
                          <i className="bi bi-speedometer2 me-3"></i> Dashboard
                        </button>
                        <button className="btn btn-link w-100 text-start p-2 d-flex align-items-center" onClick={() => { router.push('/settings'); setShowProfileModal(false); }} style={{ color: "#2c3e50", textDecoration: 'none' }}>
                          <i className="bi bi-gear me-3"></i> Settings
                        </button>
                        <button className="btn btn-link w-100 text-start p-2 d-flex align-items-center" onClick={() => { router.push('/help'); setShowProfileModal(false); }} style={{ color: "#2c3e50", textDecoration: 'none' }}>
                          <i className="bi bi-question-circle me-3"></i> Help
                        </button>
                        <button className="btn btn-link w-100 text-start p-2 d-flex align-items-center" onClick={handleOpenTelegramModal} style={{ color: "#2c3e50", textDecoration: 'none' }}>
                          <i className="bi bi-exclamation-triangle me-3"></i> Report Problem
                        </button>
                        <button className="btn btn-link w-100 text-start p-2 d-flex align-items-center logout-btn" onClick={initiateLogout} style={{ color: "#f47834", textDecoration: 'none' }}>
                          <i className="bi bi-box-arrow-right me-3"></i> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/authstudent">
                  <button
                    className="btn search-btn-login"
                    type="submit"
                    style={{
                      marginLeft: 5,
                      width: 90,
                      height: 40,
                      borderRadius: 10,
                      fontSize: 20,
                      fontFamily: "'Yrsa', serif",
                      fontWeight: 600,
                    }}
                  >
                    Sign in
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showLogoutModal && (
        <div className="modal-backdrop fade show blur-backdrop"></div>
      )}

      <div className={`modal fade ${showLogoutModal ? 'show' : ''}`} tabIndex={-1} role="dialog" style={{ display: showLogoutModal ? 'block' : 'none', background: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content text-center p-4">
            <div className="modal-body">
              <div className="d-flex flex-column align-items-center">
                <div style={{ width: 150, height: 150 }}>
                  <Lottie animationData={logoutAnimation} loop={true} />
                </div>
                <p className="mt-3" style={{ fontFamily: "'Glegoo', serif", color: "#2c3e50", fontSize: 14 }}>
                  Are you sure you want to logout from <br /> your account?
                </p>
                <p style={{ fontFamily: "'Glegoo', serif", fontWeight: 600, color: "#2c3e50" }}>{userEmail}</p>
              </div>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center">
              <button type="button" className="btn btn-outline-secondary px-4" onClick={cancelLogout} style={{ width: 150, height: 50, borderRadius: "15px", fontSize: 16 }}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger px-4 ms-2" onClick={confirmLogout} style={{ width: 150, height: 50, borderRadius: "15px", fontSize: 16 }}>
                Yes
              </button>
            </div>
          </div>
        </div>
      </div>

      <TelegramModal show={showTelegramModal} onHide={handleCloseTelegramModal} onContinue={handleContinueToTelegram} />

      <style jsx>{`
        .navbar { 
          border-bottom: 1px solid rgba(0, 0, 0, 0.1); 
        }
        .nav-link { 
          transition: all 0.3s ease; 
          position: relative; 
          color: ${isDarkMode ? '#ffffff' : '#2c3e50'} !important; 
        }
        .nav-link:hover { 
          color: #f47834 !important; 
          border-bottom: 3px solid #f47834; 
          padding-bottom: 8px; 
        }
        .nav-link.active-link { 
          font-weight: bold; 
          color: #f47834 !important; 
          border-bottom: 3px solid #f47834; 
          padding-bottom: 8px; 
        }
        .notification-icon { 
          position: relative; 
          cursor: pointer; 
        }
        .notification-badge { 
          position: absolute; 
          top: -5px; 
          right: -9px; 
          background-color: #f47834; 
          color: white; 
          border-radius: 50%; 
          width: 20px; 
          height: 20px; 
          font-size: 12px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
        }
        .notification-dropdown { 
          position: absolute; 
          top: 100%; 
          right: 0; 
          width: 320px; 
          background: ${isDarkMode ? '#2c3e50' : 'white'}; 
          border-radius: 8px; 
          margin-top: 10px; 
          z-index: 1000; 
          overflow: hidden; 
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); 
        }
        .notification-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          padding: 12px 15px; 
          border-bottom: 1px solid ${isDarkMode ? '#495057' : 'rgba(0, 0, 0, 0.05)'}; 
        }
        .notification-body { 
          max-height: 350px; 
          overflow-y: auto; 
        }
        .notification-item { 
          padding: 12px 15px; 
          border-bottom: 1px solid ${isDarkMode ? '#495057' : 'rgba(0, 0, 0, 0.05)'}; 
          cursor: pointer; 
          display: flex; 
          align-items: flex-start; 
          transition: background-color 0.2s; 
        }
        .notification-item:hover { 
          background-color: ${isDarkMode ? '#495057' : 'rgba(0, 0, 0, 0.02)'}; 
        }
        .notification-item.unread { 
          background-color: ${isDarkMode ? 'rgba(244, 120, 52, 0.1)' : 'rgba(244, 120, 52, 0.05)'}; 
        }
        .notification-thumbnail { 
          margin-right: 12px; 
          flex-shrink: 0; 
        }
        .notification-content { 
          flex: 1; 
        }
        .notification-title { 
          margin: 0; 
          font-size: 14px; 
          font-weight: 600; 
          color: ${isDarkMode ? '#ffffff' : '#2c3e50'}; 
        }
        .notification-message { 
          margin: 3px 0; 
          font-size: 13px; 
          color: ${isDarkMode ? '#adb5bd' : '#666'}; 
        }
        .notification-time { 
          color: ${isDarkMode ? '#adb5bd' : '#999'}; 
          font-size: 11px; 
        }
        .unread-indicator { 
          width: 8px; 
          height: 8px; 
          border-radius: 50%; 
          background-color: #f47834; 
          margin-left: 10px; 
          flex-shrink: 0; 
        }
        .notification-footer { 
          padding: 10px 15px; 
          text-align: center; 
          border-top: 1px solid ${isDarkMode ? '#495057' : 'rgba(0, 0, 0, 0.05)'}; 
        }
        .notification-footer a { 
          color: ${isDarkMode ? '#4dabf7' : '#f47834'}; 
          text-decoration: none; 
          font-size: 13px; 
        }
        .profile-dropdown { 
          position: absolute; 
          top: 100%; 
          right: 0; 
          width: 250px; 
          background: ${isDarkMode ? '#2c3e50' : 'white'}; 
          border-radius: 8px; 
          margin-top: 10px; 
          z-index: 1000; 
          overflow: hidden; 
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); 
        }
        .profile-header { 
          padding: 12px 15px; 
          border-bottom: 1px solid ${isDarkMode ? '#495057' : 'rgba(0, 0, 0, 0.05)'}; 
        }
        .profile-body { 
          padding: 10px; 
        }
        .profile-body .btn-link { 
          color: ${isDarkMode ? '#ffffff' : '#2c3e50'}; 
        }
        .profile-body .btn-link:hover { 
          background-color: ${isDarkMode ? '#495057' : '#f47834'}; 
          color: #fff !important; 
          border-radius: 5px; 
        }
        .profile-body button { 
          transition: all 0.3s ease-in-out; 
        }
        .profile-body button:hover i { 
          transform: scale(1.2); 
          transition: transform 0.3s ease-in-out; 
        }
        .profile-body .logout-btn:hover { 
          background-color: #f47834; 
          color: #fff !important; 
        }
        .blur-backdrop { 
          background-color: rgba(0, 0, 0, 0.5); 
          backdrop-filter: blur(5px); 
        }
        .modal-content { 
          border-radius: 25px; 
          border: none; 
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); 
          background-color: ${isDarkMode ? '#2c3e50' : 'white'}; 
          color: ${isDarkMode ? '#ffffff' : '#2c3e50'}; 
        }
        .modal-header { 
          padding: 1.5rem 1.5rem 0.5rem; 
        }
        .modal-footer { 
          padding: 0.5rem 1.5rem 1.5rem; 
        }
        .btn-danger { 
          background-color: #f47834; 
          border-color: #f47834; 
        }
        .btn-danger:hover { 
          background-color: #e05e18; 
          border-color: #e05e18; 
        }
        .telegram-logo-container { 
          background-color: ${isDarkMode ? '#495057' : '#f5f5f5'}; 
          border-radius: 50%; 
          width: 100px; 
          height: 100px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          margin-bottom: 更新: 1rem; 
        }
        .telegram-btn { 
          background-color: #0088cc; 
          border-color: #0088cc; 
        }
        .telegram-btn:hover { 
          background-color: #006699; 
          border-color: #006699; 
        }
        .rounded-modal .modal-content { 
          border-radius: 25px; 
        }
        .dropdown-menu { 
          display: none; 
          opacity: 0; 
          transition: opacity 0.3s ease-in-out; 
          position: absolute; 
          background: ${isDarkMode ? '#2c3e50' : 'white'}; 
          border: 1px solid ${isDarkMode ? '#495057' : 'rgba(0,0,0,0.1)'}; 
          min-width: 200px; 
          z-index: 1000; 
        }
        .dropdown-menu.show { 
          display: block; 
          opacity: 1; 
        }
        .dropdown-item { 
          padding: 8px 16px; 
          color: ${isDarkMode ? '#ffffff' : '#2c3e50'}; 
          text-decoration: none; 
          display: block; 
          transition: all 0.2s; 
          font-family: "'Glegoo', serif"; 
          font-size: 14px; 
        }
        .dropdown-item:hover { 
          background-color: ${isDarkMode ? '#495057' : '#f47834'}; 
          color: ${isDarkMode ? '#ffffff' : 'white'} !important; 
          border-radius: 5px; 
        }
        .dropdown-item i { 
          transition: transform 0.2s; 
        }
        .dropdown-item:hover i { 
          transform: scale(1.2); 
          color: ${isDarkMode ? '#ffffff' : 'white'}; 
        }
        .dropdown:hover .dropdown-menu { 
          display: block; 
          opacity: 1; 
        }
        .dark-mode-toggle { 
          color: ${isDarkMode ? '#ffffff' : '#2c3e50'}; 
        }
        .dark-mode-toggle { 
          padding: 5px 10px; 
        }
        .form-select {
          border-radius: 10px;
          height: 45px;
          background-color: ${isDarkMode ? '#333' : 'white'};
          color: ${isDarkMode ? '#fff' : 'black'};
          border: 1px solid ${isDarkMode ? '#555' : '#ccc'};
        }
        .form-select:focus {
          border-color: ${isDarkMode ? '#4dabf7' : '#3c3e50'};
          box-shadow: 0 0 0 2px ${isDarkMode ? 'rgba(77, 171, 247, 0.1)' : 'rgba(0, 112, 243, 0.1)'};
        }
      `}</style>
    </>
  );
};

export default Header;