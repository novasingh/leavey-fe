import React from 'react';
import PropTypes from 'prop-types';
import './Card.scss';

const Card = ({ 
  title, 
  children, 
  className, 
  icon,
  count,
  variant, 
  headerRight,
  footer
}) => {
  return (
    <div className={`custom-card ${className || ''} ${variant ? `card-${variant}` : ''}`}>
      {(title || headerRight) && (
        <div className="card-header">
          {title && (
            <div className="card-title">
              {icon && <span className="card-icon">{icon}</span>}
              <h4>{title}</h4>
              {count && <span className="card-count">{count}</span>}
            </div>
          )}
          {headerRight && <div className="card-header-right">{headerRight}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  icon: PropTypes.node,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  variant: PropTypes.string,
  headerRight: PropTypes.node,
  footer: PropTypes.node
};

export default Card;
