import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const LeavesApproval = () => {
  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4>Leaves Approval</h4>
            </Card.Header>
            <Card.Body>
              <p>This page is for managers to approve or reject leave requests.</p>
              <p>Content coming soon...</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LeavesApproval;
