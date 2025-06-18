import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Table as BsTable } from 'react-bootstrap';
import './Table.scss';
import Pagination from '../Pagination';

const Table = ({ 
  columns, 
  data, 
  striped = true, 
  hover = true, 
  bordered = false, 
  responsive = true,
  className,
  onRowClick,
  pageSize = 10,
  currentPage: controlledPage,
  onPageChange: controlledOnPageChange
}) => {
  const [internalPage, setInternalPage] = useState(1);
  const totalPages = Math.ceil(data.length / pageSize);
  const currentPage = controlledPage || internalPage;
  const onPageChange = controlledOnPageChange || setInternalPage;
  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
          {paginatedData.length > 0 ? (
            paginatedData.map((row, index) => (
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
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}
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
  onRowClick: PropTypes.func,
  pageSize: PropTypes.number,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func
};

export default Table;
