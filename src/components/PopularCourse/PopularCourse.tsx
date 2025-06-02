"use client";

import React, { useEffect, useState } from "react";
import { db, auth } from "@/config/firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "bootstrap/dist/css/bootstrap.min.css";
import Link from "next/link";
import Image from "next/image";

// Define Course interface
interface Course {
  id: string;
  thumbnail: string;
  courseTitle: string;
  instructor: string;
  categories: string;
  duration: string;
  price: number;
  total_students: number;
}

// Define Enrollment interface
interface Enrollment {
  courseId: string;
  enrollmentDate?: Date | string;
  status?: string;
}

export default function PopularCourse() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null); // Linter suppression (remove if not needed)

  // Function to check user enrollment status
  const checkEnrollmentStatus = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const enrollmentArray: Enrollment[] = userData.enrollment || [];
        const enrolledIds = enrollmentArray.map(enrollment => enrollment.courseId);
        setEnrolledCourses(enrolledIds);
      }
    } catch (err) {
      console.error('Error checking enrollment:', err);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        const coursesList = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Course, 'id'>),
            price: Number(doc.data().price) || 0, // Ensure price is a number
          }))
          .filter((course): course is Course => 
            typeof course.total_students === 'number'
          )
          .sort((a, b) => b.total_students - a.total_students);
  
        setCourses(coursesList);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
  
    // Authentication state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthenticated(!!user);
      if (user && user.uid) {
        setUserId(user.uid);
        await checkEnrollmentStatus(user.uid);
      } else {
        setUserId(null);
        setEnrolledCourses([]);
      }
      // Explicit usage of userId to satisfy linter
      if (userId) {
        console.log(`Current user ID: ${userId}`); // Remove in production
      }
    });

    fetchCourses();
    
    // Cleanup function
    return () => unsubscribe();
  }, [userId]); // Added userId to dependency array

  // Function to check if a course is enrolled
  const isEnrolled = (courseId: string) => {
    return enrolledCourses.includes(courseId);
  };

  const toggleDisplayCount = () => {
    setIsExpanded(!isExpanded);
  };

  const displayCount = isExpanded ? 8 : 4;

  return (
    <div className="container" style={{ paddingBottom: 30 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: -25,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            className="popular-posts-line"
            style={{ height: 35, borderRadius: 50 }}
          ></div>
          <h1
            className="mb-4"
            style={{
              fontSize: 25,
              letterSpacing: "1px",
              color: "#2c3e50",
              marginTop: 25,
            }}
          >
            Popular Courses
          </h1>
        </div>
        <div></div>
      </div>

      <div className="container my-0">
        {loading ? (
          <p>Loading courses...</p>
        ) : (
          <div className="d-flex flex-wrap justify-content-center">
            {courses.slice(0, displayCount).map((course) => (
              <div key={course.id} className="p-2" style={{ flex: "0 0 25%" }}>
                <div
                  className="card h-100"
                  style={{
                    borderRadius: "15px",
                    overflow: "hidden",
                    border: "1px solid #bdbdbd",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <Image
                      src={course.thumbnail}
                      alt={course.courseTitle}
                      width={300}
                      height={200}
                      style={{ borderRadius: 18, padding: 7 }}
                    />
                    <div 
                      style={{ 
                        position: "absolute", 
                        top: 15, 
                        right: 15, 
                        backgroundColor: "#2c3e50", 
                        color: "white", 
                        padding: "4px 8px", 
                        borderRadius: "8px", 
                        fontWeight: "bold",
                      }}
                    >
                      {course.price === 0 ? 'Free' : `$${Number(course.price).toFixed(2)}`}
                    </div>
                  </div>
                  <div className="card-body">
                    <h5
                      className="card-title"
                      style={{
                        color: "#2c3e50",
                        fontFamily: "'Acme', sans-serif",
                      }}
                    >
                      {course.courseTitle.length > 25
                        ? course.courseTitle.substring(0, 25) + "..."
                        : course.courseTitle}
                    </h5>
                    <p
                      className="card-text"
                      style={{ fontWeight: 400, color: "#2c3e50" }}
                    >
                      Instructor: {course.instructor}
                    </p>
                    {isAuthenticated ? (
                      isEnrolled(course.id) ? (
                        <Link href={`/course/${course.id}/learn`} passHref>
                          <button 
                            style={{
                              fontFamily: "'Livvic', sans-serif", 
                              fontSize: "16px", 
                              letterSpacing: "1px",
                              backgroundColor: "#198754",
                              borderColor: "#198754"
                            }} 
                            className="btn search-btn w-100"
                          >
                            <i className="bi bi-play-circle me-2"></i> Start Learning
                          </button>
                        </Link>
                      ) : (
                        <Link href={`/payment/${course.id}`} passHref>
                          <button 
                            style={{
                              fontFamily: "'Livvic', sans-serif", 
                              fontSize: "16px", 
                              letterSpacing: "1px"
                            }} 
                            className="btn search-btn w-100"
                          >
                            Enroll Now!
                          </button>
                        </Link>
                      )
                    ) : (
                      <Link href="/authstudent" passHref>
                        <button 
                          style={{
                            fontFamily: "'Livvic', sans-serif", 
                            fontSize: "16px", 
                            letterSpacing: "1px"
                          }} 
                          className="btn search-btn w-100"
                        >
                          <i className="bi bi-lock me-2"></i> Login to Enroll
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                gap: "10px",
                width: "100%",
                marginLeft: 5,
              }}
            >
              <button
                className="btn btn-link"
                onClick={toggleDisplayCount}
                style={{
                  fontSize: 16,
                  color: "#fff",
                  textDecoration: "none",
                  backgroundColor: "#2c3e50",
                  border: "0px solid #2c3e50",
                  borderRadius: 10,
                  cursor: "pointer",
                  paddingLeft: 15,
                  paddingRight: 15,
                  marginTop: 5,
                  paddingTop: 10,
                  paddingBottom: 10,
                  width: "120px",
                  height: "45px",
                  transition: "background-color 0.3s",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = "#6CA3D6";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = "#2c3e50";
                }}
              >
                {isExpanded ? "Show Less" : "Show More"}
              </button>

              <Link href="/courselist">
                <button
                  className="btn btn-link"
                  style={{
                    fontSize: 16,
                    color: "#2c3e50",
                    textDecoration: "none",
                    backgroundColor: "#fff",
                    border: "1px solid #2c3e50",
                    borderRadius: 10,
                    cursor: "pointer",
                    paddingLeft: 15,
                    paddingRight: 15,
                    marginTop: 5,
                    position: "relative",
                    width: "120px",
                    height: "45px",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    const h5 = e.currentTarget.querySelector("h5");
                    if (h5) {
                      h5.style.borderBottom = "1px solid #2c3e50";
                      e.currentTarget.style.backgroundColor = "#dddddd";
                    }
                  }}
                  onMouseLeave={(e) => {
                    const h5 = e.currentTarget.querySelector("h5");
                    if (h5) {
                      h5.style.borderBottom = "none";
                      e.currentTarget.style.backgroundColor = "#fff";
                    }
                  }}
                >
                  <h5
                    style={{
                      textAlign: "center",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 0,
                      marginTop: 0,
                      fontSize: 16,
                      transition: "border-bottom 0.3s ease",
                    }}
                  >
                    View All ▶
                  </h5>
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .card {
          transition: transform 0.3s ease; /* Animation for transform */
        }

        .card:hover {
          transform: translateY(-10px); /* Lift effect on hover */
          box-shadow: 0 5px 10px rgba(23, 49, 73, 0.158); /* Optional: Enhance shadow on hover */
        }
      `}</style>
    </div>
  );
}