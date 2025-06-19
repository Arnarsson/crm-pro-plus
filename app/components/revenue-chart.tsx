'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueData {
  month: number;
  year: number;
  total_revenue: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function RevenueChart({ data }: RevenueChartProps) {
  // Transform data for the chart
  const chartData = data.map(item => ({
    month: monthNames[item.month - 1],
    revenue: item.total_revenue
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => `$${value.toLocaleString()}`}
          labelStyle={{ color: '#000' }}
        />
        <Legend />
        <Bar 
          dataKey="revenue" 
          fill="#8884d8" 
          name="Revenue ($)" 
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}