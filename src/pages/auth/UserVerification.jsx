// UserVerification.jsx
import React, { useState } from 'react'
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import BlankLayout from '../../layouts/BlankLayout'
import loginIllustration from '../../assets/images/login-img.jpg'
import logo from '../../assets/images/logo.png'

const UserVerification = () => {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // Add your verification logic here
    setTimeout(() => {
      setLoading(false)
      // Simulate success or error
      // setError('Invalid code')
    }, 1000)
  }

  return (
    <BlankLayout>
      <Container fluid className="min-vh-100 p-0" style={{ background: '#fff' }}>
        <Row className="g-0 min-vh-100 flex-row">
          {/* Left illustration */}
          <Col md={7} className="d-none d-md-flex align-items-center justify-content-center p-0" style={{ background: '#fff' }}>
            <img src={loginIllustration} alt="Login Illustration" className="img-fluid" style={{ maxWidth: '80%', height: 'auto' }} />
          </Col>
          {/* Right form */}
          <Col xs={12} md={5} className="d-flex align-items-center justify-content-center p-0" style={{ background: '#4D49B3' }}>
            <div className="w-100 m-2" style={{ maxWidth: 465 }}>
              <div className="bg-white rounded-4 shadow-sm p-4 mx-auto" style={{ minWidth: 320 }}>
                <div className="text-center mb-4">
                  <img src={logo} alt="Leavey Logo" style={{ width: '45%', marginBottom: 8 }} />
                  <div className="fw-semibold fs-5 mt-2 text-dark">USER VERIFICATION</div>
                </div>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="verificationCode">
                    <Form.Label>Verification Code</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter verification code"
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-2 fw-semibold"
                    style={{ fontSize: 16 }}
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </Button>
                </Form>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </BlankLayout>
  )
}

export default UserVerification
