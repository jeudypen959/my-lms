import React, { useState } from 'react';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Card, Button, Badge, Form } from 'react-bootstrap';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showComparison, setShowComparison] = useState(false);

  // Comprehensive plans for all user types
  const plans = [
    {
      type: 'student',
      name: 'Student',
      description: 'For individual learners in academic settings',
      monthlyPrice: 25.00,
      yearlyPrice: 250.00,
      features: [
        'Access all courses',
        'Join monthly event',
        'Access to learn material of DG Next',
        'Special discount on DGAcademy training (10%)'
      ],
      highlight: false,
      buttonVariant: 'outline-primary',
      icon: 'bi-mortarboard-fill'
    },
    {
      type: 'professional',
      name: 'Professional',
      description: 'For career advancement & skill development',
      monthlyPrice: 29.00,
      yearlyPrice: 290.00,
      features: [
        'Access all courses',
        'Join monthly event',
        'Access to learn material of DG Next',
        'Special discount on DGAcademy training (10%)'
      ],
      highlight: true,
      buttonVariant: 'primary',
      icon: 'bi-briefcase-fill'
    },
    {
      type: 'educator',
      name: 'Educator',
      description: 'For teachers, professors & instructors',
      monthlyPrice: 25.00,
      yearlyPrice: 250.00,
      features: [
        'Access all courses',
        'Join monthly event',
        'Access to learn material of DG Next',
        'Special discount on DGAcademy training (10%)'
      ],
      highlight: false,
      buttonVariant: 'outline-primary',
      icon: 'bi-easel2-fill'
    },
    {
      type: 'organization',
      name: 'Organization',
      description: 'For schools, companies & institutions',
      monthlyPrice: 'Contact Us',
      yearlyPrice: 'Contact Us',
      features: [
        'Special discount for bulk registration form for 5 persons',
        'Discount on DGAcademy training course (10%)',
        'Discount on DGAcademy event and conference (50%)',
        'Personal training support and consulting from DGAcademy'
      ],
      highlight: false,
      buttonVariant: 'outline-primary',
      icon: 'bi-building-fill'
    }
  ];

  // No filtering since tabs are removed; use all plans
  const filteredPlans = plans;

  // Fix for Bootstrap accordion in Next.js
  React.useEffect(() => {
    // import('bootstrap/dist/js/bootstrap');
  }, []);

  return (
    <>
      <Head>
        <title>DG Next - Planing & Pricing</title>
        <link rel="icon" href="/dglogo.ico" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.0/font/bootstrap-icons.css" />
      </Head>
      <Header />

      <div>
        <Container className="flex-grow-1" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
          <Row className="text-center mb-5">
            <Col>
              <h1 className="display-4 fw-bold" style={{ color: '#2c3e50', fontSize: 25, letterSpacing: "1px" }}>
                Planing & Pricing
              </h1>
              <h2 style={{ fontFamily: "'Livvic', sans-serif", fontSize: 20 }} className="lead text-muted">Flexible Plans, Transparent Pricing — Learn Your Way.</h2>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col md={6} className="d-flex justify-content-center">
              <div className="d-flex align-items-center bg-white shadow-sm" style={{ borderRadius: 15, padding: 10 }}>
                <Form.Check
                  type="radio"
                  id="monthly"
                  name="billingCycle"
                  label="Monthly Billing"
                  checked={billingCycle === 'monthly'}
                  onChange={() => setBillingCycle('monthly')}
                  className="me-3"
                  style={{ fontFamily: "'Livvic', sans-serif", fontWeight: 600, color: "#2c3e50" }}
                />
                <Form.Check
                  type="radio"
                  id="yearly"
                  name="billingCycle"
                  label="Yearly Billing"
                  checked={billingCycle === 'yearly'}
                  onChange={() => setBillingCycle('yearly')}
                  style={{ fontFamily: "'Livvic', sans-serif", fontWeight: 600, color: "#2c3e50" }}
                />
                <Badge bg="success" className="ms-3" style={{ borderRadius: 8, color: "#fff", fontFamily: "'Livvic', sans-serif", border: "0px solid #fff" }}>Save 15%</Badge>
              </div>
            </Col>
          </Row>

          <Row className="justify-content-center g-4" style={{ marginTop: 20 }}>
            {filteredPlans.map((plan, index) => (
              <Col key={index} lg={3} md={6}>
                <Card
                  className={`h-100 ${plan.highlight ? 'border-primary' : ''}`}
                  style={{borderRadius: 20, border: "1px solid #bdbdbd"}}
                >
                  {plan.highlight && (
                    <div className="position-absolute top-0 start-50 translate-middle">
                      <Badge className="px-3 py-2" style={{ fontFamily: "'Livvic', sans-serif", fontWeight: 600, color: "#fff", backgroundColor: "#2c3e50", borderRadius: 10 }}>
                        MOST POPULAR
                      </Badge>
                    </div>
                  )}
                  <Card.Header className={`text-center py-4 ${plan.highlight ? 'bg-primary text-white' : ''}`} style={{borderTopRightRadius: 20, borderTopLeftRadius: 20}}>
                    <i className={`bi ${plan.icon} fs-1 mb-3`}></i>
                    <h2 className="fw-bold mb-3" style={{fontFamily: "'Livvic', sans-serif", fontSize: 25}}>{plan.name}</h2>
                  </Card.Header>
                  <Card.Body className="d-flex flex-column">
                    <div className="text-center mb-4">
                      <h3 className="display-5 fw-bold">
                        {typeof plan.monthlyPrice === 'string' ? plan.monthlyPrice : `$${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}`}
                      </h3>
                      <p className="text-muted">{typeof plan.monthlyPrice === 'string' ? '' : `per ${billingCycle === 'monthly' ? 'month' : 'year'}`}</p>
                    </div>
                    <ul className="list-unstyled mb-4">
                      {plan.features.map((feature, i) => (
                        <li
                          key={i}
                          className="mb-2"
                          style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                        >
                          <i className="bi bi-check-circle-fill text-success" style={{ flexShrink: 0, marginTop: '3px' }}></i>
                          <span
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxHeight: '3em',
                              lineHeight: '1.5em'
                            }}
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      className="btn search-btn"
                    >
                      {plan.type === 'educator' ? 'Start Teaching' :
                        plan.type === 'organization' ? 'Contact Sales' : 'Start Learning'}
                    </button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="justify-content-center mt-4">
            <Col md={6} className="text-center">
              <Button
                variant="link"
                onClick={() => setShowComparison(!showComparison)}
                className="text-decoration-none"
              >
                {showComparison ? 'Hide Plan Comparison' : 'Compare All Plans'} <i className={`bi bi-chevron-${showComparison ? 'up' : 'down'}`}></i>
              </Button>
            </Col>
          </Row>

          {showComparison && (
            <Row className="mt-4">
              <Col md={12}>
                <div className="table-responsive bg-white" style={{ borderRadius: 15, padding: 20, paddingRight: 25, paddingBottom: 40, paddingLeft: 25 }}>
                  <table className="table table-hover mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th style={{ minWidth: "200px" }}>Feature</th>
                        <th className="text-center">Student</th>
                        <th className="text-center">Professional</th>
                        <th className="text-center">Educator</th>
                        <th className="text-center">Organization</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Course Access</td>
                        <td className="text-center">All Courses</td>
                        <td className="text-center">All Courses</td>
                        <td className="text-center">All Courses</td>
                        <td className="text-center">Institutional Library</td>
                      </tr>
                      <tr>
                        <td>Monthly Events</td>
                        <td className="text-center">Included</td>
                        <td className="text-center">Included</td>
                        <td className="text-center">Included</td>
                        <td className="text-center"><i className="bi bi-x text-danger" style={{ fontSize: 25 }}></i></td>
                      </tr>
                      <tr>
                        <td>Learning Materials</td>
                        <td className="text-center">DG Next Materials</td>
                        <td className="text-center">DG Next Materials</td>
                        <td className="text-center">DG Next Materials</td>
                        <td className="text-center"><i className="bi bi-x text-danger" style={{ fontSize: 25 }}></i></td>
                      </tr>
                      <tr>
                        <td>Training Discount</td>
                        <td className="text-center">10% DGAcademy</td>
                        <td className="text-center">10% DGAcademy</td>
                        <td className="text-center">10% DGAcademy</td>
                        <td className="text-center">10% DGAcademy</td>
                      </tr>
                      <tr>
                        <td>Bulk Registration</td>
                        <td className="text-center"><i className="bi bi-x text-danger" style={{ fontSize: 25 }}></i></td>
                        <td className="text-center"><i className="bi bi-x text-danger" style={{ fontSize: 25 }}></i></td>
                        <td className="text-center"><i className="bi bi-x text-danger" style={{ fontSize: 25 }}></i></td>
                        <td className="text-center">5 Persons</td>
                      </tr>
                      <tr>
                        <td>Event Discount</td>
                        <td className="text-center"><i className="bi bi-x text-danger" style={{ fontSize: 25 }}></i></td>
                        <td className="text-center"><i className="bi bi-x text-danger" style={{ fontSize: 25 }}></i></td>
                        <td className="text-center"><i className="bi bi-x text-danger" style={{ fontSize: 25 }}></i></td>
                        <td className="text-center">50% DGAcademy</td>
                      </tr>
                      <tr>
                        <td>Support</td>
                        <td className="text-center">Email</td>
                        <td className="text-center">Email & Chat</td>
                        <td className="text-center">Priority Support</td>
                        <td className="text-center">Personal Consulting</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Col>
            </Row>
          )}
        </Container>
      </div>

      <Container className="py-5">
        <Row className="text-center mb-5">
          <Col>
            <h2 className="fw-bold">Features by User Type</h2>
            <p className="lead">Our platform is tailored to meet the needs of diverse educational roles</p>
          </Col>
        </Row>

        <Row className="g-4 mb-5">
          <Col md={6} lg={3}>
            <div className="p-4 border bg-white h-100 shadow-sm" style={{ borderRadius: 15, border: "1px solid #bdbdbd" }}>
              <div
                className="mb-3"
                style={{ display: 'flex', alignItems: 'center', gap: '15px' }}
              >
                <i className="bi bi-mortarboard-fill" style={{ fontSize: 30, color: '#2c3e50' }}></i>
                <h3
                  className="mt-0"
                  style={{
                    fontSize: '1.5rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    color: "#2c3e50",
                    textOverflow: 'ellipsis',
                    maxHeight: '3em',
                    lineHeight: '1.5em'
                  }}
                >
                  For Students
                </h3>
              </div>
              <ul className="list-unstyled">
                <li
                  className="mb-2"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                >
                  <i className="bi bi-check-circle-fill text-success" style={{ flexShrink: 0, marginTop: '3px' }}></i>
                  <span
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxHeight: '3em',
                      lineHeight: '1.5em'
                    }}
                  >
                    Access all courses
                  </span>
                </li>
                <li
                  className="mb-2"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                >
                  <i className="bi bi-check-circle-fill text-success" style={{ flexShrink: 0, marginTop: '3px' }}></i>
                  <span
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxHeight: '3em',
                      lineHeight: '1.5em'
                    }}
                  >
                    Join monthly event
                  </span>
                </li>
                <li
                  className="mb-2"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                >
                  <i className="bi bi-check-circle-fill text-success" style={{ flexShrink: 0, marginTop: '3px' }}></i>
                  <span
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxHeight: '3em',
                      lineHeight: '1.5em'
                    }}
                  >
                    Access to learn material of DG Next
                  </span>
                </li>
                <li
                  className="mb-2"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                >
                  <i className="bi bi-check-circle-fill text-success" style={{ flexShrink: 0, marginTop: '3px' }}></i>
                  <span
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxHeight: '3em',
                      lineHeight: '1.5em'
                    }}
                  >
                    Special discount on DGAcademy training (10%)
                  </span>
                </li>
              </ul>
            </div>
          </Col>

          <Col md={6} lg={3}>
            <div className="p-4 border bg-white h-100 shadow-sm" style={{ borderRadius: 15 }}>
              <div
                className="mb-3"
                style={{ display: 'flex', alignItems: 'center', gap: '15px' }}
              >
                <i className="bi bi-briefcase-fill" style={{ fontSize: 30, color: '#2c3e50' }}></i>
                <h3
                  className="mt-0"
                  style={{
                    fontSize: '1.5rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxHeight: '3em',
                    color: "#2c3e50",
                    lineHeight: '1.5em'
                  }}
                >
                  For Professionals
                </h3>
              </div>
              <ul className="list-unstyled">
                <li
                  className="mb-2"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                >
                  <i className="bi bi-check-circle-fill text-success" style={{ flexShrink: 0, marginTop: '0px' }}></i>
                  <span
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxHeight: '3em',
                      lineHeight: '1.5em'
                    }}
                  >
                    Access all courses
                  </span>
                </li>
                <li
                  className="mb-2"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                >
                  <i className="bi bi-check-circle-fill text-success" style={{ flexShrink: 0, marginTop: '0px' }}></i>
                  <span
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxHeight: '3em',
                      lineHeight: '1.5em'
                    }}
                  >
                    Join monthly event
                  </span>
                </li>
                <li
                  className="mb-2"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                >
                  <i className="bi bi-check-circle-fill text-success" style={{ flexShrink: 0, marginTop: '0px' }}></i>
                  <span
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxHeight: '3em',
                      lineHeight: '1.5em'
                    }}
                  >
                    Access to learn material of DG Next
                  </span>
                </li>
                <li
                  className="mb-2"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                >
                  <i className="bi bi-check-circle-fill text-success" style={{ flexShrink: 0, marginTop: '0px' }}></i>
                  <span
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxHeight: '3em',
                      lineHeight: '1.5em'
                    }}
                  >
                    Special discount on DGAcademy training (10%)
                  </span>
                </li>
              </ul>
            </div>
          </Col>

          <Col md={6} lg={3}>
            <div className="p-4 border bg-white h-100 shadow-sm" style={{ borderRadius: 15 }}>
              <div
                className="mb-3"
                style={{ display: 'flex', alignItems: 'center', gap: '15px' }}
              >
                <i className="bi bi-easel2-fill" style={{ fontSize: 30, color: '#2c3e50' }}></i>
                <h3
                  className="mt-0"
                  style={{
                    fontSize: '1.5rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    color: "#2c3e50",
                    textOverflow: 'ellipsis',
                    maxHeight: '3em',
                    lineHeight: '1.5em'
                  }}
                >
                  For Educators
                </h3>
              </div>
              <ul className="list-unstyled">
                <li
                  className="mb-2"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                >
                  <i className="bi bi-check-circle-fill text-success" style={{ flexShrink: 0, marginTop: '0px' }}></i>
                  <span
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxHeight: '3em',
                      lineHeight: '1.5em'
                    }}
                  >
                    Access all courses
                  </span>
                </li>
                <li
                  className="mb-2"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                >
                  <i className="bi bi-check-circle-fill text-success" style={{ flexShrink: 0, marginTop: '0px' }}></i>
                  <span
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxHeight: '3em',
                      lineHeight: '1.5em'
                    }}
                  >
                    Join monthly event
                  </span>
                </li>
                <li
                  className="mb-2"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                >
                  <i className="bi bi-check-circle-fill text-success" style={{ flexShrink: 0, marginTop: '0px' }}></i>
                  <span
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxHeight: '3em',
                      lineHeight: '1.5em'
                    }}
                  >
                    Access to learn material of DG Next
                  </span>
                </li>
                <li
                  className="mb-2"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                >
                  <i className="bi bi-check-circle-fill text-success" style={{ flexShrink: 0, marginTop: '0px' }}></i>
                  <span
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxHeight: '3em',
                      lineHeight: '1.5em'
                    }}
                  >
                    Special discount on DGAcademy training (10%)
                  </span>
                </li>
              </ul>
            </div>
          </Col>

          <Col md={6} lg={3}>
            <div className="p-4 border bg-white h-100 shadow-sm" style={{ borderRadius: 15 }}>
              <div
                className="mb-3"
                style={{ display: 'flex', alignItems: 'center', gap: '15px' }}
              >
                <i className="bi bi-building-fill" style={{ fontSize: 30, color: '#2c3e50' }}></i>
                <h3
                  className="mt-0"
                  style={{
                    fontSize: '1.5rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxHeight: '3em',
                    color: "#2c3e50",
                    lineHeight: '1.5em'
                  }}
                >
                  For Organizations
                </h3>
              </div>
              <ul className="list-unstyled">
                <li
                  className="mb-2"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                >
                  <i className="bi bi-check-circle-fill text-success" style={{ flexShrink: 0, marginTop: '0px' }}></i>
                  <span
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxHeight: '3em',
                      lineHeight: '1.5em'
                    }}
                  >
                    Special discount for bulk registration form for 5 persons
                  </span>
                </li>
                <li
                  className="mb-2"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                >
                  <i className="bi bi-check-circle-fill text-success" style={{ flexShrink: 0, marginTop: '0px' }}></i>
                  <span
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxHeight: '3em',
                      lineHeight: '1.5em'
                    }}
                  >
                    Discount on DGAcademy training course (10%)
                  </span>
                </li>
                <li
                  className="mb-2"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                >
                  <i className="bi bi-check-circle-fill text-success" style={{ flexShrink: 0, marginTop: '0px' }}></i>
                  <span
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxHeight: '3em',
                      lineHeight: '1.5em'
                    }}
                  >
                    Discount on DGAcademy event and conference (50%)
                  </span>
                </li>
                <li
                  className="mb-2"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                >
                  <i className="bi bi-check-circle-fill text-success" style={{ flexShrink: 0, marginTop: '0px' }}></i>
                  <span
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxHeight: '3em',
                      lineHeight: '1.5em'
                    }}
                  >
                    Personal training support and consulting from DGAcademy
                  </span>
                </li>
              </ul>
            </div>
          </Col>
        </Row>
      </Container>

      <Footer />
    </>
  );
}