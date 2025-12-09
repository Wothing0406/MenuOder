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
          stroke="#333"
          style={{ fontSize: '14px', fontWeight: '500', fill: '#333' }}
          tick={{ fill: '#333' }}
        />
        <YAxis 
          stroke="#333"
          style={{ fontSize: '14px', fontWeight: '500', fill: '#333' }}
          tick={{ fill: '#333' }}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip 
          formatter={(value, name) => {
            const mapping = {
              revenue: 'Tổng doanh thu',
              cashRevenue: 'Tiền mặt',
              bankTransferRevenue: 'Chuyển khoản',
              zaloPayRevenue: 'ZaloPay',
              nonCashRevenue: 'Không tiền mặt',
              orderCount: 'Số đơn',
              otherRevenue: 'Khác'
            };
            const label = mapping[name] || name;
            if (name === 'orderCount') {
              return [value, label];
            }
            return [formatVND(value), label];
          }}
          labelFormatter={(label) => `Ngày: ${label}`}
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #ccc', 
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            padding: '10px'
          }}
          labelStyle={{ fontWeight: '600', color: '#333' }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '14px', fontWeight: '500' }}
          iconType="line"
        />
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
          dataKey="cashRevenue" 
          stroke="#f59e0b" 
          strokeWidth={2}
          name="Tiền mặt"
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line 
          type="monotone" 
          dataKey="bankTransferRevenue" 
          stroke="#3b82f6" 
          strokeWidth={2}
          name="Chuyển khoản"
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line 
          type="monotone" 
          dataKey="zaloPayRevenue" 
          stroke="#8b5cf6" 
          strokeWidth={2}
          name="ZaloPay"
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line 
          type="monotone" 
          dataKey="orderCount" 
          stroke="#0ea5e9" 
          strokeWidth={2}
          name="Số đơn"
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}




