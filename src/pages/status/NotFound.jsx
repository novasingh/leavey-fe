import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import BlankLayout from '../../layouts/BlankLayout';
import './NotFound.scss';

const NotFound = () => {
  return (
    <BlankLayout>
      <Container className="not-found-page">
        <Row className="justify-content-center align-items-center vh-100">
          <Col xs={12} md={8} lg={6} className="text-center">
            <div className="not-found-content">
              <h1 className="display-1 fw-bold text-primary">404</h1>
              <h2 className="mb-3">Oops! Page Not Found.</h2>
              <p className="text-muted mb-4">
                The page you are looking for might have been removed, had its name changed,
                or is temporarily unavailable.
              </p>
              <Button as={Link} to="/dashboard" variant="primary" size="lg">
                Go to Dashboard
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </BlankLayout>
  );
};

export default NotFound;
