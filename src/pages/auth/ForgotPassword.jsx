import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BlankLayout from '../../layouts/BlankLayout'
import authService from '../../services/authService'
import loginIllustration from '../../assets/images/login-img.jpg'
import logo from '../../assets/images/logo.png'
import { useTranslation } from 'react-i18next';
const ForgotPassword = () => {
  const { t } = useTranslation(); 
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Check if user is already authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const result = await authService.forgotPassword(email);
      
      if (result.success) {
        navigate('/forgot-password-confirmation', { state: { email } });
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(t('forgotPassword.errorMessage'));
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
                  <div className="fw-semibold fs-5 mt-2 text-dark">{t('forgotPassword.title')}</div>
                </div>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="loginEmail">
                    <Form.Control
                      type="email"
                      placeholder={t('forgotPassword.emailPlaceholder')}
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
                    {loading ? t('forgotPassword.submitting') : t('forgotPassword.submitButton')}
                  </Button>
                  <div className="text-center my-2">
                    {t('forgotPassword.backToLoginPrompt')} <a href="/login" className="fw-bold text-primary">{t('forgotPassword.loginLink')}</a>
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
