import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const leaveTypes = [
  { icon: '🌴', name: 'Annual Leave', accrual: '1.5 days/month', paid: 'Paid', max: '30 days', carry: 'Yes (up to 10 days)' },
  { icon: '🤒', name: 'Sick Leave', accrual: '1 day/month', paid: 'Paid', max: '15 days', carry: 'No' },
  { icon: '🏖️', name: 'Casual Leave', accrual: '0.5 day/month', paid: 'Paid', max: '12 days', carry: 'No' },
  { icon: '🤰', name: 'Maternity Leave', accrual: 'Lump sum (90 days)', paid: 'Paid', max: '90 days', carry: 'No' },
  { icon: '👨‍🍼', name: 'Paternity Leave', accrual: 'Lump sum (15 days)', paid: 'Paid', max: '15 days', carry: 'No' },
  { icon: '🕯️', name: 'Bereavement Leave', accrual: '5 days/year', paid: 'Paid', max: '5 days', carry: 'No' },
  { icon: '💍', name: 'Marriage Leave', accrual: '3 days/event', paid: 'Paid', max: '3 days', carry: 'No' },
  { icon: '🚫', name: 'Unpaid Leave', accrual: 'As requested', paid: 'Unpaid', max: 'Unlimited', carry: 'No' },
  { icon: '🕒', name: 'Compensatory Off', accrual: 'Based on overtime', paid: 'Paid', max: '10 days', carry: 'No (use within 3 months)' },
  { icon: '🎉', name: 'Public Holiday', accrual: 'As per calendar', paid: 'Paid', max: 'N/A', carry: 'N/A' },
];

const LeaveSetting = () => {
  const [workingHours, setWorkingHours] = useState({ start: '09:00', end: '17:00', flexible: false });
  const [workingDays, setWorkingDays] = useState({ weekday: true, weekend: false });
  const [cycleType, setCycleType] = useState('annual');

  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex align-items-center justify-content-between">
              <div>
                <span className="fw-bold fs-4">Leave Setting</span>
                <div className="text-muted" style={{ fontSize: '0.95rem' }}>settings / Leave Setting</div>
              </div>
              <Button variant="outline-primary" className="d-flex align-items-center" style={{ borderRadius: 20 }}>
                <FaPlus className="me-2" /> Add New Leave
              </Button>
            </Card.Header>
            <Card.Body>
              <div style={{ border: '1px dashed #b3b3b3', borderRadius: 8, padding: 0, marginBottom: 24 }}>
                <Table responsive hover className="mb-0" style={{ minWidth: 900 }}>
                  <thead style={{ background: '#f8f9fa' }}>
                    <tr>
                      <th>Leave Types</th>
                      <th>Accrual Rate</th>
                      <th>Paid/Unpaid</th>
                      <th>Max Balance</th>
                      <th>Carry Forward</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveTypes.map((lt, idx) => (
                      <tr key={lt.name}>
                        <td><span style={{ fontSize: 18 }}>{lt.icon}</span> <span className="fw-semibold ms-1">{lt.name}</span></td>
                        <td>{lt.accrual}</td>
                        <td>{lt.paid}</td>
                        <td>{lt.max}</td>
                        <td>{lt.carry}</td>
                        <td>
                          <Button size="sm" variant="success" className="me-2"><FaEdit className="me-1" />Edit</Button>
                          <Button size="sm" variant="danger"><FaTrash className="me-1" />Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <Card className="mb-0" style={{ border: '1px dashed #b3b3b3', borderRadius: 8 }}>
                <Card.Body>
                  <div className="fw-bold mb-3 fs-5">Leave Cycle Configuration</div>
                  <Row>
                    <Col md={4} className="mb-3 mb-md-0">
                      <div className="fw-semibold mb-2">Working Hours</div>
                      <Form>
                        <Form.Check type="radio" label="All day" name="timeType" id="allday" checked={false} disabled className="mb-2" />
                        <Form.Check type="radio" label="Time" name="timeType" id="timerange" checked readOnly className="mb-2" />
                        <Form.Check type="radio" label="Range" name="timeType" id="range" checked={false} disabled className="mb-2" />
                        <InputGroup className="mb-2">
                          <Form.Control type="time" value={workingHours.start} onChange={e => setWorkingHours({ ...workingHours, start: e.target.value })} style={{ maxWidth: 110 }} />
                          <InputGroup.Text>to</InputGroup.Text>
                          <Form.Control type="time" value={workingHours.end} onChange={e => setWorkingHours({ ...workingHours, end: e.target.value })} style={{ maxWidth: 110 }} />
                        </InputGroup>
                        <Form.Check type="checkbox" label="Enable Flexible Hours" checked={workingHours.flexible} onChange={e => setWorkingHours({ ...workingHours, flexible: e.target.checked })} />
                      </Form>
                    </Col>
                    <Col md={4} className="mb-3 mb-md-0">
                      <div className="fw-semibold mb-2">Working Days</div>
                      <Form>
                        <Form.Check type="checkbox" label="Weekday : Monday - Friday" checked={workingDays.weekday} onChange={e => setWorkingDays({ ...workingDays, weekday: e.target.checked })} className="mb-2" />
                        <Form.Check type="checkbox" label="Weekend : Saturday - Sunday" checked={workingDays.weekend} onChange={e => setWorkingDays({ ...workingDays, weekend: e.target.checked })} />
                      </Form>
                    </Col>
                    <Col md={4}>
                      <div className="fw-semibold mb-2">Cycle Type</div>
                      <Form>
                        <Form.Check type="radio" label="Annual cycle: January - December" name="cycleType" id="annual" checked={cycleType === 'annual'} onChange={() => setCycleType('annual')} className="mb-2" />
                        <Form.Check type="radio" label="Employee Join Date Anniversary" name="cycleType" id="join" checked={cycleType === 'join'} onChange={() => setCycleType('join')} />
                      </Form>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              <div className="d-flex justify-content-end mt-4">
                <Button style={{ borderRadius: 20, padding: '8px 32px' }} variant="primary">Save</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LeaveSetting;
