import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';
import { doc, getDoc, collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

interface PostContent {
  type: string;
  value: string;
}

interface Post {
  id: string;
  title: string;
  content: PostContent[];
  tags: string[];
  author: string;
  date: string;
  image: string;
  category: string;
}

interface RecentPost {
  id: string;
  title: string;
  image: string;
  excerpt: string;
}

const BlogPostDetail = () => {
    const router = useRouter();
    const { id } = router.query;
    const [post, setPost] = useState<Post | null>(null);
    const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPostAndRecent = async () => {
            // Make sure id is a string and not undefined or an array
            if (!id) {
                return; // Wait for the router to be ready with the id
            }

            const postId = Array.isArray(id) ? id[0] : id;

            if (!postId) {
                setError('Invalid post ID');
                setLoading(false);
                return;
            }

            try {
                // Fetch the current post
                const postRef = doc(db, 'blogPosts', postId);
                const postSnap = await getDoc(postRef);
                
                if (postSnap.exists()) {
                    const postData = postSnap.data();
                    const fetchedPost: Post = {
                        id: postSnap.id,
                        title: postData.title || 'Untitled',
                        content: Array.isArray(postData.content) ? postData.content : [],
                        tags: Array.isArray(postData.tags) ? postData.tags : [],
                        author: postData.author || 'Unknown Author',
                        date: postData.createdAt?.toDate().toLocaleDateString() || 'Unknown Date',
                        image: postData.featureImage || 'https://via.placeholder.com/1200x600',
                        category: postData.category || 'Uncategorized',
                    };
                    setPost(fetchedPost);

                    // Fetch the most recent posts
                    const recentQuery = query(
                        collection(db, 'blogPosts'),
                        orderBy('createdAt', 'desc'), // Order by creation date, most recent first
                        limit(4) // Fetch 4 to ensure up to 3 after filtering
                    );
                    const recentSnap = await getDocs(recentQuery);
                    const recentPostsData: RecentPost[] = recentSnap.docs
                        .filter(doc => doc.id !== postId) // Filter out the current post client-side
                        .slice(0, 3) // Limit to 3 recent posts
                        .map(doc => ({
                            id: doc.id,
                            title: doc.data().title || 'Untitled',
                            image: doc.data().featureImage || 'https://via.placeholder.com/400x200',
                            excerpt: doc.data().content?.[0]?.value?.substring(0, 50) + '...' || 'No excerpt available',
                        }));
                    setRecentPosts(recentPostsData);
                } else {
                    setError('Post not found');
                    console.error('No such post exists!');
                }
            } catch (error) {
                setError('Error loading post');
                console.error('Error fetching post or recent posts:', error);
            } finally {
                setLoading(false);
            }
        };
        
        if (router.isReady) {
            fetchPostAndRecent();
        }
    }, [id, router.isReady]);

    const styles = {
        root: {
            '--primary': '#0070f3',
            '--primary-foreground': '#ffffff',
            '--secondary': '#f5f5f5',
            '--secondary-foreground': '#111',
            '--background': '#ffffff',
            '--foreground': '#111111',
            '--card': '#ffffff',
            '--card-foreground': '#111111',
            '--border': '#e5e5e5',
            '--input': '#ffffff',
            '--ring': '#0070f3',
            '--radius': '0.5rem',
            '--font-family': 'system-ui, -apple-system, sans-serif',
            fontFamily: 'var(--font-family)',
            color: 'var(--foreground)',
            backgroundColor: 'var(--background)',
            lineHeight: 1.6,
        },
        postContent: {
            fontSize: '1.1rem',
            lineHeight: 1.8,
        },
        card: {
            borderRadius: 15,
            borderColor: 'var(--border)',
            transition: 'transform 0.2s ease',
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="container text-center py-5">
                    <h2>{error}</h2>
                    <button className="btn btn-primary mt-3" onClick={() => router.push('/blog')}>
                        Back to Blog
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    if (!post) {
        return (
            <>
                <Header />
                <div className="container text-center py-5">
                    <h2>Post not found</h2>
                    <button className="btn btn-primary mt-3" onClick={() => router.push('/blog')}>
                        Back to Blog
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Head>
                <title>{`DG Next - ${post.title}`}</title>
                <link rel="icon" href="/dglogo.ico" />
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
            </Head>
            <Header />

            <div className="container-fluid" style={{ paddingTop: '30px', paddingBottom: '100px', paddingLeft: 200, paddingRight: 200 }}>
                <main className="row justify-content-center">
                    <article className="col-lg-8 col-md-10 py-5">
                        <header className="mb-5">
                            <button className="btn d-flex align-items-center" style={{ marginRight: 0 }} onClick={() => router.back()}>
                                <i className="bi bi-arrow-left me-2" style={{ fontSize: 30, color: "#2c3e50" }}></i>
                                <span style={{ color: "#2c3e50", fontSize: 25 }}>Back</span>
                            </button>
                            <div className="d-flex align-items-center justify-content-center" style={{ marginTop: -10, paddingBottom: 15 }}>
                                <h1 className="display-3 fw-bold mb-0 text-center flex-grow-1" style={{ fontSize: 40, color: "#2c3e50" }}>
                                    {post.title}
                                </h1>
                                <div style={{ width: 'auto' }}></div>
                            </div>
                            <div className="post-meta text-muted mb-4 text-center">
                                <span className="post-meta me-3">
                                    <i className="bi bi-person-circle me-2"></i> By {post.author}
                                </span>
                                <span className="post-meta me-3">
                                    <i className="bi bi-calendar3 me-2"></i> {post.date}
                                </span>
                                <span className="post-meta me-3">
                                    <i className="bi bi-clock me-2"></i> 8 min read
                                </span>
                            </div>
                            <div className="tags mb-4 text-center">
                                {post.tags && post.tags.length > 0 ? (
                                    post.tags.map((tag, index) => (
                                        <span key={index} className="badge me-2">
                                            {tag}
                                        </span>
                                    ))
                                ) : (
                                    <span className="badge me-2">
                                        No tags
                                    </span>
                                )}
                            </div>
                            <div className="share-section mt-0 mb-3 text-center">
                                <h2 className="mb-1" style={{ fontFamily: "'Livvic', sans-serif", fontSize: 20 }}>Share this article</h2>
                                <div className="d-flex justify-content-center gap-1">
                                    <button className="btn d-flex align-items-center justify-content-center">
                                        <i className="bi bi-twitter me-2" style={{ fontSize: 27, color: "#2c3e50" }}></i>
                                        <span style={{ color: "#2c3e50" }}>Twitter</span>
                                    </button>
                                    <button className="btn d-flex align-items-center justify-content-center">
                                        <i className="bi bi-facebook me-2" style={{ fontSize: 27, color: "#2c3e50" }}></i>
                                        <span style={{ color: "#2c3e50" }}>Facebook</span>
                                    </button>
                                    <button className="btn d-flex align-items-center justify-content-center">
                                        <i className="bi bi-linkedin me-2" style={{ fontSize: 27, color: "#2c3e50" }}></i>
                                        <span style={{ color: "#2c3e50" }}>LinkedIn</span>
                                    </button>
                                </div>
                            </div>
                        </header>

                        <div style={styles.postContent}>
                            {post.content && post.content.length > 0 ? (
                                post.content.map((item, index) => {
                                    if (!item.value || item.value.trim() === '') return null;

                                    if (item.type === 'headline') {
                                        return (
                                            <h2
                                                key={index}
                                                className="mb-4"
                                                style={{color: "#2c3e50", fontSize: 20, fontWeight: 'bold', fontFamily: "'Livvic', sans-serif" }}
                                            >
                                                {item.value}
                                            </h2>
                                        );
                                    } else if (item.type === 'text') {
                                        return (
                                            <h2
                                                key={index}
                                                className="lead mb-4"
                                                style={{ fontFamily: "'Livvic', sans-serif", fontSize: 20 }}
                                            >
                                                {item.value}
                                            </h2>
                                        );
                                    } else if (item.type === 'bullet') {
                                        const bulletPoints = item.value.includes('•')
                                            ? item.value.split('•').filter(point => point.trim() !== '')
                                            : [item.value];
                                        return (
                                            <ul key={index} className="mb-4" style={{ color: '#2c3e50', paddingLeft: '20px' }}>
                                                {bulletPoints.map((point, bulletIndex) => (
                                                    <li key={bulletIndex} style={{ marginBottom: '10px' }}>
                                                        {point.trim()}
                                                    </li>
                                                ))}
                                            </ul>
                                        );
                                    } else if (item.type === 'image') {
                                        return (
                                            <div key={index} className="d-flex justify-content-center mb-4">
                                                <Image
                                                    src={item.value}
                                                    alt={`Content image ${index}`}
                                                    className="img-fluid rounded-3"
                                                    width={800}
                                                    height={400}
                                                    style={{ borderRadius: '15px' }}
                                                />
                                            </div>
                                        );
                                    }
                                    return null;
                                })
                            ) : (
                                <p className="lead mb-4">No content available</p>
                            )}
                        </div>
                    </article>
                </main>

                <section className="related-posts py-5">
                    <div className="container">
                        <h3 className="text-center mb-4" style={{color: "#2c3e50"}}>Recent Articles</h3>
                        <div className="row">
                            {recentPosts.length > 0 ? (
                                recentPosts.map((article, index) => (
                                    <div key={index} className="col-md-4 mb-4">
                                        <div className="card h-100" style={styles.card}>
                                            <div className="position-relative" style={{ height: '200px' }}>
                                                <Image
                                                    src={article.image}
                                                    className="card-img-top"
                                                    alt={article.title}
                                                    width={400}
                                                    height={200}
                                                    style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}
                                                />
                                            </div>
                                            <div className="card-body">
                                                <h5 className="card-title" style={{color: "#2c3e50", fontFamily: "'Acme', sans-serif"}}>{article.title}</h5>
                                                <h5 className="card-text" style={{color: "#2c3e50", fontFamily: "'Livvic', sans-serif", fontSize: 16}}>{article.excerpt}</h5>
                                                <Link href={`/blogpostdetail/${article.id}`} className="btn btn-outline-dark search-btn">
                                                    Read More
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center">No recent articles found.</p>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </>
    );
};

export default BlogPostDetail;