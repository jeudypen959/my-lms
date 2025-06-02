"use client";

import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

// Define interfaces for type safety
interface Post {
  id: number;
  author: string;
  avatar: string;
  date: string;
  content: string;
  likes: number;
  comments: number;
}

interface Group {
  title: string;
  type: string;
  description: string;
  members: number;
  created: string;
  img: string;
  isPublic: boolean;
}

export default function CommunityPage() {
  const [group] = useState<Group>({
    title: "Mathematics Study Group",
    type: "Public",
    description: "Advanced mathematics discussion and problem solving group.",
    members: 24,
    created: "Jan 15, 2024",
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    isPublic: true,
  });

  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      date: "April 2, 2025",
      content: "Hello everyone! I’m struggling with this calculus problem. Can anyone help me understand implicit differentiation better?",
      likes: 8,
      comments: 5,
    },
    {
      id: 2,
      author: "Michael Chen",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
      date: "April 1, 2025",
      content: "I found this great resource for linear algebra that I wanted to share with everyone. It breaks down complex concepts in a visual way that’s really helpful!",
      likes: 15,
      comments: 7,
    },
    {
      id: 3,
      author: "Priya Sharma",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
      date: "March 29, 2025",
      content: "Our next virtual study session is scheduled for this Friday at 7PM EST. We’ll be covering integration techniques. Hope to see you all there!",
      likes: 12,
      comments: 10,
    },
  ]);

  const [newPost, setNewPost] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"discussions" | "resources" | "members" | "events">("discussions");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handlePostSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPost.trim()) {
      const post: Post = {
        id: posts.length + 1,
        author: "You",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
        date: "Just now",
        content: newPost,
        likes: 0,
        comments: 0,
      };
      setPosts([post, ...posts]);
      setNewPost("");
    }
  };

  const handleTabChange = (tab: "discussions" | "resources" | "members" | "events") => {
    setActiveTab(tab);
  };

  // Sample members data for filtering
  const members = [
    { name: "Sarah Johnson", role: "Admin", joinDate: "Jan 2024", avatarId: 1570295999919 },
    { name: "Michael Chen", role: "Member", joinDate: "Feb 2024", avatarId: 1570295999920 },
    { name: "Priya Sharma", role: "Member", joinDate: "Mar 2024", avatarId: 1570295999921 },
    { name: "David Wilson", role: "Member", joinDate: "Apr 2024", avatarId: 1570295999922 },
    { name: "Emma Garcia", role: "Member", joinDate: "May 2024", avatarId: 1570295999923 },
    { name: "James Lee", role: "Member", joinDate: "Jun 2024", avatarId: 1570295999924 },
  ];

  // Filter members based on search query
  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>DG Next - {group.title}</title>
        <link rel="icon" href="/dglogo.ico" />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
        />
      </Head>
      <Header />

      <style jsx global>{`
        :root {
          --primary: #0070f3;
          --primary-foreground: #ffffff;
          --secondary: #f5f5f5;
          --secondary-foreground: #111111;
          --accent: #00a8ff;
          --accent-foreground: #ffffff;
          --background: #ffffff;
          --foreground: #111111;
          --card: #ffffff;
          --card-foreground: #111111;
          --border: #e5e5e5;
          --input: #ffffff;
          --ring: #0070f3;
          --radius: 0.5rem;
          --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          background-color: var(--secondary);
          color: var(--foreground);
        }

        .page-container {
          display: flex;
          justify-content: center;
          min-height: 70vh;
          padding: 1rem;
        }

        .card {
          border: 1px solid var(--border);
          border-radius: var(--radius);
          transition: transform 0.2s, box-shadow 0.2s;
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

        .avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          object-fit: cover;
        }

        .post-card {
          margin-bottom: 1rem;
          border-radius: 15px;
        }

        .post-card:hover {
          box-shadow: var(--shadow);
        }

        .comment-box {
          border-radius: 15px;
        }

        .nav-tabs .nav-link {
          border: none;
          border-radius: 15px 15px 0 0;
          padding: 0.75rem 1.5rem;
        }

        .nav-tabs .nav-link.active {
          background-color: var(--primary);
          color: var(--primary-foreground);
        }

        .members-list .list-group-item {
          border-rad
        .members-list .list-group-item {
          border-radius: 10px;
          margin-bottom: 0.5rem;
          border: 1px solid var(--border);
        }

        .resource-card {
          border-radius: 15px;
          transition: transform 0.2s;
        }

        .resource-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow);
        }

        .search-input {
          border-radius: 15px;
          border: 1px solid var(--border);
          padding: 0.5rem 1rem;
          width: 100%;
          max-width: 250px;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.1);
        }
      `}</style>

      <div className="page-container" style={{ backgroundColor: "#F1F5F9" }}>
        <main className="container py-0" style={{ marginTop: 60, marginBottom: 100 }}>
          {/* Group Header */}
          <div className="card mb-4" style={{ borderRadius: 20 }}>
            <div className="position-relative">
              <div style={{ position: "relative", height: "250px", borderTopRightRadius: 20, borderTopLeftRadius: 20, overflow: "hidden" }}>
                <Image
                  src={group.img}
                  alt={group.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="position-absolute top-0 end-0 m-3">
                <span className={`badge ${group.isPublic ? "bg-success" : "bg-warning"}`}>
                  {group.type}
                </span>
              </div>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-1">{group.title}</h2>
                  <p className="text-muted mb-2">{group.description}</p>
                  <div className="d-flex align-items-center">
                    <span className="me-3">
                      <i className="bi bi-people"></i> {group.members} members
                    </span>
                    <span>
                      <i className="bi bi-calendar3"></i> Created {group.created}
                    </span>
                  </div>
                </div>
                <div>
                  <button className="btn btn-outline-primary me-2" style={{ borderRadius: 15 }}>
                    <i className="bi bi-share"></i> Share
                  </button>
                  <button className="btn btn-primary" style={{ borderRadius: 15 }}>
                    <i className="bi bi-bell"></i> Follow
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "discussions" ? "active" : ""}`}
                onClick={() => handleTabChange("discussions")}
              >
                <i className="bi bi-chat"></i> Discussions
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "resources" ? "active" : ""}`}
                onClick={() => handleTabChange("resources")}
              >
                <i className="bi bi-file-earmark-text"></i> Resources
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "members" ? "active" : ""}`}
                onClick={() => handleTabChange("members")}
              >
                <i className="bi bi-people"></i> Members
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "events" ? "active" : ""}`}
                onClick={() => handleTabChange("events")}
              >
                <i className="bi bi-calendar-event"></i> Events
              </button>
            </li>
          </ul>

          <div className="row">
            {/* Main Content */}
            <div className="col-lg-8">
              {activeTab === "discussions" && (
                <>
                  {/* New Post Form */}
                  <div className="card mb-4" style={{ borderRadius: 15 }}>
                    <div className="card-body">
                      <form onSubmit={handlePostSubmit}>
                        <div className="mb-3">
                          <textarea
                            className="form-control"
                            rows={3}
                            placeholder="Share something with the group..."
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            style={{ borderRadius: 15 }}
                          ></textarea>
                        </div>
                        <div className="d-flex justify-content-between">
                          <div>
                            <button type="button" className="btn btn-outline-secondary me-2" style={{ borderRadius: 15 }}>
                              <i className="bi bi-image"></i> Photo
                            </button>
                            <button type="button" className="btn btn-outline-secondary me-2" style={{ borderRadius: 15 }}>
                              <i className="bi bi-paperclip"></i> Attachment
                            </button>
                          </div>
                          <button type="submit" className="btn btn-primary" style={{ borderRadius: 15 }}>
                            Post
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Posts Feed */}
                  {posts.map((post) => (
                    <div key={post.id} className="card post-card mb-3">
                      <div className="card-body">
                        <div className="d-flex mb-3">
                          <Image
                            src={post.avatar}
                            alt={post.author}
                            width={45}
                            height={45}
                            className="avatar me-3"
                          />
                          <div>
                            <h6 className="mb-0">{post.author}</h6>
                            <small className="text-muted">{post.date}</small>
                          </div>
                        </div>
                        <p>{post.content}</p>
                        <div className="d-flex justify-content-between">
                          <div>
                            <button className="btn btn-sm btn-outline-primary me-2" style={{ borderRadius: 15 }}>
                              <i className="bi bi-hand-thumbs-up"></i> Like ({post.likes})
                            </button>
                            <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: 15 }}>
                              <i className="bi bi-chat"></i> Comment ({post.comments})
                            </button>
                          </div>
                          <button className="btn btn-sm btn-outline-secondary" style={{ borderRadius: 15 }}>
                            <i className="bi bi-three-dots"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {activeTab === "resources" && (
                <div className="card" style={{ borderRadius: 15 }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="mb-0">Group Resources</h5>
                      <button className="btn btn-primary" style={{ borderRadius: 15 }}>
                        <i className="bi bi-plus-lg"></i> Add Resource
                      </button>
                    </div>

                    <div className="row g-3">
                      {/* Resource Cards */}
                      <div className="col-md-6">
                        <div className="card resource-card h-100">
                          <div className="card-body">
                            <div className="d-flex align-items-center mb-3">
                              <i className="bi bi-file-pdf fs-2 text-danger me-3"></i>
                              <div>
                                <h6 className="mb-0">Calculus Study Guide</h6>
                                <small className="text-muted">PDF • 4.2 MB</small>
                              </div>
                            </div>
                            <p className="small text-muted">Comprehensive guide covering derivatives, integrals, and applications.</p>
                          </div>
                          <div className="card-footer bg-transparent">
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">Uploaded by Sarah • April 1</small>
                              <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: 10 }}>
                                <i className="bi bi-download"></i> Download
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card resource-card h-100">
                          <div className="card-body">
                            <div className="d-flex align-items-center mb-3">
                              <i className="bi bi-link-45deg fs-2 text-primary me-3"></i>
                              <div>
                                <h6 className="mb-0">Linear Algebra Visualized</h6>
                                <small className="text-muted">External Link</small>
                              </div>
                            </div>
                            <p className="small text-muted">Interactive website with visual explanations of matrix operations and vector spaces.</p>
                          </div>
                          <div className="card-footer bg-transparent">
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">Shared by Michael • March 30</small>
                              <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: 10 }}>
                                <i className="bi bi-box-arrow-up-right"></i> Visit
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card resource-card h-100">
                          <div className="card-body">
                            <div className="d-flex align-items-center mb-3">
                              <i className="bi bi-file-earmark-slides fs-2 text-success me-3"></i>
                              <div>
                                <h6 className="mb-0">Differential Equations Presentation</h6>
                                <small className="text-muted">PowerPoint • 8.7 MB</small>
                              </div>
                            </div>
                            <p className="small text-muted">Slides from our last session on solving first-order differential equations.</p>
                          </div>
                          <div className="card-footer bg-transparent">
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">Uploaded by Priya • March 28</small>
                              <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: 10 }}>
                                <i className="bi bi-download"></i> Download
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "members" && (
                <div className="card" style={{ borderRadius: 15 }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="mb-0">Group Members</h5>
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="members-list">
                      {/* Member Cards */}
                      {filteredMembers.map((member, i) => (
                        <div key={i} className="list-group-item mb-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              <Image
                                src={`https://images.unsplash.com/photo-${member.avatarId}-b8d87734a5a2`}
                                alt={member.name}
                                width={45}
                                height={45}
                                className="avatar me-3"
                              />
                              <div>
                                <h6 className="mb-0">{member.name}</h6>
                                <small className="text-muted">
                                  {member.role} • Joined {member.joinDate}
                                </small>
                              </div>
                            </div>
                            <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: 10 }}>
                              <i className="bi bi-chat"></i> Message
                            </button>
                          </div>
                        </div>
                      ))}
                      {filteredMembers.length === 0 && (
                        <p className="text-muted text-center">No members found.</p>
                      )}
                    </div>

                    <div className="d-flex justify-content-center mt-3">
                      <button className="btn btn-outline-primary" style={{ borderRadius: 15 }}>
                        Load More
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "events" && (
                <div className="card" style={{ borderRadius: 15 }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="mb-0">Upcoming Events</h5>
                      <button className="btn btn-primary" style={{ borderRadius: 15 }}>
                        <i className="bi bi-plus-lg"></i> Create Event
                      </button>
                    </div>

                    {/* Event Cards */}
                    <div className="card mb-3" style={{ borderRadius: 15 }}>
                      <div className="card-body">
                        <div className="d-flex">
                          <div className="me-3 text-center" style={{ minWidth: "60px" }}>
                            <div className="bg-primary text-white p-2 rounded">
                              <div className="fw-bold">APR</div>
                              <div className="fs-4">05</div>
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="mb-1">Virtual Study Session: Integration Techniques</h5>
                            <p className="mb-2"><i className="bi bi-clock"></i> 7:00 PM - 9:00 PM EST</p>
                            <p className="mb-3"><i className="bi bi-geo-alt"></i> Zoom Meeting</p>
                            <p className="text-muted">We’ll be working through practice problems on integration by parts, u-substitution, and partial fractions.</p>
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-primary" style={{ borderRadius: 10 }}>
                                RSVP
                              </button>
                              <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: 10 }}>
                                Add to Calendar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card mb-3" style={{ borderRadius: 15 }}>
                      <div className="card-body">
                        <div className="d-flex">
                          <div className="me-3 text-center" style={{ minWidth: "60px" }}>
                            <div className="bg-primary text-white p-2 rounded">
                              <div className="fw-bold">APR</div>
                              <div className="fs-4">12</div>
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="mb-1">Math Trivia Night</h5>
                            <p className="mb-2"><i className="bi bi-clock"></i> 8:00 PM - 10:00 PM EST</p>
                            <p className="mb-3"><i className="bi bi-geo-alt"></i> University Student Center, Room 201</p>
                            <p className="text-muted">Fun team competition with math puzzles and trivia questions. Prizes for the winning team!</p>
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-primary" style={{ borderRadius: 10 }}>
                                RSVP
                              </button>
                              <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: 10 }}>
                                Add to Calendar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card" style={{ borderRadius: 15 }}>
                      <div className="card-body">
                        <div className="d-flex">
                          <div className="me-3 text-center" style={{ minWidth: "60px" }}>
                            <div className="bg-primary text-white p-2 rounded">
                              <div className="fw-bold">APR</div>
                              <div className="fs-4">20</div>
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="mb-1">Guest Lecture: Advanced Number Theory</h5>
                            <p className="mb-2"><i className="bi bi-clock"></i> 3:00 PM - 5:00 PM EST</p>
                            <p className="mb-3"><i className="bi bi-geo-alt"></i> Mathematics Building, Auditorium A</p>
                            <p className="text-muted">Professor Williams from MIT will be giving a special lecture on recent developments in number theory and cryptography.</p>
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-primary" style={{ borderRadius: 10 }}>
                                RSVP
                              </button>
                              <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: 10 }}>
                                Add to Calendar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              {/* About Card */}
              <div className="card mb-4" style={{ borderRadius: 15 }}>
                <div className="card-body">
                  <h5 className="card-title">About This Group</h5>
                  <p className="card-text">
                    This group focuses on advanced mathematics topics including calculus,
                    linear algebra, differential equations, and number theory. Members
                    collaborate on problem-solving, share resources, and organize study sessions.
                  </p>
                  <hr />
                  <h6>Guidelines</h6>
                  <ul className="ps-3 mb-0">
                    <li>Be respectful and supportive to all members</li>
                    <li>Share quality resources and cite sources</li>
                    <li>No plagiarism or cheating on assignments</li>
                    <li>Keep discussions relevant to mathematics</li>
                  </ul>
                </div>
              </div>

              {/* Announcements */}
              <div className="card mb-4" style={{ borderRadius: 15 }}>
                <div className="card-header bg-primary text-white" style={{ borderTopLeftRadius: 15, borderTopRightRadius: 15 }}>
                  <h5 className="mb-0">Announcements</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3 pb-3 border-bottom">
                    <h6>End-of-semester Review Session</h6>
                    <p className="small text-muted">
                      We’ll be holding a comprehensive review session on April 25th.
                      Please submit topics you’d like covered in the form shared via email.
                    </p>
                    <small className="text-muted">Posted by Admin • April 1</small>
                  </div>
                  <div>
                    <h6>Group Textbook Discount</h6>
                    <p className="small text-muted">
                      Group members can get 20% off the Advanced Calculus textbook using
                      code MATHGROUP20 at the university bookstore until April 10th.
                    </p>
                    <small className="text-muted">Posted by Admin • March 28</small>
                  </div>
                </div>
              </div>

              {/* Active Members */}
              <div className="card" style={{ borderRadius: 15 }}>
                <div className="card-body">
                  <h5 className="card-title">Active Members</h5>
                  <div className="d-flex flex-wrap mt-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="text-center me-3 mb-3" style={{ width: "60px" }}>
                        <Image
                          src={`https://images.unsplash.com/photo-${1570295999919 + i}-b8d87734a5a2`}
                          alt="Member"
                          width={50}
                          height={50}
                          className="rounded-circle mb-1"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="small text-truncate">{["Sarah", "Michael", "Priya", "David", "Emma", "James"][i]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}