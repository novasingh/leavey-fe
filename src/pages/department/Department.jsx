import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Department = () => {
  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4>Department Management</h4>
            </Card.Header>
            <Card.Body>
              <p>This page is for HR/Admin to manage departments.</p>
              <p>Content coming soon...</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Department;
