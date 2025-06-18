import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Image } from 'react-bootstrap';
import { getProfile, updateProfile } from '../../services/profileService';
import SuccessModal from '../modal/SuccessModal';
import { FaCamera } from 'react-icons/fa';
import CustomLoader from '../../components/CustomLoader';

const Profile = () => {
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    role: '',
    department: '',
    profile_picture: null,
    date_joined: '',
    is_active: false,
  });

  const [newProfilePictureFile, setNewProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fileInputRef = useRef(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
      setProfilePicturePreview(data.profile_picture);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Could not load profile data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePictureFile(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('first_name', profile.first_name);
    formData.append('last_name', profile.last_name);
    formData.append('phone_number', profile.phone_number || '');

    if (newProfilePictureFile) {
      formData.append('profile_picture', newProfilePictureFile);
    }

    try {
      await updateProfile(formData);
      setShowSuccessModal(true);
      fetchProfile();
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to save changes. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dateString;
  };

  

  return (
    <Container fluid className="p-4">
      <h3 className="mb-4 fw-bold">My Profile</h3>
      {loading ? <div style={{width:'100%', height: '100%', display: ' flex', justifyContent: 'center', alignItems: 'center'}}><CustomLoader /></div>:
      <Row>
        {/* Profile Picture Column */}
        <Col xl={4} lg={5} className="mb-4 mb-lg-0">
          <Card className="h-100">
            <Card.Body className="text-center p-4 d-flex flex-column justify-content-center">
              <div className="profile-picture-wrapper mx-auto mb-3" style={{ position: 'relative', width: '200px', height: '200px' }}>
                <Image
                  src={profilePicturePreview || `https://ui-avatars.com/api/?name=${profile.first_name}+${profile.last_name}&background=eeeeee&color=5B4B8A`}
                  roundedCircle
                  fluid
                  style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept="image/*"
                />
                <Button
                  variant="light"
                  onClick={() => fileInputRef.current.click()}
                  className="border"
                  style={{ position: 'absolute', bottom: '5px', right: '5px', borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
                >
                  <FaCamera />
                </Button>
              </div>
              <h5 className="fw-bold">{`${profile.first_name || ''} ${profile.last_name || ''}`}</h5>
              <p className="text-muted">{profile.email}</p>
              <span
                className={`badge bg-${profile.is_active ? 'success' : 'secondary'}`}
                style={{ width: 'fit-content', margin: '0 auto' }}
              >
                {profile.is_active ? 'Active' : 'Inactive'}
              </span>
            </Card.Body>
          </Card>
        </Col>

        {/* Profile Information Column */}
        <Col xl={8} lg={7}>
          <Card>
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                <h5 className="mb-3 fw-bold">Personal Information</h5>
                {error && <p className="text-danger">{error}</p>}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control type="text" name="first_name" value={profile.first_name} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control type="text" name="last_name" value={profile.last_name} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control type="email" value={profile.email} readOnly disabled />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control type="tel" name="phone_number" value={profile.phone_number} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                </Row>
                <hr className="my-4" />
                <h5 className="mb-3 fw-bold">Company Information</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Role</Form.Label>
                      <Form.Control type="text" value={profile.role} readOnly disabled />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Department</Form.Label>
                      <Form.Control type="text" value={profile.department} readOnly disabled />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date Joined</Form.Label>
                      <Form.Control type="text" value={formatDate(profile.date_joined)} readOnly disabled />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end mt-3">
                  <Button
                    type="submit"
                    style={{ borderRadius: 20, padding: '8px 24px', backgroundColor: '#5B4B8A', border: 'none', fontWeight: 500 }}
                  >
                    Save Changes
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>}

      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Profile Updated"
        message="Your profile information has been saved successfully."
      />
    </Container>
  );
};

export default Profile;
