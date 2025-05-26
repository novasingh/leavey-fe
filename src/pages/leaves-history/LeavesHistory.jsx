import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const LeavesHistory = () => {
  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4>Leaves History</h4>
            </Card.Header>
            <Card.Body>
              <p>This page shows the history of all leave requests.</p>
              <p>Content coming soon...</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LeavesHistory;
