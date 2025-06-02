// pages/notifications.tsx
import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Image from 'next/image';
import { collection, query, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import Head from 'next/head';
import Footer from '@/components/Footer/Footer';
import Header from '@/components/Header/Header';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp

interface Notification {
    id: string;
    title: string;
    text: string;
    thumbnailUrl: string;
    createdAt: Timestamp | Date; // Explicitly define as Timestamp or Date
    isRead?: boolean;
}

const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]); // Already correctly typed
    const [loading, setLoading] = useState(true);

    const isValidImageUrl = (url: string | null): boolean => {
        if (!url) return false;

        // Check for invalid local file paths or temporary URLs
        if (
            url.startsWith('file://') ||
            url.includes('/Containers/Data/Application/') ||
            url.includes('/Library/Caches/') ||
            url.includes('ImagePicker/')
        ) {
            return false;
        }

        // Check if it's a valid absolute URL or a relative path starting with "/"
        const isAbsoluteUrl = /^(https?:\/\/)/.test(url);
        const isRelativePath = url.startsWith('/');

        return isAbsoluteUrl || isRelativePath;
    };

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const notificationsRef = collection(db, 'notifications');
            const q = query(notificationsRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const notificationData: Notification[] = querySnapshot.docs.map(doc => {
                const data = doc.data();
                if (data.thumbnailUrl && !isValidImageUrl(data.thumbnailUrl)) {
                    console.warn(`Invalid thumbnailUrl in notification ${doc.id}: ${data.thumbnailUrl}`);
                }
                return {
                    id: doc.id,
                    ...data as Omit<Notification, 'id'>,
                    isRead: data.isRead || false,
                };
            });
            setNotifications(notificationData);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

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
            await Promise.all(unreadNotifications.map(async (notification) => {
                const notificationRef = doc(db, 'notifications', notification.id);
                await updateDoc(notificationRef, { isRead: true });
            }));
            await fetchNotifications(); // Refresh after update
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const markAllAsUnread = async () => {
        try {
            const readNotifications = notifications.filter(n => n.isRead);
            await Promise.all(readNotifications.map(async (notification) => {
                const notificationRef = doc(db, 'notifications', notification.id);
                await updateDoc(notificationRef, { isRead: false });
            }));
            await fetchNotifications(); // Refresh after update
        } catch (error) {
            console.error("Error marking all as unread:", error);
        }
    };

    const formatTime = (timestamp: Timestamp | Date) => {
        if (!timestamp) return 'Unknown time';

        let date: Date;
        // Handle Firestore Timestamp or plain Date
        if (timestamp instanceof Timestamp) {
            date = timestamp.toDate(); // Firestore Timestamp
        } else if (timestamp instanceof Date) {
            date = timestamp; // Already a Date object
        } else {
            console.error('Invalid timestamp format:', timestamp);
            return 'Invalid time';
        }

        return date.toLocaleString('en-US', {
            weekday: 'short', // e.g., "Mon"
            year: 'numeric',  // e.g., "2025"
            month: 'short',   // e.g., "Mar"
            day: 'numeric',   // e.g., "11"
            hour: '2-digit',  // e.g., "02"
            minute: '2-digit', // e.g., "30"
            hour12: true,     // e.g., "PM"
        }); // Example: "Mon, Mar 11, 2025, 02:30 PM"
    };

    const renderThumbnail = (notification: Notification) => {
        if (!notification.thumbnailUrl || !isValidImageUrl(notification.thumbnailUrl)) {
            return (
                <div
                    style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        color: '#666',
                    }}
                >
                    {notification.title.charAt(0).toUpperCase()}
                </div>
            );
        }
        return (
            <Image
                src={notification.thumbnailUrl}
                alt="Thumbnail"
                width={120}
                height={120}
                style={{ borderRadius: '10px', objectFit: 'cover', margin: 5 }}
            />
        );
    };

    return (
        <>
            <Head>
                <title>DG Smart Learn - Notifications</title>
                <link rel="icon" href="/dglogo.ico" />
            </Head>
            <Header />

            <main className="container" style={{ minHeight: 'calc(100vh - 200px)', marginTop: 90 }}>
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: -25 }}>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <div style={{
                                        borderLeft: "5px solid #2c3e50",
                                        height: "35px",
                                        marginRight: "20px",
                                        borderRadius: 15,
                                    }}></div>
                                    <h1 className="mb-4" style={{ fontSize: 35, letterSpacing: "1px", color: "#2c3e50", marginTop: 25 }}>
                                        Notifications
                                    </h1>
                                </div>
                            </div>
                            <div>
                                {notifications.some((n) => !n.isRead) && (
                                    <button
                                        className="btn btn-sm btn-primary me-2"
                                        style={{ letterSpacing: "1px" }}
                                        onClick={markAllAsRead}
                                    >
                                        Mark All as Read
                                    </button>
                                )}
                                {notifications.some((n) => n.isRead) && (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        style={{ letterSpacing: "1px" }}
                                        onClick={markAllAsUnread}
                                    >
                                        Mark All as Unread

                                    </button>
                                )}
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="list-group" style={{ borderRadius: 15 }}>
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`list-group-item list-group-item-action d-flex align-items-center ${!notification.isRead ? 'list-group-item-light' : ''}`}
                                        onClick={() => markAsRead(notification.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="me-3">
                                            {renderThumbnail(notification)}
                                        </div>
                                        <div className="flex-grow-1">
                                            <h5 className="mb-1" style={{ color: '#2c3e50', fontFamily: "'Crimson Pro', serif'" }}>
                                                {notification.title}
                                            </h5>
                                            <p className="mb-1" style={{ color: '#666', fontFamily: "'Glegoo', serif'" }}>
                                                {notification.text}
                                            </p>
                                            <small style={{ color: '#999', fontFamily: "'Crimson Pro', serif'" }}>
                                                {formatTime(notification.createdAt)}
                                            </small>
                                        </div>
                                        {!notification.isRead && (
                                            <span className="badge ms-5" style={{ fontFamily: "'Glegoo', serif", letterSpacing: "1px", padding: 10, color: "#0D6EFD", backgroundColor: "transparent", fontSize: 16 }}>
                                                New
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-5" style={{ color: '#2c3e50', fontFamily: "'Crimson Pro', serif'" }}>
                                No notifications available
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />

            <style jsx>{`
        .list-group-item:hover {
          background-color: rgba(0, 0, 0, 0.03);
        }
        .list-group-item-light {
          background-color: rgba(244, 120, 52, 0.1);
        }
        .btn-primary {
          background-color: #f47834;
          border-color: #f47834;
        }
        .btn-primary:hover {
          background-color: #e06620;
          border-color: #e06620;
        }
      `}</style>
        </>
    );
};

export default NotificationsPage;