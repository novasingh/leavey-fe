import icon from '../../public/icon.png';
import './CustomLoader.scss';

const CustomLoader = () => (
  <div className="custom-loader-overlay">
    <div className="custom-loader-content">
      <div className="custom-loader-logo-row">
        <img src={icon} alt="Leavey Icon" className="custom-loader-icon" />
        <span className="custom-loader-text">Leavey</span>
      </div>
    </div>
  </div>
);

export default CustomLoader;
