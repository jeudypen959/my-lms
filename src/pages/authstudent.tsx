"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail,
  signInWithPopup,
  FacebookAuthProvider,
  GoogleAuthProvider
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/config/firebaseConfig";
import dynamic from "next/dynamic";
import { Eye, EyeOff } from "lucide-react";
import DG from "@/assets/animation/DG.json";
import BGAnimation from "@/assets/animation/bg-style3.json";
import SuccessAnimation from "@/assets/animation/success.json";
import ErrorAnimation from "@/assets/animation/failed.json";
import LoadingAnimation from "@/assets/animation/loading1.json";
import Link from "next/link";
import Head from "next/head";
import Facebooklog from "@/assets/png/facebook-white-log.png";
import Googlelog from "@/assets/png/google-log.png";
import Image from "next/image";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// Define interfaces for type safety
interface Message {
  text: string;
  type: "success" | "error" | "loading" | "";
}

interface MessageModalProps {
  message: Message;
  setMessage: React.Dispatch<React.SetStateAction<Message>>;
}

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

interface LoginButtonsProps {
  setMessage: React.Dispatch<React.SetStateAction<Message>>;
  router: ReturnType<typeof useRouter>;
}

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
}

const MessageModal = ({ message, setMessage }: MessageModalProps) => {
  if (!message.text) return null;

  const getAnimationData = () => {
    switch (message.type) {
      case "success":
        return SuccessAnimation;
      case "error":
        return ErrorAnimation;
      case "loading":
        return LoadingAnimation;
      default:
        return LoadingAnimation;
    }
  };

  return (
    <>
      <div
        className="position-fixed w-100 h-100 d-flex align-items-center justify-content-center"
        style={{
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 1050,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={() => message.type !== "loading" && setMessage({ text: "", type: "" })}
      >
        <div
          className="bg-white p-4 rounded-4 shadow-lg text-center"
          style={{
            width: 380,
            height: 380,
            animation: "modalPop 0.3s ease",
            border: `2px solid ${message.type === "error" ? "#e74c3c" : message.type === "success" ? "#2ecc71" : "#34495e"}`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-5 d-flex justify-content-center align-items-center" style={{ height: "150px" }}>
            <Lottie animationData={getAnimationData()} loop={message.type === "loading"} autoplay={true} style={{ width: 200, height: 200 }} />
          </div>
          <h2
            className="fs-5 fw-semibold"
            style={{
              color: message.type === "error" ? "#e74c3c" : message.type === "success" ? "#2ecc71" : "#34495e",
              fontFamily: "'Acme', sans-serif",
              letterSpacing: "1px",
            }}
          >
            {message.text}
          </h2>
          <button
            className="btn mt-4 rounded-3 w-100"
            onClick={() => setMessage({ text: "", type: "" })}
            disabled={message.type === "loading"}
            style={{
              backgroundColor: message.type === "error" ? "#e74c3c" : message.type === "success" ? "#2ecc71" : "#34495e",
              color: "white",
              letterSpacing: "1px",
              padding: 10,
            }}
          >
            {message.type === "success" ? "Continue" : message.type === "loading" ? "Processing..." : "Okay"}
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes modalPop {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

const FloatingInput = ({
  label,
  type,
  value,
  onChange,
  name,
  required,
  showPassword,
  onTogglePassword
}: FloatingInputProps) => {
  const isPassword = type === "password";
  return (
    <div className="form-floating mb-3 position-relative">
      <input
        type={showPassword ? "text" : type}
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

const LoginButtons = ({ setMessage, router }: LoginButtonsProps) => {
  const handleFacebookLogin = async () => {
    try {
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (error) {
      const errorMessage = error instanceof FirebaseError ? error.message : "An unknown error occurred";
      setMessage({ text: `Facebook login failed: ${errorMessage}`, type: "error" });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (error) {
      const errorMessage = error instanceof FirebaseError ? error.message : "An unknown error occurred";
      setMessage({ text: `Google login failed: ${errorMessage}`, type: "error" });
    }
  };

  return (
    <div>
      <button
        type="button"
        className="btn w-100 mb-2"
        style={{
          backgroundColor: "#3b5998",
          borderRadius: 15,
          border: "none",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 15,
        }}
        onClick={handleFacebookLogin}
      >
        <Image src={Facebooklog} alt="Facebook" width={30} height={30} style={{ marginTop: 3, marginBottom: 3 }} />
        LOGIN WITH FACEBOOK
      </button>
      <button
        type="button"
        className="btn w-100"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 15,
          border: "1px solid #dadce0",
          color: "#3c4043",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 15,
        }}
        onClick={handleGoogleLogin}
      >
        <Image src={Googlelog} alt="Google" width={30} height={30} />
        LOGIN WITH GOOGLE
      </button>
    </div>
  );
};

export default function AuthPreview() {
  const router = useRouter();
  const [message, setMessage] = useState<Message>({ text: "", type: "" });
  const [loginData, setLoginData] = useState<LoginData>({ email: "", password: "" });
  const [signupData, setSignupData] = useState<SignupData>({ email: "", password: "" });
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [showSignupPassword, setShowSignupPassword] = useState<boolean>(false);
  const [saveLogin, setSaveLogin] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/");
    });
    return () => unsubscribe();
  }, [router]);

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage({ text: "Please Wait", type: "loading" });
    try {
      await setPersistence(auth, saveLogin ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      setMessage({ text: "You have logged in successfully!", type: "success" });
      setTimeout(() => router.push("/"), 1500);
    } catch (error) {
      const errorMessage = error instanceof FirebaseError ? error.message : "An unknown error occurred";
      setMessage({ text: `Login failed: ${errorMessage}`, type: "error" });
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage({ text: "Please Wait", type: "loading" });
    try {
      if (signupData.password.length < 6) throw new Error("Password must be at least 6 characters.");
      await createUserWithEmailAndPassword(auth, signupData.email, signupData.password);
      setMessage({ text: "Account created successfully!", type: "success" });
      setTimeout(() => router.push("/"), 1500);
    } catch (error) {
      const errorMessage = error instanceof FirebaseError ? error.message : "An unknown error occurred";
      setMessage({ text: `Signup failed: ${errorMessage}`, type: "error" });
    }
  };

  const handleForgotPassword = async () => {
    if (!loginData.email) {
      setMessage({ text: "Please enter your email first", type: "error" });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, loginData.email);
      setMessage({ text: "Password reset link has been sent to your email", type: "success" });
    } catch (error) {
      const errorMessage = error instanceof FirebaseError ? error.message : "An unknown error occurred";
      setMessage({ text: `Error: ${errorMessage}`, type: "error" });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, setData: React.Dispatch<React.SetStateAction<LoginData | SignupData>>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: -1 }}>
        <Lottie animationData={BGAnimation} loop={true} />
      </div>

      <Head>
        <title>DG Next - Student Auth</title>
        <link rel="icon" href="/dglogo.ico" />
      </Head>

      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
        <div className="card shadow-lg p-3 mb-5 bg-white" style={{ width: "800px", borderRadius: "25px" }}>
          <div className="card-body p-0">
            <div className="row g-0">
              {/* Left Side - Animation/Logo */}
              <div className="col-md-5 d-flex flex-column align-items-center justify-content-center bg-light" style={{ borderRadius: "20px 0 0 20px" }}>
                <Lottie animationData={DG} loop autoplay style={{ width: 350, height: 350 }} />
                <h5 className="text-center fw-bold" style={{ fontSize: "24px", fontFamily: "'Acme', sans-serif", color: "#2c3e50" }}>
                  DG Smart Learn
                </h5>
                <p className="text-center text-muted mb-0">Your pathway to knowledge</p>
              </div>

              {/* Right Side - Form */}
              <div className="col-md-7 p-4">
                <h5 className="card-title fw-bold text-center" style={{ fontSize: "24px", fontFamily: "'Acme', sans-serif", color: "#2c3e50", marginBottom: "20px" }}>
                  Student Authentication
                </h5>

                <ul className="nav nav-tabs mb-4 justify-content-center" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button className="nav-link active mx-2 custom-tab-button" data-bs-toggle="tab" data-bs-target="#login" type="button">
                      SIGN IN
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link mx-2 custom-tab-button" data-bs-toggle="tab" data-bs-target="#signup" type="button">
                      SIGN UP
                    </button>
                  </li>
                </ul>

                <div className="tab-content">
                  <div className="tab-pane fade show active" id="login">
                    <form onSubmit={handleLoginSubmit}>
                      <FloatingInput
                        label="Enter your email"
                        type="email"
                        name="email"
                        value={loginData.email}
                        onChange={(e) => handleChange(e, setLoginData)}
                        required
                      />
                      <FloatingInput
                        label="Enter your password"
                        type="password"
                        name="password"
                        value={loginData.password}
                        onChange={(e) => handleChange(e, setLoginData)}
                        required
                        showPassword={showLoginPassword}
                        onTogglePassword={() => setShowLoginPassword(!showLoginPassword)}
                      />

                      {/* Save Login checkbox */}
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="saveLogin"
                            checked={saveLogin}
                            onChange={(e) => setSaveLogin(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="saveLogin" style={{ fontSize: "14px", fontFamily: "'Livvic', sans-serif", fontWeight: 500, color: "#2c3e50" }}>
                            Save Login
                          </label>
                        </div>

                        {/* Forgot Password link */}
                        <div>
                          <a
                            href="#"
                            className="text-decoration-none"
                            style={{ fontSize: "14px", fontFamily: "'Livvic', sans-serif", fontWeight: 500, color: "#2c3e50" }}
                            onClick={(e) => {
                              e.preventDefault();
                              handleForgotPassword();
                            }}
                          >
                            Forgot Password?
                          </a>
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary w-100" style={{ backgroundColor: "#2c3e50", borderRadius: 15 }}>
                        LOGIN
                      </button>

                      <Link href={"/"}>
                        <button className="btn btn-primary w-100" style={{ backgroundColor: "#6ca6df", marginTop: 10, borderRadius: 15, border: "1px solid #6ca6df", fontFamily: "'Acme', sans-serif" }}>
                          BACK
                        </button>
                      </Link>

                      <div style={{ padding: 10, marginTop: 15, marginBottom: 0 }}>
                        <h5 style={{ fontSize: "16px", fontFamily: "'Livvic', sans-serif", fontWeight: 500, color: "#2c3e50", textAlign: "center" }}>Or Sign in With</h5>
                      </div>

                      <LoginButtons setMessage={setMessage} router={router} />
                    </form>
                  </div>
                  <div className="tab-pane fade" id="signup">
                    <form onSubmit={handleSignupSubmit}>
                      <FloatingInput
                        label="Enter your email"
                        type="email"
                        name="email"
                        value={signupData.email}
                        onChange={(e) => handleChange(e, setSignupData)}
                        required
                      />
                      <FloatingInput
                        label="Enter your password"
                        type="password"
                        name="password"
                        value={signupData.password}
                        onChange={(e) => handleChange(e, setSignupData)}
                        required
                        showPassword={showSignupPassword}
                        onTogglePassword={() => setShowSignupPassword(!showSignupPassword)}
                      />

                      <button type="submit" className="btn btn-primary w-100" style={{ backgroundColor: "#2c3e50", borderRadius: 15 }}>
                        REGISTER
                      </button>

                      <Link href={"/"}>
                        <button className="btn btn-primary w-100" style={{ backgroundColor: "#6ca6df", marginTop: 10, borderRadius: 15, border: "1px solid #6ca6df", fontFamily: "'Acme', sans-serif" }}>
                          BACK
                        </button>
                      </Link>

                      <div style={{ padding: 10, marginTop: 15, marginBottom: 0 }}>
                        <h5 style={{ fontSize: "16px", fontFamily: "'Livvic', sans-serif", fontWeight: 500, color: "#2c3e50", textAlign: "center" }}>Or Sign Up With</h5>
                      </div>

                      <LoginButtons setMessage={setMessage} router={router} />
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center text-muted small" style={{ fontFamily: "'Barlow', sans-serif", color: "#2c3e50" }}>
          Powered by DG Smart Learn © {new Date().getFullYear()}
        </footer>
      </div>

      <MessageModal message={message} setMessage={setMessage} />
    </>
  );
}