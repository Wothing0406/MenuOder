import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatVND } from '../lib/utils';

export default function RevenueChart({ data, period = 'month' }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Chưa có dữ liệu để hiển thị</p>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (period === 'year') {
      return `${date.getMonth() + 1}/${date.getFullYear()}`;
    }
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const chartData = data.map(item => ({
    ...item,
    dateFormatted: formatDate(item.date)
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="dateFormatted" 
          stroke="#666"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#666"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip 
          formatter={(value, name) => {
            if (name === 'revenue') {
              return [formatVND(value), 'Doanh thu'];
            }
            return [value, 'Số đơn'];
          }}
          labelFormatter={(label) => `Ngày: ${label}`}
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#10b981" 
          strokeWidth={2}
          name="Doanh thu"
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="orderCount" 
          stroke="#3b82f6" 
          strokeWidth={2}
          name="Số đơn"
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}




