import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatVND } from '../lib/utils';

const COLORS = ['#10b981', '#3b82f6'];

export default function OrderTypePieChart({ data }) {
  if (!data || (!data.dine_in && !data.delivery)) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Chưa có dữ liệu để hiển thị</p>
      </div>
    );
  }

  const chartData = [
    { name: 'Tại quán', value: data.dine_in?.count || 0, revenue: data.dine_in?.revenue || 0 },
    { name: 'Giao hàng', value: data.delivery?.count || 0, revenue: data.delivery?.revenue || 0 }
  ].filter(item => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Chưa có dữ liệu để hiển thị</p>
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name, props) => {
              if (name === 'value') {
                return [`${value} đơn`, 'Số đơn'];
              }
              return [formatVND(props.payload.revenue), 'Doanh thu'];
            }}
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Stats summary */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Tại quán</p>
          <p className="text-2xl font-bold text-green-700">{data.dine_in?.count || 0}</p>
          <p className="text-xs text-gray-500">{formatVND(data.dine_in?.revenue || 0)}</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Giao hàng</p>
          <p className="text-2xl font-bold text-blue-700">{data.delivery?.count || 0}</p>
          <p className="text-xs text-gray-500">{formatVND(data.delivery?.revenue || 0)}</p>
        </div>
      </div>
    </div>
  );
}




