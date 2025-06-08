import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const LeaveBarChart = ({ departments }) => {
  // departments: [{ name, total_employees }]
  const data = {
    labels: departments.map(d => d.name),
    datasets: [
      {
        label: 'Total Employees',
        data: departments.map(d => d.total_employees),
        backgroundColor: [
          '#4D49B3', '#CD60AE', '#C31818', '#00905F', '#FFB900', '#00B8D9', '#36A2EB', '#FF6384'
        ],
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
      tooltip: { enabled: true }
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
