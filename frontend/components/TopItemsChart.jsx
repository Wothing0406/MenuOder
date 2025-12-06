import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { formatVND } from '../lib/utils';
import { getImageUrl } from '../lib/utils';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'];

export default function TopItemsChart({ data, type = 'quantity' }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Chưa có dữ liệu để hiển thị</p>
      </div>
    );
  }

  const chartData = data.map((item, index) => ({
    name: item.itemName.length > 15 ? item.itemName.substring(0, 15) + '...' : item.itemName,
    fullName: item.itemName,
    quantity: item.totalQuantity,
    revenue: item.totalRevenue,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            stroke="#333"
            style={{ fontSize: '13px', fontWeight: '500', fill: '#333' }}
            tick={{ fill: '#333' }}
          />
          <YAxis 
            stroke="#333"
            style={{ fontSize: '14px', fontWeight: '500', fill: '#333' }}
            tick={{ fill: '#333' }}
            tickFormatter={(value) => type === 'quantity' ? value : `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'quantity') {
                return [value, 'Số lượng'];
              }
              return [formatVND(value), 'Doanh thu'];
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullName;
              }
              return label;
            }}
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
          />
          {type === 'quantity' ? (
            <Bar dataKey="quantity" name="Số lượng bán" fill="#10b981">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          ) : (
            <Bar dataKey="revenue" name="Doanh thu" fill="#3b82f6">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
      
      {/* Top items list */}
      <div className="mt-6 space-y-2">
        <h3 className="font-bold text-lg mb-3">Chi tiết món bán chạy:</h3>
        {data.slice(0, 5).map((item, index) => (
          <div key={item.itemId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
              {index + 1}
            </div>
            {item.itemImage && (
              <img 
                src={getImageUrl(item.itemImage)} 
                alt={item.itemName}
                className="w-12 h-12 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{item.itemName}</p>
              <p className="text-sm text-gray-600">
                Đã bán: <span className="font-bold text-green-600">{item.totalQuantity}</span> • 
                Doanh thu: <span className="font-bold text-blue-600">{formatVND(item.totalRevenue)}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}




