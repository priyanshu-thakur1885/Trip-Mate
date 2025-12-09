import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const ExpenseChart = ({ expenses }) => {
  const categoryColors = {
    Travel: '#3b82f6',
    Food: '#f97316',
    Stay: '#a855f7',
    Shopping: '#ec4899',
    Activities: '#10b981',
    Misc: '#6b7280',
  };

  // Calculate totals by category
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category || 'Misc';
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {});

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  }));

  const COLORS = chartData.map((item) => categoryColors[item.name] || categoryColors.Misc);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Expenses by Category</h3>
      {chartData.length > 0 ? (
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              Total: ${total.toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>No expenses yet. Add expenses to see the chart.</p>
        </div>
      )}
    </div>
  );
};

export default ExpenseChart;

