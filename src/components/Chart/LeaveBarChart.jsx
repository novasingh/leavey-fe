import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const LeaveBarChart = ({ leaveRequests, selectedYear, selectedDepartment }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!leaveRequests || leaveRequests.length === 0) return;

    // Filter by year and department
    const filtered = leaveRequests.filter(item => {
      const year = new Date(item.created_at).getFullYear();
      return (
        (!selectedYear || year === parseInt(selectedYear)) &&
        (!selectedDepartment || item.department === selectedDepartment)
      );
    });

    // Initialize empty data structure
    const dataPerMonth = months.map(month => ({
      month,
    }));

    // Collect unique leave types
    const leaveTypes = Array.from(new Set(filtered.map(l => l.leave_type_name)));

    // Populate the data
    filtered.forEach(item => {
      const date = new Date(item.created_at);
      const monthIndex = date.getMonth();
      const leaveType = item.leave_type_name;

      const monthEntry = dataPerMonth[monthIndex];
      if (!monthEntry[leaveType]) {
        monthEntry[leaveType] = 1;
      } else {
        monthEntry[leaveType] += 1;
      }
    });

    setChartData(dataPerMonth);
  }, [leaveRequests, selectedYear, selectedDepartment]);

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <XAxis dataKey="month" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          {chartData.length > 0 && Object.keys(chartData[0]).filter(k => k !== 'month').map((type, i) => (
            <Bar
              key={type}
              dataKey={type}
              stackId="a"
              fill={['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'][i % 5]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeaveBarChart;
