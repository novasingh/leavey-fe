import { useState } from 'react'
import { Link } from 'react-router-dom'
import BlankLayout from '../../layouts/BlankLayout'
import { Form, Button, InputGroup, FormControl, Alert, Container, Row, Col } from 'react-bootstrap'
import loginIllustration from '../../assets/images/login-img.jpg'
import logo from '../../assets/images/logo.png'
import { FiEye, FiEyeOff } from 'react-icons/fi'

const PasswordReset = () => {
  const [password, setPassword] = useState('')
  const [repassword, setRePassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
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
                  <div className="fw-semibold fs-5 mt-2 text-dark">Password Reset</div>
                </div>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
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
                  <Form.Group className="mb-3" controlId="reloginPassword">
                    <InputGroup>
                      <FormControl
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Re-enter New Password"
                        value={repassword}
                        onChange={e => setRePassword(e.target.value)}
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
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-2 fw-semibold"
                    style={{ fontSize: 16 }}
                    disabled={loading}
                  >
                    {loading ? 'Submitting in...' : 'Submit'}
                  </Button>
                  <div className="text-center my-2">
                    back to <Link to="/login" className='text-decoration-none text-primary fw-bold'>Login</Link>
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

export default PasswordReset