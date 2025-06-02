import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Container, Row, Col, Card, Tab, Nav, Form, Button } from 'react-bootstrap';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

// Custom SearchBar Component
const SearchBar: React.FC<{
    placeholder?: string;
    onSearch: (query: string) => void;
    value: string;
}> = ({ placeholder = "Search events...", onSearch, value }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onSearch(newValue);
    };
    
    const handleReset = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch('');
    };
    
    return (
        <form className="search-form">
            <label className="search-label" htmlFor="search">
                <input
                    className="search-input"
                    type="text"
                    style={{ fontFamily: "'Livvic', sans-serif", fontWeight: 500 }}
                    required
                    placeholder={placeholder}
                    id="search"
                    value={value}
                    onChange={handleChange}
                />
                <div className="search-fancy-bg"></div>
                <div className="search-icon">
                    <svg className="search-svg-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <g>
                            <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                        </g>
                    </svg>
                </div>
                {value && (
                    <button
                        className="search-close-btn"
                        type="reset"
                        onClick={handleReset}
                    >
                        <svg className="search-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                    </button>
                )}
            </label>
        </form>
    );
};

// Define TypeScript interfaces with strict typing
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

// Define page type union to avoid any
type PageIdentifier = number | '...';

interface EventData {
    id: string;
    title: string;
    imageUrl?: string;
    createdAt: {
        toDate: () => Date;
    };
    description: string;
    location: string;
    date: string;
    time: string;
    category: string;
    attendees: number;
    isPastEvent?: boolean;
    [key: string]: unknown;
}

// Available event categories
const eventCategories = [
    'All Categories',
    'Conference',
    'Workshop',
    'Seminar',
    'Networking',
    'Hackathon',
    'Tech Talk',
    'AI Training',
    'Research',
];

// Custom Pagination Component
const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    // Generate page numbers array with specific typing
    const getPageNumbers = (): PageIdentifier[] => {
        const pages: PageIdentifier[] = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage > 3) {
                pages.push('...');
            }
            const startPage = Math.max(2, currentPage - 1);
            const endPage = Math.min(totalPages - 1, currentPage + 1);
            for (let i = startPage; i <= endPage; i++) {
                if (i > 1 && i < totalPages) {
                    pages.push(i);
                }
            }
            if (currentPage < totalPages - 2) {
                pages.push('...');
            }
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }
        return pages;
    };

    if (totalPages <= 1) {
        return null;
    }

    return (
        <nav className="mt-5">
            <ul className="pagination justify-content-center custom-pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        className="page-link custom-page-link"
                        style={{ borderRadius: 10 }}
                        disabled={currentPage === 1}
                    >
                        « Previous
                    </button>
                </li>
                {getPageNumbers().map((page, index) => (
                    <li key={index} className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}>
                        {page === '...' ? (
                            <span className="page-link custom-page-link">...</span>
                        ) : (
                            <button
                                onClick={() => onPageChange(page as number)}
                                className="page-link custom-page-link"
                            >
                                {page}
                            </button>
                        )}
                    </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        className="page-link custom-page-link"
                        style={{ borderRadius: 10 }}
                        disabled={currentPage === totalPages}
                    >
                        Next »
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default function Events() {
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [activeTab, setActiveTab] = useState<string>('upcoming');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
    const [filteredEvents, setFilteredEvents] = useState<EventData[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const itemsPerPage = 8;

    // Fetch events from Firestore
    useEffect(() => {
        const fetchEvents = async (): Promise<void> => {
            try {
                setLoading(true);
                const eventsRef = collection(db, 'Events');
                const eventsQuery = query(eventsRef, orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(eventsQuery);

                const eventsData: EventData[] = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    const eventDate = new Date(data.date as string);
                    const currentDate = new Date();
                    const isPastEvent = eventDate < currentDate;

                    return {
                        id: doc.id,
                        title: data.title as string,
                        imageUrl: data.imageUrl as string | undefined,
                        createdAt: data.createdAt as Timestamp,
                        description: data.description as string || "No description available",
                        location: data.location as string || "TBD",
                        date: data.date as string || "TBD",
                        time: data.time as string || "TBD",
                        category: data.category as string || "General",
                        attendees: data.attendees as number || 0,
                        isPastEvent
                    };
                });

                setEvents(eventsData);
                applyFilters(eventsData, activeTab, searchQuery, selectedCategory);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching events:", err);
                setError("Failed to load events. Please try again later.");
                setLoading(false);
            }
        };

        fetchEvents();
    }, [activeTab, searchQuery, selectedCategory]);

    // Apply filters whenever activeTab, searchQuery, or selectedCategory changes
    useEffect(() => {
        applyFilters(events, activeTab, searchQuery, selectedCategory);
    }, [events, activeTab, searchQuery, selectedCategory]);

    // Apply filters to events
    const applyFilters = (
        eventsData: EventData[],
        tab: string,
        search: string,
        category: string
    ) => {
        let filtered = [...eventsData];

        // Filter by tab (upcoming or past)
        filtered = filtered.filter(event =>
            tab === 'upcoming' ? !event.isPastEvent : event.isPastEvent
        );

        // Filter by search query
        if (search.trim() !== '') {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(event =>
                (event.title?.toLowerCase().includes(searchLower) ?? false) ||
                (event.description?.toLowerCase().includes(searchLower) ?? false) ||
                (event.location?.toLowerCase().includes(searchLower) ?? false)
            );
        }

        // Filter by category
        if (category !== 'All Categories') {
            filtered = filtered.filter(event => event.category === category);
        }

        setFilteredEvents(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        setCurrentPage(1); // Reset to first page on filter change
    };

    // Handler for tab changes
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    // Handler for search input changes
    const handleSearchQuery = (query: string) => {
        setSearchQuery(query);
    };

    // Handler for category selection changes
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const category = e.target.value;
        setSelectedCategory(category);
    };

    // Handler for view mode changes
    const handleViewModeChange = (mode: 'grid' | 'list') => {
        setViewMode(mode);
    };

    // Function to handle page changes
    const handlePageChange = (page: number): void => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            setCurrentPage(page);
            window.scrollTo(0, 0);
        }
    };

    // Get current page items
    const getCurrentPageEvents = (): EventData[] => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredEvents.slice(startIndex, endIndex);
    };

    // Truncate text to specific length
    const truncateText = (text: string, maxLength: number): string => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Add Grid View Event Card
    const renderGridView = (event: EventData, isPast: boolean) => (
        <Col key={event.id} lg={3} md={6} sm={12} className="mb-4">
            <Card className="event-card h-100" style={{
                borderRadius: 15,
                border: "1px solid #bdbdbd",
                width: "100%"
            }}>
                <div className="position-relative">
                    {isPast && (
                        <div className="position-absolute start-0 top-0 m-2">
                            <span className="badge bg-secondary">Completed</span>
                        </div>
                    )}
                    <Card.Img
                        variant="top"
                        src={event.imageUrl || "/images/event-placeholder.jpg"}
                        alt={event.title}
                        style={{ 
                            height: '180px', 
                            objectFit: 'cover', 
                            borderRadius: '15px 15px 0 0',
                            filter: isPast ? 'grayscale(40%)' : 'none'
                        }}
                    />
                    <div className="position-absolute end-0 top-0 m-2">
                        <h5 style={{ backgroundColor: "#2c3e50", color: "#fff", fontFamily: "'Acme', sans-serif", letterSpacing: "1px", padding: 5, borderRadius: 10 }}>
                            {event.category}
                        </h5>
                    </div>
                </div>
                <Card.Body className="d-flex flex-column">
                    <Card.Title>
                        <h5 style={{ color: "#2c3e50", fontFamily: "'Acme', sans-serif" }}>
                            {event.title}
                        </h5>
                    </Card.Title>
                    <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                        {truncateText(event.description, 15)}
                    </p>
                    <div className="event-meta mb-2">
                        <div><i className="bi bi-calendar3"></i> {event.date}</div>
                        <div><i className="bi bi-clock"></i> {event.time}</div>
                        <div><i className="bi bi-geo-alt"></i> {event.location}</div>
                        <div>
                            <i className="bi bi-people"></i> 
                            <span className="event-attendees">
                                {event.attendees} attendees
                            </span>
                        </div>
                    </div>
                    <div className="mt-auto">
                        <Link href={`/events/${event.id}`}>
                            <button 
                                className={`btn ${isPast ? 'btn-outline-secondary' : 'search-btn'}`} 
                                style={{
                                    fontFamily: "'Livvic', sans-serif", 
                                    fontSize: "16px", 
                                    width: "100%", 
                                    letterSpacing: "1px"
                                }}
                            >
                                {isPast ? 'View Details' : 'Register Now!'}
                            </button>
                        </Link>
                    </div>
                </Card.Body>
            </Card>
        </Col>
    );

    // Add List View Event Card
    const renderListView = (event: EventData, isPast: boolean) => (
        <Col key={event.id} xs={12} className="mb-4">
            <Card className="event-card" style={{
                borderRadius: 15,
                border: "1px solid #bdbdbd",
                flexDirection: 'row',
                alignItems: 'center',
                padding: '1rem'
            }}>
                <div className="position-relative">
                    {isPast && (
                        <div className="position-absolute start-0 top-0 m-2">
                            <span className="badge bg-secondary">Completed</span>
                        </div>
                    )}
                    <Card.Img
                        src={event.imageUrl || "/images/event-placeholder.jpg"}
                        alt={event.title}
                        style={{ 
                            width: '150px', 
                            height: '100px', 
                            objectFit: 'cover', 
                            borderRadius: '10px',
                            marginRight: '1rem',
                            filter: isPast ? 'grayscale(40%)' : 'none'
                        }}
                    />
                    <div className="position-absolute end-0 top-0 m-2">
                        <span className="badge" style={{ backgroundColor: isPast ? '#6c757d' : '#007bff' }}>
                            {event.category}
                        </span>
                    </div>
                </div>
                <Card.Body className="d-flex flex-column flex-grow-1">
                    <Card.Title>
                        <h5 style={{ color: "#2c3e50", fontFamily: "'Acme', sans-serif" }}>
                            {event.title}
                        </h5>
                    </Card.Title>
                    <p className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>
                        {truncateText(event.description, 100)}
                    </p>
                    <div className="event-meta mb-2">
                        <div><i className="bi bi-calendar3"></i> {event.date}</div>
                        <div><i className="bi bi-clock"></i> {event.time}</div>
                        <div><i className="bi bi-geo-alt"></i> {event.location}</div>
                        <div>
                            <i className="bi bi-people"></i> 
                            <span className="event-attendees">
                                {event.attendees} attendees
                            </span>
                        </div>
                    </div>
                </Card.Body>
                <div className="p-3">
                    <Link href={`/events/${event.id}`}>
                        <button 
                            className={`btn ${isPast ? 'btn-outline-secondary' : 'search-btn'}`} 
                            style={{
                                fontFamily: "'Livvic', sans-serif", 
                                fontSize: "16px", 
                                letterSpacing: "1px"
                            }}
                        >
                            {isPast ? 'View Details' : 'Register Now!'}
                        </button>
                    </Link>
                </div>
            </Card>
        </Col>
    );

    // Add custom CSS for styling
    const customStyles = `
    .custom-pagination .page-item:not(.disabled) .custom-page-link {
      color: #333;
    }
    
    .custom-pagination .page-item.active .custom-page-link {
      background-color: #007bff;
      border-color: #007bff;
      color: white;
    }
    
    .custom-pagination .custom-page-link {
      padding: 0.5rem 1rem;
      margin: 0 0.25rem;
      border-radius: 5px;
    }
    
    .event-card {
      transition: transform 0.3s ease;
      height: 100%;
    }
    
    .event-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    
    .spinner-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
    }

    .event-tabs .nav-link {
      color: #495057;
      font-weight: 600;
      border: none;
      border-bottom: 3px solid transparent;
      padding: 0.75rem 1.5rem;
      transition: all 0.3s ease;
    }
    
    .event-tabs .nav-link.active {
      color: #007bff;
      background-color: transparent;
      border-color: #007bff;
    }
    
    .event-meta {
      font-size: 0.85rem;
      color: #6c757d;
    }
    
    .event-meta i {
      margin-right: 5px;
      width: 16px;
      text-align: center;
    }
    
    .event-attendees {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 10px;
      background-color: #f8f9fa;
      font-size: 0.8rem;
    }
    
    .search-filter-container {
      background-color: transparent;
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 2rem;
    }

    .view-toggle-btn {
      height: 40px;
      border-radius: 15px;
      border: 1px solid #d6dbdf;
      padding: 0 10px;
      margin-left: 5px;
      background-color: #fff;
      color: #2c3e50;
      font-family: "'Livvic', sans-serif";
      font-size: 14px;
      width: 100%;
    }

    .view-toggle-btn.active {
      background-color: #007bff;
      color: white;
      border-color: #007bff;
    }

    .view-toggle-btn:hover {
      background-color: #e9ecef;
    }
    
    /* Custom Search Bar Styles */
    .search-form {
      --input-text-color: #2c3e50;
      --input-bg-color: #fff;
      --focus-input-bg-color: transparent;
      --text-color: #2c3e50;
      --active-color: #2c3e50ab;
      --active-border-width: 2px;
      --width-of-input: 100%;
      --inline-padding-of-input: 1.2em;
      --gap: 0.9rem;
    
      font-size: 0.9rem;
      display: flex;
      gap: 0.5rem;
      align-items: center;
      width: var(--width-of-input);
      position: relative;
      isolation: isolate;
    }
    
    .search-fancy-bg {
      position: absolute;
      width: 100%;
      inset: 0;
      background: var(--input-bg-color);
      border-radius: 15px;
      height: 100%;
      z-index: -1;
      pointer-events: none;
      border: 1px solid #d6dbdf;
    }
    
    .search-label {
      width: 100%;
      padding: 0.8em;
      height: 40px;
      padding-inline: var(--inline-padding-of-input);
      display: flex;
      align-items: center;
    }
    
    .search-icon,
    .search-close-btn {
      position: absolute;
    }
    
    .search-icon {
      fill: var(--text-color);
      left: var(--inline-padding-of-input);
      top: 50%;
      transform: translateY(-50%);
    }
    
    .search-svg-icon {
      width: 17px;
      display: block;
    }
    
    .search-close-btn {
      border: none;
      right: var(--inline-padding-of-input);
      top: 50%;
      transform: translateY(-50%);
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #2c3e50;
      padding: 0.1em;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: transparent;
      opacity: 0;
      visibility: hidden;
    }
    
    .search-input {
      color: var(--input-text-color);
      width: 100%;
      padding-left: calc(var(--inline-padding-of-input) + 1.5em); /* Ensure text doesn't overlap icon */
      background: none;
      border: none;
      height: 100%;
    }
    
    .search-input:focus {
      outline: none;
    }
    
    .search-input::placeholder {
      color: var(--text-color);
      opacity: 0.7;
    }
    
    .search-input:focus ~ .search-fancy-bg {
      border: var(--active-border-width) solid var(--active-color);
      background: #fff;
      box-shadow: 0 0 5px rgba(44, 62, 80, 0.267);
    }
    
    .search-input:focus ~ .search-icon {
      fill: var(--active-color);
    }
    
    .search-input:not(:placeholder-shown) ~ .search-close-btn {
      opacity: 1;
      visibility: visible;
    }
    
    .search-input:-webkit-autofill,
    .search-input:-webkit-autofill:hover,
    .search-input:-webkit-autofill:focus,
    .search-input:-webkit-autofill:active {
      -webkit-transition: "color 9999s ease-out, background-color 9999s ease-out";
      -webkit-transition-delay: 9999s;
    }
  `;

    return (
        <>
            <div className="d-flex flex-column min-vh-100">
                <Head>
                    <title>DG Next - Events</title>
                    <link rel="icon" href="/dglogo.ico" />
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.0/font/bootstrap-icons.css" />
                    <style>{customStyles}</style>
                </Head>

                <Header />

                <Container className="flex-grow-1" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
                    <Row className="text-center mb-4">
                        <Col>
                            <h1 className="display-4 fw-bold" style={{ color: '#2c3e50', fontSize: 25, letterSpacing: "1px" }}>
                                Events
                            </h1>
                            <h2 style={{ fontFamily: "'Livvic', sans-serif", fontSize: 20 }} className="lead text-muted">Empowering Every Event with Knowledge.</h2>
                        </Col>
                    </Row>
                    
                    <Tab.Container id="event-tabs" activeKey={activeTab} onSelect={(k) => handleTabChange(k as string)}>
                        <Row className="mb-0">
                            <Col className="d-flex justify-content-center">
                                <Nav variant="tabs" className="event-tabs">
                                    <Nav.Item>
                                        <Nav.Link eventKey="upcoming">Upcoming Events</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="past">Past Events</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                        </Row>
                        
                        <Row className="search-filter-container mb-0 align-items-center">
                            <Col md={8} sm={15} className="mb-0 mb-md-0">
                                <SearchBar
                                    placeholder="Search events..."
                                    onSearch={handleSearchQuery}
                                    value={searchQuery}
                                />
                            </Col>
                            <Col md={2} sm={12} className="mb-0 mb-md-0">
                                <Form.Select 
                                    value={selectedCategory} 
                                    onChange={handleCategoryChange}
                                    aria-label="Select category"
                                    style={{ 
                                        height: "40px", 
                                        borderRadius: "15px",
                                        border: "1px solid #d6dbdf",
                                        fontFamily: "'Livvic', sans-serif",
                                        width: '100%'
                                    }}
                                >
                                    {eventCategories.map((category, idx) => (
                                        <option key={idx} value={category}>{category}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={1} sm={6} className="mb-0 mb-md-0">
                                <Button
                                    className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => handleViewModeChange('grid')}
                                >
                                    <i className="bi bi-grid" style={{fontSize: 22}}></i>
                                </Button>
                            </Col>
                            <Col md={1} sm={6}>
                                <Button
                                    className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => handleViewModeChange('list')}
                                >
                                    <i className="bi bi-list" style={{fontSize: 22}}></i>
                                </Button>
                            </Col>
                        </Row>

                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

                        <Tab.Content>
                            <Tab.Pane eventKey="upcoming">
                                {loading ? (
                                    <div className="spinner-container">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {getCurrentPageEvents().length === 0 ? (
                                            <div className="text-center p-5">
                                                <h3>No upcoming events found</h3>
                                                <p>Check back later for upcoming events or try different search criteria.</p>
                                            </div>
                                        ) : (
                                            <Row className="mb-0">
                                                {getCurrentPageEvents().map((event) => (
                                                    viewMode === 'grid' 
                                                        ? renderGridView(event, false)
                                                        : renderListView(event, false)
                                                ))}
                                            </Row>
                                        )}
                                    </>
                                )}
                            </Tab.Pane>
                            
                            <Tab.Pane eventKey="past">
                                {loading ? (
                                    <div className="spinner-container">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {getCurrentPageEvents().length === 0 ? (
                                            <div className="text-center p-5">
                                                <h3>No past events found</h3>
                                                <p>There are no past events that match your criteria.</p>
                                            </div>
                                        ) : (
                                            <Row className="mb-4">
                                                {getCurrentPageEvents().map((event) => (
                                                    viewMode === 'grid' 
                                                        ? renderGridView(event, true)
                                                        : renderListView(event, true)
                                                ))}
                                            </Row>
                                        )}
                                    </>
                                )}
                            </Tab.Pane>
                        </Tab.Content>
                        
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </Tab.Container>
                </Container>

                <Footer />
            </div>
        </>
    );
}