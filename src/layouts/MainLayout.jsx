import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import { Container } from 'react-bootstrap';
import './MainLayout.scss';

const MainLayout = ({ children }) => {
  return (
    <div className={`main-layout`}>
      <Header/>
      <Sidebar/>
      <div className="content-wrapper">
        <main className="main-content">
          <Container fluid className="p-3 p-md-4">
            {children}
          </Container>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
