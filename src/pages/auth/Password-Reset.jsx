import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import BlankLayout from '../../layouts/BlankLayout'
import { Form, Button, InputGroup, FormControl, Alert, Container, Row, Col } from 'react-bootstrap'
import authService from '../../services/authService'
import loginIllustration from '../../assets/images/login-img.jpg'
import logo from '../../assets/images/logo.png'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

const PasswordReset = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token')
    }
  }, [token])


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t('passwordReset.passwordMismatch'))
      setLoading(false)
      return
    }

    // Validate password length
    if (password.length < 8) {
      setError(t('passwordReset.passwordTooShort'))
      setLoading(false)
      return
    }

    try {
      const result = await authService.resetPassword(token, password, confirmPassword);
      
      if (result.success) {
        setSuccess(result.message)
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setError(result.error)
      }
    } catch (error) {
      console.error('Password reset error:', error)
      setError(t('passwordReset.errorMessage'))
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
            <div className="w-100 m-2" style={{ maxWidth: 465 }}>              <div className="bg-white rounded-4 shadow-sm p-4 mx-auto" style={{ minWidth: 320 }}>
                <div className="text-center mb-4">
                  <Link to="/"><img src={logo} alt="Leavey Logo" style={{ width: "45%", marginBottom: 8 }} /></Link>
                  <div className="fw-semibold fs-5 mt-2 text-dark">{t('passwordReset.title')}</div>
                </div>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="newPassword">
                    <InputGroup>
                      <FormControl
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('passwordReset.passwordPlaceholder')}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                      <Button
                        variant="light"
                        style={{border: '1px solid #dee2e6'}}
                        onClick={() => setShowPassword(v => !v)}
                        tabIndex={0}
                        aria-label={showPassword ? t('passwordReset.hidePassword') : t('passwordReset.showPassword')}
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </Button>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="confirmPassword">
                    <InputGroup>
                      <FormControl
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('passwordReset.confirmPasswordPlaceholder')}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                      <Button
                        variant="light"
                        style={{border: '1px solid #dee2e6'}}
                        onClick={() => setShowPassword(v => !v)}
                        tabIndex={0}
                        aria-label={showPassword ? t('passwordReset.hidePassword') : t('passwordReset.showPassword')}
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
                    disabled={loading || !token}
                  >
                    {loading ? t('passwordReset.submitting') : t('passwordReset.submitButton')}
                  </Button>
                  <div className="text-center my-2">
                    {t('passwordReset.backToLoginPrompt')} <Link to="/login" className='text-decoration-none text-primary fw-bold'>{t('passwordReset.loginLink')}</Link>
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