import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { getUsers } from '../../services/userService';

const UserMultiSelect = ({ value, onChange }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const users = await getUsers();
        const userOptions = users.map(user => ({
          label: `${user.first_name} ${user.last_name} (${user.email})`,
          value: user.id
        }));
        setOptions([
          { label: 'All', value: 'all' },
          ...userOptions
        ]);
      } catch {
        setOptions([{ label: 'All', value: 'all' }]);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // Handle All selection logic
  const handleChange = (selected) => {
    if (!selected) {
      onChange([]);
      return;
    }
    if (selected.some(opt => opt.value === 'all')) {
      onChange([{ label: 'All', value: 'all' }]);
    } else {
      onChange(selected);
    }
  };

  return (
    <Select
      isMulti
      isLoading={loading}
      options={options}
      value={value}
      onChange={handleChange}
      placeholder="Select users..."
      closeMenuOnSelect={false}
      isClearable
      classNamePrefix="react-select"
      noOptionsMessage={() => loading ? 'Loading...' : 'No users found'}
      menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
      menuPosition="fixed"
      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
    />
  );
};

export default UserMultiSelect;
