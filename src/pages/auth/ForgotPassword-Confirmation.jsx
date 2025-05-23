import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import BlankLayout from '../../layouts/BlankLayout'
import { Container, Row, Col } from 'react-bootstrap'
import logo from '../../assets/images/logo.png'

const ForgotPasswordConfirmation = () => {
  const location = useLocation()
  const email = location.state?.email || 'your email'

  return (
    <BlankLayout>
      <Container fluid className="min-vh-100 p-0" style={{ background: '#fff' }}>
        <Row className="g-0 min-vh-100 flex-row">
          <Col md={7} className="d-none d-md-flex align-items-center justify-content-center p-0" style={{ background: '#fff' }}>
            {/* Optionally add an illustration here if desired */}
          </Col>
          <Col xs={12} md={5} className="d-flex align-items-center justify-content-center p-0" style={{ background: '#4D49B3' }}>
            <div className="w-100 m-2" style={{ maxWidth: 465 }}>
              <div className="bg-white rounded-4 shadow-sm p-4 mx-auto" style={{ minWidth: 320, border: '6px solid #4D49B3' }}>
                <div className="text-center mb-3">
                  <Link to="/"><img src={logo} alt="Leavey Logo" style={{ width: "45%", marginBottom: 8 }} /></Link>
                </div>
                <h5 className="fw-bold text-center mb-3" style={{ color: '#222' }}>PASSWORD RESET REQUEST SENT</h5>
                <div className="mb-3 text-start" style={{ color: '#222', fontSize: 16 }}>
                  If an account with the provided email exists, a password reset link has been sent to:<br />
                </div>
                <span className="fw-bold mt-3">Email: <span className="text-success">{email}</span></span>
                <div className="mt-3 mb-3 text-start" style={{ color: '#222', fontSize: 15 }}>
                  Please check your inbox and follow the instructions to reset your password.<br />
                  If you don’t see the email within a few minutes, check your spam or junk folder.
                </div>
                <div className="text-start mt-4">
                  Click here to <Link to="/login" className="fw-bold text-primary text-decoration-none">Login</Link>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </BlankLayout>
  )
}

export default ForgotPasswordConfirmation
