import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'react-bootstrap';

const StatusBadge = ({ status, mapping }) => {
  const normalizedStatus = status?.toLowerCase();

  const defaultMapping = {
    approved: { variant: 'success' },
    pending: { variant: 'warning' },
    rejected: { variant: 'danger' },
    completed: { variant: 'success' },
    'in-progress': { variant: 'info' },
    active: { variant: 'success' },
    inactive: { variant: 'secondary' },
    cancelled: { variant: 'warning' },
  };

  const variant =
    mapping?.[normalizedStatus]?.variant ||
    defaultMapping?.[normalizedStatus]?.variant ||
    'secondary';

  return (
    <Badge bg={variant} className="status-badge">
      {status}
    </Badge>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  mapping: PropTypes.object
};

export default StatusBadge;
