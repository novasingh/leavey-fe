import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BlankLayout from '../../layouts/BlankLayout'
import api from '../../services/axios'
import { Form, Button, InputGroup, FormControl, Alert, Container, Row, Col } from 'react-bootstrap'
import loginIllustration from '../../assets/images/login-img.jpg'
import logo from '../../assets/images/logo.png'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      // Example: store token and redirect
      localStorage.setItem('token', res.data.token)
      navigate('/dashboard')
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
          {/* Right login form */}
          <Col xs={12} md={5} className="d-flex align-items-center justify-content-center p-0" style={{ background: '#4D49B3' }}>
            <div className="w-100 m-2" style={{ maxWidth: 465 }}>
              <div className="bg-white rounded-4 shadow-sm p-4 mx-auto" style={{ minWidth: 320 }}>
                <div className="text-center mb-4">
                  <Link to="/"><img src={logo} alt="Leavey Logo" style={{ width: "45%", marginBottom: 8 }} /></Link>
                  <div className="fw-semibold fs-5 mt-2 text-dark">WELCOME BACK!</div>
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
                  <Form.Group className="mb-3" controlId="loginPassword">
                    <InputGroup>
                      <FormControl
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                      <Button
                        variant="light"
                        style={{border: '1px solid #dee2e6'}}
                        onClick={() => setShowPassword(v => !v)}
                        tabIndex={0}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </Button>
                    </InputGroup>
                  </Form.Group>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Check type="checkbox" label="Remember Me" style={{ fontSize: 14 }} />
                    <a href="/forgot-password" className="text-danger small">Forgot Password?</a>
                  </div>
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-2 fw-semibold"
                    style={{ fontSize: 16 }}
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                  <div className="text-center my-2 text-secondary">or</div>
                  <Button
                    variant="light"
                    className="w-100 border fw-medium d-flex align-items-center justify-content-center gap-2"
                    style={{ borderRadius: 12, border: '1px solid #ddd', height: 44, fontWeight: 500, fontSize: 16, boxShadow: 'none' }}
                  >
                    <FcGoogle size={24} style={{ marginRight: 8 }} />
                    <span>Sign in with Google</span>
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

export default Login
