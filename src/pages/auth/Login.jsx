// Login.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BlankLayout from '../../layouts/BlankLayout'
import api from '../../services/axios'
import { Form, Button, InputGroup, FormControl, Alert } from 'react-bootstrap'
import loginIllustration from '../../assets/images/login-illustration.svg'
import logo from '../../assets/react.svg'

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
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <div style={{ flex: 1, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={loginIllustration} alt="Login Illustration" style={{ maxWidth: '80%', height: 'auto' }} />
        </div>
        <div style={{ flex: 1, background: '#e3f0fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 380, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #0001', padding: 32 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <img src={logo} alt="Leavey Logo" style={{ width: 48, marginBottom: 8 }} />
              <h4 style={{ fontWeight: 700, margin: 0 }}>Leavey</h4>
              <div style={{ fontWeight: 600, fontSize: 18, margin: '8px 0 0' }}>WELCOME BACK!</div>
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="loginEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="loginPassword">
                <Form.Label>Password</Form.Label>
                <InputGroup>
                  <FormControl
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                  >
                    <span className="material-icons" style={{ fontSize: 18 }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </Button>
                </InputGroup>
              </Form.Group>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Form.Check type="checkbox" label="Remember Me" style={{ fontSize: 14 }} />
                <a href="/forgot-password" style={{ color: '#C31818', fontSize: 14 }}>Forgot Password?</a>
              </div>
              <Button
                variant="primary"
                type="submit"
                className="w-100 mb-2"
                style={{ fontWeight: 600, fontSize: 16 }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <div className="text-center my-2" style={{ color: '#888' }}>or</div>
              <Button variant="light" className="w-100" style={{ border: '1px solid #eee', fontWeight: 500 }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png" alt="Google" style={{ width: 20, marginRight: 8, verticalAlign: 'middle' }} />
                Sign in with Google
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </BlankLayout>
  )
}

export default Login
