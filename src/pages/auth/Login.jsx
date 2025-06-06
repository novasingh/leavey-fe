import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BlankLayout from '../../layouts/BlankLayout'
import authService from '../../services/authService'
import { Form, Button, InputGroup, FormControl, Alert, Container, Row, Col, Dropdown } from 'react-bootstrap'
import loginIllustration from '../../assets/images/login-img.jpg'
import logo from '../../assets/images/logo.png'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Check if user is already authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      const role = authService.getUserRole(); // e.g. "Admin", "Manager", "Employee"

      switch (role) {
        case 'Admin':
          navigate('/dashboard/admin', { replace: true });
          break;
        case 'Manager':
          navigate('/dashboard/manager', { replace: true });
          break;
        case 'Employee':
          navigate('/dashboard/employee', { replace: true });
          break;
        default:
          navigate('/dashboard/employee', { replace: true });
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await authService.login(email, password);

      if (result.success) {
        const userName = result.user?.first_name || result.user?.username;
        console.log("Logged in as", userName);

        const role = result.user?.role_details?.name;

        switch (role) {
          case 'Admin':
            navigate('/dashboard/admin', { replace: true });
            break;
          case 'Manager':
            navigate('/dashboard/manager', { replace: true });
            break;
          case 'Employee':
            navigate('/dashboard/employee', { replace: true });
            break;
          default:
            navigate('/dashboard/employee', { replace: true });
            break;
        }
      } else {
        setError(result.error);
      }
    } catch {
      setError(t('login.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
  };

  return (
    <BlankLayout>
      <Container fluid className="min-vh-100 p-0 position-relative" style={{ background: '#fff' }}> {/* Added position-relative */}
        {/* Language Switcher */}
        <div style={{ background: 'white', borderRadius:'5px', position: 'absolute', top: '20px', right: '20px', zIndex: 1000 }}>
          <Dropdown align="end">
            <Dropdown.Toggle variant="outline-secondary" size="sm" id="lang-switch-login">
              {i18n.language === 'en' && t('header.lang.enShort')}
              {i18n.language === 'ms' && t('header.lang.msShort')}
              {i18n.language === 'zh' && t('header.lang.zhShort')}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => changeLanguage('en')}>{t('header.lang.english')}</Dropdown.Item>
              <Dropdown.Item onClick={() => changeLanguage('ms')}>{t('header.lang.malay')}</Dropdown.Item>
              <Dropdown.Item onClick={() => changeLanguage('zh')}>{t('header.lang.chinese')}</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

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
                  <div className="fw-semibold fs-5 mt-2 text-dark">{t('login.welcomeBack')}</div> {/* Changed */}
                </div>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="loginEmail">
                    <Form.Control
                      type="email"
                      placeholder={t('login.emailPlaceholder')} // Changed
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="loginPassword">
                    <InputGroup>
                      <FormControl
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('login.passwordPlaceholder')} // Changed
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                      <Button
                        variant="light"
                        style={{border: '1px solid #dee2e6'}}
                        onClick={() => setShowPassword(v => !v)}
                        tabIndex={0}
                        aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')} // Changed
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </Button>
                    </InputGroup>
                  </Form.Group>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Check type="checkbox" label={t('login.rememberMe')} style={{ fontSize: 14 }} /> {/* Changed */}
                    <a href="/forgot-password" className="text-danger small">{t('login.forgotPasswordLink')}</a> {/* Changed */}
                  </div>
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-2 fw-semibold"
                    style={{ fontSize: 16 }}
                    disabled={loading}
                  >
                    {loading ? t('login.loggingIn') : t('login.loginButton')} {/* Changed */}
                  </Button>
                  <div className="text-center my-2 text-secondary">{t('login.or')}</div> {/* Changed */}
                  <Button
                    variant="light"
                    className="w-100 border fw-medium d-flex align-items-center justify-content-center gap-2"
                    style={{ borderRadius: 12, border: '1px solid #ddd', height: 44, fontWeight: 500, fontSize: 16, boxShadow: 'none' }}
                  >
                    <FcGoogle size={24} style={{ marginRight: 8 }} />
                    <span>{t('login.signInWithGoogle')}</span> {/* Changed */}
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
