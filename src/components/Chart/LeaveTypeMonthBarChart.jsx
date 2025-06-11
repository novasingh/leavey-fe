import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getLeaveTypeColor(type, leaveTypes) {
  const found = leaveTypes.find(t => t.name === type);
  return found ? found.color : '#00905F';
}

const LeaveTypeMonthBarChart = ({ leaveRequests = [], leaveTypes = [], department, year, hideLegend }) => {
  // Filter by department and year
  const filtered = useMemo(() => {
    return leaveRequests.filter(lr => {
      const lrYear = new Date(lr.start_date || lr.from).getFullYear();
      const deptMatch = !department || lr.department === department;
      return lrYear === year && deptMatch;
    });
  }, [leaveRequests, department, year]);

  // Get all leave type names
  const leaveTypeNames = useMemo(() => {
    const set = new Set();
    leaveTypes.forEach(t => set.add(t.name));
    filtered.forEach(lr => set.add(lr.leave_type_name || lr.type));
    return Array.from(set);
  }, [leaveTypes, filtered]);

  // Prepare data per month per leave type
  const dataByMonth = useMemo(() => {
    const result = MONTHS.map(month => {
      const obj = { month };
      leaveTypeNames.forEach(type => { obj[type] = 0; });
      return obj;
    });
    filtered.forEach(lr => {
      const date = new Date(lr.start_date || lr.from);
      const monthIdx = date.getMonth();
      const type = lr.leave_type_name || lr.type;
      if (type && result[monthIdx]) {
        result[monthIdx][type]++;
      }
    });
    return result;
  }, [filtered, leaveTypeNames]);

  // Chart.js datasets
  const datasets = leaveTypeNames.map(type => ({
    label: type,
    data: dataByMonth.map(m => m[type]),
    backgroundColor: getLeaveTypeColor(type, leaveTypes),
    borderRadius: 8,
    borderSkipped: false,
    maxBarThickness: 40,
  }));

  const data = {
    labels: MONTHS,
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: !hideLegend,
        labels: {
          font: { size: 18, weight: 'bold' },
          color: '#333',
        },
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#333',
          font: { size: 18, weight: 'bold' },
        },
        title: {
          display: true,
          text: 'Month',
          font: { size: 20, weight: 'bold' },
          color: '#222',
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          color: '#333',
          font: { size: 18, weight: 'bold' },
        },
        title: {
          display: true,
          text: 'Number of Leave Requests',
          font: { size: 20, weight: 'bold' },
          color: '#222',
        },
      },
    },
  };

  return (
    <div style={{ width: '100%', minHeight: 320 }}>
      <Bar data={data} options={options} />
    </div>
  );
};

// Helper to get all years from leaveRequests
export function getAllYearsFromLeaveRequests(leaveRequests) {
  const years = new Set();
  leaveRequests.forEach(lr => {
    if (lr.start_date) {
      years.add(new Date(lr.start_date).getFullYear());
    }
  });
  return Array.from(years).sort((a, b) => b - a); // Descending order
}

export default LeaveTypeMonthBarChart;
