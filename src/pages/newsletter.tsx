import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { Grid, List } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import SearchBar from '@/components/SearchBar/SearchBar';

// Updated BlogPost interface
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  image: string;
  category: string;
  readTime?: number;
  views?: number;
  comments?: number;
}

const categories = ['All', 'AI', 'Technology', 'Business', 'Research', 'Healthcare', 'Leadership', 'Personal Finance'];

const AINewsBlogPage = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'blogPosts'));
        const posts: BlogPost[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title || 'Untitled',
          excerpt: doc.data().excerpt || 'Exploring the latest in AI...',
          author: doc.data().author || 'Unknown Author',
          date: doc.data().createdAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
          image: doc.data().featureImage || 'https://via.placeholder.com/400x200',
          category: doc.data().category || 'Technology',
          readTime: doc.data().readTime || 5,
          views: doc.data().views || 0,
          comments: doc.data().comments || 0,
        }));
        setBlogPosts(posts);
        setAllPosts(posts);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      }
    };
    fetchPosts();
  }, []);

  const handleSearch = (query: string) => {
    setCurrentPage(1);
    if (query.trim() === '') {
      setBlogPosts(allPosts);
    } else {
      const filtered = allPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(query.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
          post.author.toLowerCase().includes(query.toLowerCase())
      );
      setBlogPosts(filtered);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const filteredPosts =
    selectedCategory === 'All'
      ? blogPosts
      : blogPosts.filter((post) => post.category === selectedCategory);

  const postsPerPage = 9;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const renderPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <Button
            key={i}
            onClick={() => setCurrentPage(i)}
            variant="outline"
            className={`page-number-btn ${currentPage === i ? 'active' : ''}`}
          >
            {i}
          </Button>
        );
      }
    } else {
      pageNumbers.push(
        <Button
          key={1}
          onClick={() => setCurrentPage(1)}
          variant="outline"
          className={`page-number-btn ${currentPage === 1 ? 'active' : ''}`}
        >
          1
        </Button>
      );

      if (currentPage > 3) {
        pageNumbers.push(<span key="dots1" className="pagination-ellipsis">...</span>);
      }

      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pageNumbers.push(
          <Button
            key={i}
            onClick={() => setCurrentPage(i)}
            variant="outline"
            className={`page-number-btn ${currentPage === i ? 'active' : ''}`}
          >
            {i}
          </Button>
        );
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push(<span key="dots2" className="pagination-ellipsis">...</span>);
      }

      pageNumbers.push(
        <Button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          variant="outline"
          className={`page-number-btn ${currentPage === totalPages ? 'active' : ''}`}
        >
          {totalPages}
        </Button>
      );
    }
    return pageNumbers;
  };

  return (
    <>
      <Head>
        <title>DG Next - AI Newsletter</title>
        <link rel="icon" href="/dglogo.ico" />
      </Head>

      <Header />

      <Container fluid className="min-vh-100 container" style={{ paddingTop: '120px', paddingBottom: '100px', backgroundColor: 'transparent' }}>
        <Row className="text-center mb-5 mb-4">
          <Col>
            <h1 className="display-4 fw-bold" style={{ color: '#2c3e50', fontSize: 25, letterSpacing: "1px" }}>
              AI Newsletter
            </h1>
            <h2 style={{fontFamily: "'Livvic', sans-serif", fontSize: 20}} className="lead text-muted">Cutting-Edge Insights into Artificial Intelligence</h2>
          </Col>
        </Row>

        <Row className="mb-4 align-items-center">
          <Col md={9} sm={8}>
            <SearchBar placeholder='Explore ainewsletter...' onSearch={handleSearch} />
          </Col>
          <Col md={3} sm={4}>
            <Form.Group>
              <Form.Select 
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="form-select custom-select"
                style={{
                  borderRadius: 10,
                  height: '38px', // Match search bar height
                  fontSize: '16px',
                  fontFamily: "'Acme', sans-serif",
                  border: '1px solid #bdbdbd',
                  boxShadow: 'none',
                  cursor: 'pointer'
                }}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {selectedCategory === category ? ` ${category}` : category}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={9}>
            <Row className={view === 'grid' ? 'row-cols-1 row-cols-md-3 g-4' : 'row-cols-1 g-3'}>
              {paginatedPosts.map((post) => (
                <Col key={post.id}>
                  <Card
                    style={{ marginLeft: 0, borderRadius: 15, backgroundColor: '#fff', border: '1px solid #bdbdbd' }}
                    className={view === 'grid' ? 'card h-100 custom-card' : 'd-flex flex-row align-items-center shadow-sm'}
                  >
                    <div style={{
                      position: 'relative',
                      width: view === 'list' ? '300px' : '100%',
                      height: view === 'list' ? '200px' : '180px',
                      borderTopRightRadius: view === 'list' ? 0 : 15,
                      borderTopLeftRadius: 15,
                      borderBottomLeftRadius: view === 'list' ? 15 : 0,
                      overflow: 'hidden'
                    }}>
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                        priority={currentPage === 1 && paginatedPosts.indexOf(post) < 3}
                      />
                    </div>
                    <Card.Body>
                      <div style={{ marginBottom: 15 }}>
                        <small className="text-muted" style={{ padding: 7, textAlign: 'center', backgroundColor: '#F1F5F9', borderRadius: 10 }}>
                          {post.date}
                        </small>
                      </div>
                      <Card.Title><h5 style={{ fontFamily: "'Acme', sans-serif", color: "#2c3e50" }}>{post.title}</h5></Card.Title>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">{post.author}</small>
                        <Link href={`/blogpostdetail/${post.id}`}>
                          <Button variant="btn search-btn" size="sm" style={{fontFamily: "'Livvic', sans-serif", fontSize: "16px", width: "100%", letterSpacing: "1px"}}>
                            Read More
                          </Button>
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            <Row className="mt-4 justify-content-center">
              <Col md={8} className="text-center">
                <div className="d-flex justify-content-center align-items-center gap-2">
                  <Button
                    variant="outline"
                    className="pagination-btn"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    size="sm"
                  >
                    ⟪ Previous
                  </Button>
                  {renderPageNumbers()}
                  <Button
                    variant="outline"
                    className="pagination-btn"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    size="sm"
                  >
                    Next ⟫
                  </Button>
                </div>
              </Col>
            </Row>
          </Col>

          <Col md={3}>
            <div>
              <Row className="mb-4 d-flex align-items-center">
                <Col className="d-flex align-items-center">
                  <div style={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="popular-posts-line" style={{ height: 25, borderRadius: 50 }}></div>
                    <h1 className="mb-4" style={{ fontSize: 21, letterSpacing: '1px', color: '#2c3e50', marginTop: 25 }}>
                      Popular Posts
                    </h1>
                  </div>
                </Col>
                <Col className="text-end">
                  <Button
                    variant={view === 'grid' ? 'primary' : 'outline-secondary'}
                    onClick={() => setView('grid')}
                    className="me-2 view-toggle-btn"
                  >
                    <Grid />
                  </Button>
                  <Button
                    className='view-toggle-btn'
                    variant={view === 'list' ? 'primary' : 'outline-secondary'}
                    onClick={() => setView('list')}
                  >
                    <List />
                  </Button>
                </Col>
              </Row>
            </div>

            <Card className="p-3" style={{ marginTop: -35, backgroundColor: 'transparent' }}>
              {blogPosts.slice(0, 7).map((post) => (
                <Link key={post.id} href={`/blogpostdetail/${post.id}`} style={{ textDecoration: 'none' }}>
                  <div className="d-flex align-items-center" style={{
                    marginBottom: '15px',
                    paddingBottom: 0,
                    backgroundColor: '#fff',
                    margin: 5,
                    borderRadius: 10,
                    border: '1px solid #bdbdbd7c',
                    flexDirection: 'row',
                  }}>
                    <div style={{
                      position: 'relative',
                      width: '80px',
                      height: '80px',
                      borderTopLeftRadius: 10,
                      borderBottomLeftRadius: 10,
                      overflow: 'hidden'
                    }}>
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="80px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ flexGrow: 1, paddingLeft: '10px' }}>
                      <h5 className="mb-1" style={{ fontFamily: "'Acme', sans-serif", color: "#2c3e50", fontSize: 14 }}>
                        {post.title.length > 20 ? `${post.title.slice(0, 20)}...` : post.title}
                      </h5>
                      <h5 className="text-muted" style={{ fontFamily: "'Livvic', sans-serif", fontSize: 12 }}>{post.date}</h5>
                      <div className="d-flex gap-2 text-muted" style={{ fontSize: '0.8rem' }}>
                        <h5 style={{ fontFamily: "'Livvic', sans-serif", fontSize: 12 }}>
                          <i className="bi bi-clock me-1"></i>{post.readTime} min read
                        </h5>
                        <h5 style={{ fontFamily: "'Livvic', sans-serif", fontSize: 12 }}>
                          <i className="bi bi-eye me-1"></i>{post.views}
                        </h5>
                        <h5 style={{ fontFamily: "'Livvic', sans-serif", fontSize: 12 }}>
                          <i className="bi bi-chat me-1"></i>{post.comments}
                        </h5>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </Card>
          </Col>
        </Row>
      </Container>

      <Footer />

      <style jsx global>{`
        .custom-select {
          transition: all 0.3s ease;
        }
        
        .custom-select:focus {
          border-color: #2c3e50;
          box-shadow: 0 0 0 0.25rem rgba(44, 62, 80, 0.25);
        }
      `}</style>
    </>
  );
};

export default AINewsBlogPage;