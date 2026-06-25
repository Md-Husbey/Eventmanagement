import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../features/api';

export default function AdminRevenuePage() {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/admin/revenue', { params: { period } }).then(({ data }) => setData(data.data)).finally(() => setLoading(false));
  }, [period]);

  const total = data.reduce((s, d) => s + parseFloat(d.revenue || 0), 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Revenue Report</h1>
        <div className="flex gap-2">
          {['monthly', 'daily'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors
                ${period === p ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600 mt-1">৳{total.toLocaleString()}</p>
        </div>
        <div className="card p-5">
          <p className="text-gray-500 text-sm">Transactions</p>
          <p className="text-3xl font-bold text-primary-600 mt-1">{data.reduce((s, d) => s + parseInt(d.transactions || 0), 0)}</p>
        </div>
        <div className="card p-5">
          <p className="text-gray-500 text-sm">Avg per Transaction</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">
            ৳{data.length ? Math.round(total / data.reduce((s, d) => s + parseInt(d.transactions || 0), 0) || 0).toLocaleString() : 0}
          </p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4 capitalize">{period} Revenue</h2>
        {loading ? (
          <div className="h-64 flex items-center justify-center"><p className="text-gray-400">Loading chart...</p></div>
        ) : data.length === 0 ? (
          <div className="h-64 flex items-center justify-center"><p className="text-gray-400">No revenue data yet</p></div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip formatter={(v) => [`৳${parseFloat(v).toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
