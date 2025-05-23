import React from 'react';
import PropTypes from 'prop-types';
import { Table as BsTable } from 'react-bootstrap';
import './Table.scss';

const Table = ({ 
  columns, 
  data, 
  striped = true, 
  hover = true, 
  bordered = false, 
  responsive = true,
  className,
  onRowClick
}) => {
  return (
    <div className={`custom-table-wrapper ${className || ''}`}>
      <BsTable 
        striped={striped} 
        hover={hover} 
        bordered={bordered}
        responsive={responsive} 
        className="custom-table"
      >
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={column.width ? { width: column.width } : {}}>
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <tr 
                key={row.id || index} 
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'clickable' : ''}
              >
                {columns.map((column) => (
                  <td key={`${row.id || index}-${column.key}`}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </BsTable>
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      render: PropTypes.func,
      width: PropTypes.string
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  striped: PropTypes.bool,
  hover: PropTypes.bool,
  bordered: PropTypes.bool,
  responsive: PropTypes.bool,
  className: PropTypes.string,
  onRowClick: PropTypes.func
};

export default Table;
