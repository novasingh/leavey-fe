import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Helper: Get color for a leave type name
function getLeaveTypeColor(leaveTypeName, leaveTypes) {
  const found = leaveTypes.find(t => t.name === leaveTypeName);
  return found ? found.color : '#00905F';
}

// Helper: Get department name for a leave request
function getDepartmentNameForLeave(leave, departments) {
  // You may need to adjust this if your leave request has department_id or department_name
  // Here, we assume leave.department or leave.department_name matches department.name
  return leave.department || leave.department_name || null;
}

// Calculate total approved per department and use leave type color
const getApprovedLeavesByDepartment = (leaveRequests, departments, leaveTypes) => {
  // For each department, count approved leaves and get the most frequent leave type
  return departments.map(dept => {
    // Get all approved leaves for this department
    const approved = leaveRequests.filter(lr => {
      const deptName = getDepartmentNameForLeave(lr, departments);
      return deptName === dept.name && lr.status === 'Approved';
    });
    // Count by leave type
    const leaveTypeCounts = {};
    approved.forEach(lr => {
      const type = lr.leave_type_name || lr.type;
      leaveTypeCounts[type] = (leaveTypeCounts[type] || 0) + 1;
    });
    // Find the most frequent leave type
    let maxType = null, maxCount = 0;
    Object.entries(leaveTypeCounts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxType = type;
        maxCount = count;
      }
    });
    return {
      name: dept.name,
      total_approved: approved.length,
      color: getLeaveTypeColor(maxType, leaveTypes),
      mostFrequentType: maxType || '-',
    };
  });
};

// departments: [{ name, total_approved, color, mostFrequentType }]
const LeaveBarChart = ({ departments, leaveRequests = [], leaveTypes = [] }) => {
  // If departments prop is already the processed data, use as is
  const chartData = departments && departments[0] && typeof departments[0].total_approved === 'number'
    ? departments
    : getApprovedLeavesByDepartment(leaveRequests, departments, leaveTypes);

  const data = {
    labels: chartData.map(d => d.name),
    datasets: [
      {
        label: 'Approved Leaves',
        data: chartData.map(d => d.total_approved),
        backgroundColor: chartData.map(d => d.color || '#00905F'),
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 40,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            const dept = chartData[context.dataIndex];
            return `Approved: ${dept.total_approved} (${dept.mostFrequentType || '-'})`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#333', font: { weight: 'bold' } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#333' }
      }
    }
  };

  return (
    <div style={{ width: '100%', minHeight: 320 }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default LeaveBarChart;
