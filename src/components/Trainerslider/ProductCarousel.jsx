'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/config/firebaseConfig'; // Adjust path to your firebase config
import { collection, getDocs } from 'firebase/firestore';
import T1 from "@/assets/png/T-1.png";
import T2 from "@/assets/png/T-2.png";
import T3 from "@/assets/png/T-3.png";
import T4 from "@/assets/png/T-4.png";
import T5 from "@/assets/png/T-5.png";
import T6 from "@/assets/png/T-6.png";
import T7 from "@/assets/png/T-7.png";
import T8 from "@/assets/png/T-8.png";
import T9 from "@/assets/png/T-9.png";
import T10 from "@/assets/png/T-10.png";
import T11 from "@/assets/png/T-11.png";
import T12 from "@/assets/png/T-12.png";
import T13 from "@/assets/png/T-13.png";
import T14 from "@/assets/png/T-14.png";
import T15 from "@/assets/png/T-15.png";
import T16 from "@/assets/png/T-16.png";

const ProductCarousel = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Fallback static data (your original data)
    const staticTrainers = [
        { id: 1, title: 'Mr. Gurbakhish (gb) Singh', description: 'Trainer', image: T1 },
        { id: 2, title: 'Dr. Jean Yves Le Corre', description: 'Trainer', image: T2 },
        { id: 3, title: 'Mr. Somnoas​ Vibol', description: 'Trainer', image: T3 },
        { id: 4, title: 'DR. Kea Bora', description: 'Trainer', image: T4 },
        { id: 5, title: 'Mr. Cheam Sithy', description: 'Trainer', image: T5 },
        { id: 6, title: 'Mr. Sek Socheat', description: 'Trainer', image: T6 },
        { id: 7, title: 'Mr. Tay Kay Luan', description: 'Trainer', image: T7 },
        { id: 8, title: 'Mr. Andrew Silberman', description: 'Trainer', image: T8 },
        { id: 9, title: 'Dr. GilBert NG', description: 'Trainer', image: T9 },
        { id: 10, title: 'Mr. Chan Serey', description: 'Trainer', image: T10 },
        { id: 11, title: 'Mr. Hin Sopheap', description: 'Trainer', image: T11 },
        { id: 12, title: 'Mr. Ngeth Chou', description: 'Trainer', image: T12 },
        { id: 13, title: 'Prof. Dr. Somboon Mongkolsombat', description: 'Trainer', image: T13 },
        { id: 14, title: 'Dr. Siam Monileak', description: 'Trainer', image: T14 },
        { id: 15, title: 'Mr. Yun Phan', description: 'Trainer', image: T15 },
        { id: 16, title: 'Mr. Chim Guanghui', description: 'Trainer', image: T16 }
    ];

    useEffect(() => {
        fetchTrainersFromFirebase();
    }, []);

    const fetchTrainersFromFirebase = async () => {
        try {
            const trainersCollection = collection(db, 'trainers');
            const trainersSnapshot = await getDocs(trainersCollection);
            const trainersData = trainersSnapshot.docs.map(doc => ({
                id: doc.id,
                title: doc.data().instructor,
                description: 'Trainer',
                image: doc.data().profile,
                firebaseId: doc.id,
                courseCount: doc.data().courseCount,
                rating: doc.data().rating,
                skill: doc.data().skill,
                cover: doc.data().cover,
                ...doc.data()
            }));
            
            if (trainersData.length > 0) {
                setTrainers(trainersData);
            } else {
                // Use static data as fallback
                setTrainers(staticTrainers);
            }
        } catch (error) {
            console.error('Error fetching trainers:', error);
            // Use static data as fallback
            setTrainers(staticTrainers);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (trainers.length > 4) {
            const interval = setInterval(() => {
                setActiveIndex((prevIndex) => (prevIndex + 1) % (trainers.length - 3));
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [trainers.length]);

    const handleNext = () => {
        setActiveIndex((prevIndex) =>
            prevIndex < trainers.length - 4 ? prevIndex + 1 : 0
        );
    };

    const handlePrev = () => {
        setActiveIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : trainers.length - 4
        );
    };

    const handleDotClick = (index) => {
        setActiveIndex(index);
    };

    const handleViewDetails = (trainer) => {
        // Navigate to trainer detail page
        const trainerId = trainer.firebaseId || trainer.id;
        router.push(`/trainers/${trainerId}`);
    };

    if (loading) {
        return (
            <div className="container my-5">
                <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Get 4 visible trainers based on current activeIndex
    const visibleTrainers = trainers.slice(activeIndex, activeIndex + 4);

    return (
        <div className="container my-5">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 25, paddingBottom: 20 }}>
                <h1 className="mb-4" style={{ fontSize: 25, letterSpacing: "1px", color: "#2c3e50", marginTop: 25, textAlign: "center" }}>
                    Trainers
                </h1>
            </div>

            <div className="position-relative">
                <div className="row">
                    {visibleTrainers.map((trainer) => (
                        <div key={trainer.id} className="col-md-3">
                            <div className="card product-card text-center" style={{ border: "none", height: '100%', backgroundColor: "transparent" }}>
                                <div className="position-relative" style={{ height: '205px', width: "180px", margin: "0 auto" }}>
                                    <Image
                                        src={trainer.image || trainer.profile || '/default-profile.jpg'}
                                        alt={trainer.title || trainer.instructor}
                                        layout="intrinsic"
                                        width={180}
                                        height={205}
                                        style={{ objectFit: 'cover', borderRadius: '10px' }}
                                        priority={true}
                                    />
                                </div>
                                <div className="card-body">
                                    <h2 className="card-title" style={{ color: "#2c3e50", fontFamily: "'Acme', sans-serif", fontSize: 20 }}>
                                        {trainer.title || trainer.instructor}
                                    </h2>
                                    <h2 style={{ fontWeight: 400, color: "#2c3e50", fontFamily: "'Livvic', sans-serif", fontSize: 16 }}>
                                        {trainer.description}
                                    </h2>
                                    
                                    {/* Rating */}
                                    {trainer.rating && (
                                        <div className="mb-2">
                                            <span className="text-warning small">
                                                {'★'.repeat(Math.floor(trainer.rating))}
                                                {'☆'.repeat(5 - Math.floor(trainer.rating))}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {/* View Details Button */}
                                    <div className="mt-2">
                                        <button 
                                            className="btn btn-primary btn-sm px-3"
                                            onClick={() => handleViewDetails(trainer)}
                                            style={{
                                                backgroundColor: '#2c3e50',
                                                borderColor: '#2c3e50',
                                                fontSize: '0.8rem',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handlePrev}
                    className="carousel-control-prev"
                    type="button"
                >
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                </button>
                <button
                    onClick={handleNext}
                    className="carousel-control-next"
                    type="button"
                >
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                </button>
            </div>

            <div className="d-flex justify-content-center mt-0">
                {trainers.slice(0, trainers.length - 3).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => handleDotClick(index)}
                        className={`mx-2 custom-dot ${index === activeIndex ? 'active' : ''}`}
                        aria-label={`Slide ${index + 1}`}
                        style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: index === activeIndex ? '#2c3e50' : '#e0e0e0',
                            border: 'none',
                            padding: 0,
                            transition: 'all 0.5s ease'
                        }}
                    ></button>
                ))}
            </div>

            <style jsx>{`
                .product-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                
                .product-card:hover {
                    transform: translateY(-5px);
                }

                .custom-dot.active {
                    background-color: #2c3e50 !important;
                    transform: scale(1.5);
                }

                .custom-dot:hover {
                    background-color: #95a5a6 !important;
                    cursor: pointer;
                }

                .btn:hover {
                    background-color: #34495e !important;
                    border-color: #34495e !important;
                    transform: translateY(-1px);
                }

                @media (max-width: 768px) {
                    .custom-dot {
                        width: 10px !important;
                        height: 10px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProductCarousel;