"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { Button, Col, Container, Row } from "react-bootstrap";
import SearchBar from "@/components/SearchBar/SearchBar";
import { useRouter } from "next/router"; // Replace with 'next/navigation' for App Router
import Image from "next/image";
import { db, auth } from "@/config/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

// Define the Group interface to type the groups state
interface Group {
  id: string;
  title: string;
  description: string;
  bio: string;
  guidelines: string[];
  thumbnail: string;
  type: string;
  isPublic: boolean;
  members: number;
  createdAt: Timestamp | null;
  createdBy: string;
  creatorName: string;
  creatorEmail: string;
  img: string;
  created: string;
}

// Define the FormData interface for formData state
interface FormData {
  title: string;
  description: string;
  type: string;
  thumbnail: string;
  bio: string;
  guidelines: string;
}

export default function GroupManagement() {
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    type: "",
    thumbnail: "",
    bio: "",
    guidelines: "",
  });
  const [filterType, setFilterType] = useState<"all" | "public" | "private">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  // Check if user is authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        console.log("User not authenticated");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    // Check initial dark mode state
    const isDarkMode =
      document.body.classList.contains("dark-mode") ||
      localStorage.getItem("darkMode") === "true";
    setDarkMode(isDarkMode);

    // Listen for dark mode changes
    const handleDarkModeChange = () => {
      const newDarkMode = document.body.classList.contains("dark-mode");
      setDarkMode(newDarkMode);
      localStorage.setItem("darkMode", newDarkMode.toString());
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          handleDarkModeChange();
        }
      });
    });

    observer.observe(document.body, { attributes: true });

    // Fetch groups from Firebase
    const fetchGroups = async () => {
      try {
        setLoading(true);
        let groupQuery;

        if (filterType === "public") {
          groupQuery = query(
            collection(db, "groups"),
            where("isPublic", "==", true),
            orderBy("createdAt", "desc")
          );
        } else if (filterType === "private") {
          groupQuery = query(
            collection(db, "groups"),
            where("isPublic", "==", false),
            orderBy("createdAt", "desc")
          );
        } else {
          groupQuery = query(
            collection(db, "groups"),
            orderBy("createdAt", "desc")
          );
        }

        const querySnapshot = await getDocs(groupQuery);
        const groupsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          created: formatDate(doc.data().createdAt),
        })) as Group[];

        setGroups(groupsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching groups:", err);
        setError("Failed to load groups. Please try again later.");
        setLoading(false);
      }
    };

    fetchGroups();

    return () => observer.disconnect();
  }, [filterType]);

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return "Unknown date";
    const date = timestamp.toDate();
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const handleJoinGroup = (groupId: string) => {
    router.push(`/community/${groupId}`);
  };

  const handleModalToggle = () => setShowModal(!showModal);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFilterChange = (type: string) => {
    setFilterType(type as "all" | "public" | "private");
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.title || !formData.type) {
      const form = e.target as HTMLFormElement;
      form.classList.add("was-validated");
      return;
    }

    try {
      const guidelinesArray = formData.guidelines
        ? formData.guidelines
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line)
          .map((line) => (line.startsWith("•") ? line : `• ${line}`))
        : [];

      const newGroup = {
        title: formData.title,
        description: formData.description || "",
        bio: formData.bio || "",
        guidelines: guidelinesArray,
        thumbnail:
          formData.thumbnail ||
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
        type: formData.type,
        isPublic: formData.type === "public",
        members: 1,
        createdAt: Timestamp.now(),
        createdBy: currentUser?.uid || "anonymous",
        creatorName: currentUser?.displayName || "Anonymous User",
        creatorEmail: currentUser?.email || "",
        img:
          formData.thumbnail ||
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
      };

      await addDoc(collection(db, "groups"), newGroup);

      setFormData({
        title: "",
        description: "",
        type: "",
        thumbnail: "",
        bio: "",
        guidelines: "",
      });
      setShowModal(false);

      // Refetch groups by triggering useEffect
      setFilterType((prev) => prev);
    } catch (err) {
      console.error("Error creating group:", err);
      alert("Failed to create group. Please try again.");
    }
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>DG Next - Group Management</title>
        <link rel="icon" href="/dglogo.ico" />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
        />
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
          async
        ></script>
      </Head>
      <Header />

      <style jsx global>{`
        :root {
          --primary: ${darkMode ? "#4dabf7" : "#0070f3"};
          --secondary: ${darkMode ? "#2c3e50" : "#f5f5f5"};
          --secondary-foreground: ${darkMode ? "#ffffff" : "#111111"};
          --accent: ${darkMode ? "#66bfff" : "#00a8ff"};
          --accent-foreground: #ffffff;
          --foreground: ${darkMode ? "#ffffff" : "#111111"};
          --card: ${darkMode ? "#2c3e50" : "#ffffff"};
          --card-foreground: ${darkMode ? "#ffffff" : "#111111"};
          --border: ${darkMode ? "#495057" : "#e5e5e5"};
          --input: ${darkMode ? "#2c3e50" : "#ffffff"};
          --ring: ${darkMode ? "#4dabf7" : "#0070f3"};
          --radius: 0.5rem;
          --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        html,
        body {
          height: 100%;
          margin: 0;
          padding: 0;
          background-color: var(--secondary);
          color: var(--foreground);
        }

        .page-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 70vh;
          padding: 1rem;
        }

        .card {
          border: 1px solid var(--border);
          border-radius: var(--radius);
          transition: transform 0.2s, box-shadow 0.2s;
          background-color: var(--card);
          color: var(--card-foreground);
        }

        .group-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow);
        }

        .card-img-top {
          height: 200px;
          object-fit: cover;
          border-top-left-radius: var(--radius);
          border-top-right-radius: var(--radius);
        }

        .btn-primary {
          background-color: var(--primary);
          border-color: var(--primary);
          color: var(--primary-foreground);
        }

        .btn-primary:hover {
          background-color: var(--accent);
          border-color: var(--accent);
        }

        .btn-outline-primary {
          color: var(--primary);
          border-color: var(--primary);
        }

        .btn-outline-primary:hover {
          background-color: var(--primary);
          color: var(--primary-foreground);
        }

        .modal-content {
          border-radius: var(--radius);
          border: 1px solid var(--border);
          background-color: var(--card);
          color: var(--card-foreground);
        }

        .form-control,
        .form-select {
          border-color: var(--border);
          border-radius: var(--radius);
          background-color: var(--input);
          color: var(--foreground);
        }

        .form-control:focus,
        .form-select:focus {
          border-color: var(--ring);
          box-shadow: 0 0 0 2px rgba(0, 112, 243, 0.1);
          background-color: var(--input);
          color: var(--foreground);
        }

        .badge {
          border-radius: var(--radius);
          padding: 0.5em 0.75em;
        }

        .dropdown-menu {
          border-radius: var(--radius);
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
          background-color: var(--card);
          color: var(--card-foreground);
        }

        .modal-center {
          display: flex !important;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: ${darkMode
          ? "rgba(0, 0, 0, 0.7)"
          : "rgba(0, 0, 0, 0.5)"};
        }

        .modal-dialog-center {
          margin: 0;
          max-width: 500px;
        }

        .text-muted {
          color: ${darkMode ? "#adb5bd" : "#6c757d"} !important;
        }
      `}</style>

      <Container className="flex-grow-1" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
        <Row className="text-center mb-4">
          <Col>
            <h1 className="display-4 fw-bold" style={{ color: '#2c3e50', fontSize: 25, letterSpacing: "1px" }}>
              Group Communication
            </h1>
            <h2 style={{ fontFamily: "'Livvic', sans-serif", fontSize: 20 }} className="lead text-muted">Learn Together, Lead Together: Mastering Group Communication for Real-World Impact</h2>
          </Col>
        </Row>
        <div>
          <main className="py-0" style={{ marginTop: 50 }}>
            <div className="d-flex align-items-center mb-4">
              <div style={{ width: '80%' }}>
                <SearchBar placeholder="Search group..." onSearch={handleSearch} />
              </div>
              <div style={{ width: '10%', paddingLeft: '0.5rem' }}>
                <button
                  className={`btn ${darkMode ? "btn-outline-light" : "btn-outline-primary"} w-100`}
                  style={{ borderRadius: 15 }}
                  onClick={handleModalToggle}
                >
                  <i className="bi bi-plus-lg"></i> Create
                </button>
              </div>
              <div style={{ width: '10%', paddingLeft: '0.5rem' }}>
                <div className="dropdown w-100">
                  <button
                    className={`btn ${darkMode ? "btn-outline-light" : "btn-outline-secondary"} dropdown-toggle w-100`}
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ borderRadius: 15 }}
                  >
                    <i className="bi bi-filter"></i> Filter
                  </button>
                  <ul className="dropdown-menu" style={{ justifyContent: "center" }}>
                    <li>
                      <a
                        className="dropdown-item"
                        href="#"
                        onClick={() => handleFilterChange("all")}
                      >
                        All Groups
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item"
                        href="#"
                        onClick={() => handleFilterChange("public")}
                      >
                        Public Groups
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item"
                        href="#"
                        onClick={() => handleFilterChange("private")}
                      >
                        Private Groups
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="d-flex justify-content-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center my-5">
                <h4>No groups found</h4>
                <p>Try creating a new group or changing your search criteria.</p>
              </div>
            ) : (
              <div className="row g-4">
                {filteredGroups.map((group) => (
                  <div className="col-md-4" key={group.id}>
                    <div
                      className="card h-100 group-card"
                      style={{ borderRadius: 20 }}
                    >
                      <Image
                        src={group.img || "/default-group.jpg"}
                        className="card-img-top"
                        alt={`${group.title}`}
                        width={400}
                        height={200}
                        style={{
                          borderTopRightRadius: 15,
                          borderTopLeftRadius: 15,
                        }}
                      />
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                          <h5
                            className="card-title"
                            style={{
                              color: "#2c3e50",
                              fontFamily: "'Acme', sans-serif",
                            }}
                          >
                            {group.title}
                          </h5>
                          <span
                            className={`badge ${group.isPublic ? "bg-success" : "bg-warning"}`}
                          >
                            {group.isPublic ? "Public" : "Private"}
                          </span>
                        </div>

                        <div className="d-flex align-items-center mb-2">
                          <small className="text-muted d-flex align-items-center">
                            <i className="bi bi-person-circle me-1"></i>
                            By:{" "}
                            <span className="fw-bold ms-1">
                              {group.creatorName || "Anonymous"}
                            </span>
                          </small>
                        </div>
                        <small
                          className="text-muted"
                          style={{
                            fontFamily: "'Livvic', sans-serif",
                            color: "#2c3e50",
                            fontSize: 18,
                          }}
                        >
                          {group.description}
                        </small>

                        {group.bio && (
                          <div className="mt-2">
                            <small
                              className="text-muted d-block mb-1"
                              style={{ fontSize: 14 }}
                            >
                              <strong>Bio:</strong>{" "}
                              {group.bio.length > 100
                                ? `${group.bio.substring(0, 100)}...`
                                : group.bio}
                            </small>
                          </div>
                        )}

                        {group.guidelines && group.guidelines.length > 0 && (
                          <div className="mt-2">
                            <small
                              className="text-muted d-block mb-1"
                              style={{ fontSize: 14 }}
                            >
                              <strong>Guidelines:</strong> {group.guidelines.length}{" "}
                              rules
                            </small>
                          </div>
                        )}

                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <small className="text-muted">
                            <i className="bi bi-people"></i> {group.members} members
                          </small>
                          <small className="text-muted">
                            Created: {group.created}
                          </small>
                        </div>
                      </div>
                      <div
                        className="card-footer bg-transparent"
                        style={{ border: "0px solid #2c3e50", paddingBottom: 15 }}
                      >
                        <button
                          style={{ borderRadius: 15, height: 45 }}
                          className={`btn w-100 ${group.isPublic
                            ? darkMode
                              ? "btn-outline-light"
                              : "btn-primary"
                            : darkMode
                              ? "btn-outline-light"
                              : "btn-outline-primary"
                            }`}
                          onClick={() => handleJoinGroup(group.id)}
                        >
                          {group.isPublic ? "Join Group" : "Request Access"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>

        {showModal && (
          <div
            className="modal fade show modal-center"
            tabIndex={-1}
            style={{ display: "block" }}
          >
            <div className="modal-dialog modal-dialog-center">
              <div
                className="modal-content"
                style={{ borderRadius: 25, width: 700, margin: 10 }}
              >
                <div className="modal-header">
                  <h5 className="modal-title">Create New Group</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleModalToggle}
                    style={{ filter: darkMode ? "invert(1)" : "none" }}
                  ></button>
                </div>
                <div
                  className="modal-body"
                  style={{ marginLeft: 15, marginRight: 15 }}
                >
                  <form
                    id="groupForm"
                    className="needs-validation"
                    noValidate
                    onSubmit={handleCreateGroup}
                    style={{ borderRadius: 35 }}
                  >
                    <div className="mb-3">
                      <label className="form-label">Group Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        style={{ height: 45, borderRadius: 15 }}
                        placeholder="Enter group name"
                      />
                      <div className="invalid-feedback">
                        Please enter a group name
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Group Thumbnail URL</label>
                      <input
                        type="text"
                        className="form-control"
                        name="thumbnail"
                        value={formData.thumbnail || ""}
                        onChange={handleInputChange}
                        style={{ height: 45, borderRadius: 15 }}
                        placeholder="https://example.com/image.jpg"
                      />
                      <small className="text-muted">
                        Leave blank for default image
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Short Description</label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={2}
                        style={{ borderRadius: 15 }}
                        placeholder="Brief description of your group"
                      ></textarea>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Group Bio</label>
                      <textarea
                        className="form-control"
                        name="bio"
                        value={formData.bio || ""}
                        onChange={handleInputChange}
                        rows={3}
                        style={{ borderRadius: 15 }}
                        placeholder="Detailed information about your group's purpose and activities"
                      ></textarea>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Group Guidelines</label>
                      <textarea
                        className="form-control"
                        name="guidelines"
                        value={formData.guidelines || ""}
                        onChange={handleInputChange}
                        rows={4}
                        style={{ borderRadius: 15 }}
                        placeholder="Enter each guideline"
                      ></textarea>
                      <small className="text-muted">
                        Enter each guideline on a new line. Bullet points (•) will
                        be added automatically.
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Group Type</label>
                      <select
                        className="form-select"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                        style={{ height: 45, borderRadius: 15 }}
                      >
                        <option value="">Select type...</option>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                      <div className="invalid-feedback">
                        Please select a group type
                      </div>
                    </div>
                    <div
                      className="modal-footer d-flex flex-row justify-content-center gap-2"
                      style={{ border: "0px solid" }}
                    >
                      <Button
                        type="button"
                        variant={darkMode ? "outline-light" : "outline-secondary"}
                        style={{ height: 45, borderRadius: 10 }}
                        onClick={handleModalToggle}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant={darkMode ? "outline-light" : "warning"}
                        style={{
                          backgroundColor: darkMode ? "transparent" : "#F37832",
                          color: darkMode ? "#fff" : "#fff",
                          height: 45,
                          borderRadius: 10,
                          borderColor: darkMode ? "#fff" : "#F37832",
                        }}
                      >
                        Create Group
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>

      <Footer />
    </>
  );
}