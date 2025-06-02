'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import SDF from "@/assets/png/sdf.png";
import MOEY from "@/assets/png/moeaf.jpg";
import ACAR from "@/assets/png/arkar.png";
import GIOLINK from "@/assets/png/geolink.png";
import ANGKORGREEN from "@/assets/png/angkorgreen.jpg";
import RS from "@/assets/png/rs.jpg";
import ABA from "@/assets/png/aba.png";
import POMA from "@/assets/png/poma.png";
import KOFI from "@/assets/png/kofi.png";
import FOODPANDA from "@/assets/png/foodpanda.png";
import SAMSONG from "@/assets/png/samsong.png";
import TAIGRON from "@/assets/png/tigrone.png";
import TECHZONE from "@/assets/png/techzone.png";




const ClientLogoSlider = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    // All available logos
    const logos = [
        { src: SDF, alt: "Client Logo 1" },
        { src: MOEY, alt: "Client Logo 2" },
        { src: ACAR, alt: "Client Logo 3" },
        { src: GIOLINK, alt: "Client Logo 4" },
        { src: ANGKORGREEN, alt: "Client Logo 5" },
        { src: RS, alt: "Client Logo 6" },
        { src: ABA, alt: "Client Logo 7" },
        { src: POMA, alt: "Client Logo 8" },
        { src: KOFI, alt: "Client Logo 9" },
        { src: FOODPANDA, alt: "Client Logo 10" },
        { src: SAMSONG, alt: "Client Logo 11" },
        { src: TAIGRON, alt: "Client Logo 12" },
        { src: TECHZONE, alt: "Client Logo 13" },
    ];

    // Number of visible logos
    const visibleLogos = 7;
    const totalSlides = logos.length;

    useEffect(() => {
        // Auto-sliding setup
        const interval = setInterval(() => {
            setActiveIndex((prevIndex) => (prevIndex + 1) % totalSlides);
        }, 1000);

        return () => clearInterval(interval);
    }, [totalSlides]);

    return (
        <>
            <div className="container">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 25 }}>
                    <h1 className="mb-4" style={{ fontSize: 25, letterSpacing: "1px", color: "#2c3e50", marginTop: 25, textAlign: "center" }}>
                        Our Partners
                    </h1>
                </div>
            </div>

            <div className="container-fluid  py-5">
                <div className="row">
                    <div className="col-12">
                        <div className="slider-container">
                            <div className="slider-track">
                                {/* Duplicate the logos array to create a seamless infinite effect */}
                                {[...logos, ...logos].map((logo, index) => (
                                    <div
                                        key={`logo-${index}`}
                                        className="logo-slide"
                                        style={{
                                            transform: `translateX(-${activeIndex * (100 / visibleLogos)}%)`
                                        }}
                                    >
                                        <Image
                                            src={logo.src}
                                            alt={logo.alt}
                                            width={110} // Set a fixed width for the image
                                            height={105} // Set a fixed height for the image
                                            className="client-logo"
                                            style={{
                                                objectFit: 'contain', // Ensures the image is fully contained within the container
                                                display: 'block',
                                                borderRadius: 25 // Fixes spacing issues below the image
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Include CSS styles in component */}
                <style jsx>{`
                .logo-slider-container {
                    background-color: #fff;
                    overflow: hidden;
                }
                
                .slider-container {
                    width: 100%;
                    overflow: hidden;
                    position: relative;
                }
                
                .slider-track {
                    display: flex;
                    width: 100%;
                    position: relative;
                }
                
                .logo-slide {
                    flex: 0 0 calc(100% / ${visibleLogos});
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 10px;
                    height: 100px;
                    transition: transform 0.5s ease;
                }
                
                .client-logo {
                    max-width: 100%;
                    height: auto;
                }
                
                @media (max-width: 992px) {
                    .logo-slide {
                        flex: 0 0 calc(100% / 5);
                    }
                }
                
                @media (max-width: 768px) {
                    .logo-slide {
                        flex: 0 0 calc(100% / 4);
                    }
                }
                
                @media (max-width: 576px) {
                    .logo-slide {
                        flex: 0 0 calc(100% / 3);
                    }
                }
                
                @media (max-width: 480px) {
                    .logo-slide {
                        flex: 0 0 calc(100% / 2);
                    }
                }
            `}</style>
            </div>
        </>


    );
};

export default ClientLogoSlider;