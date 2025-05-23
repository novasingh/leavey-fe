import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'react-bootstrap';

const StatusBadge = ({ status, mapping }) => {
  const defaultMapping = {
    approved: { variant: 'success', label: 'Approved' },
    pending: { variant: 'warning', label: 'Pending' },
    rejected: { variant: 'danger', label: 'Rejected' },
    completed: { variant: 'success', label: 'Completed' },
    'in-progress': { variant: 'info', label: 'In Progress' },
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'secondary', label: 'Inactive' },
  };

  const statusConfig = mapping ? mapping[status] : defaultMapping[status] || { variant: 'secondary', label: status };

  return (
    <Badge bg={statusConfig.variant} className="status-badge">
      {statusConfig.label}
    </Badge>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  mapping: PropTypes.object
};

export default StatusBadge;
