import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BlankLayout from '../../layouts/BlankLayout'
import api from '../../services/axios'
import loginIllustration from '../../assets/images/login-img.jpg'
import logo from '../../assets/images/logo.png'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/forgot-password', { email })
      if (res.status === 200) {
        navigate('/forgot-password-confirmation', { state: { email } })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
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
                  <Link to="/"><img src={logo} alt="Leavey Logo" style={{ width: "45%", marginBottom: 8 }} /></Link>
                  <div className="fw-semibold fs-5 mt-2 text-dark">FORGOT PASSWORD</div>
                </div>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="loginEmail">
                    <Form.Control
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
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
                    {loading ? 'Submitting...' : 'Submit'}
                  </Button>
                  <div className="text-center my-2">
                    back to <a href="/login" className="fw-bold text-primary">Login</a>
                  </div>
                </Form>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </BlankLayout>
  )
}

export default ForgotPassword
