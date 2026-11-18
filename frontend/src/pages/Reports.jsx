import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Calendar,
  AlertCircle,
  PieChart,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import StatCard from '../components/common/StatCard';
import EmptyState from '../components/common/EmptyState';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Reports() {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const currentYear = new Date().getUTCFullYear();
  const [year, setYear] = useState(currentYear);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getReports({
        year: startDate || endDate ? undefined : year,
        startDate,
        endDate,
      });
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to generate financial reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [year, startDate, endDate]);

  const handleExportAll = async () => {
    try {
      const blob = await api.exportCsv({ startDate, endDate });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SpendWise_Report_${year}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export report CSV: ' + err.message);
    }
  };

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        Generating spending and income reports...
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <AlertCircle size={18} />
        <span>{error}</span>
      </div>
    );
  }

  const { summary, expenseCategories, incomeCategories, monthlyBreakdown } = data;

  // Monthly Cash Flow Chart
  const barChartData = {
    labels: monthlyBreakdown.map((m) => m.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyBreakdown.map((m) => m.income),
        backgroundColor: '#16a34a',
        borderRadius: 6,
      },
      {
        label: 'Expense',
        data: monthlyBreakdown.map((m) => m.expense),
        backgroundColor: '#dc2626',
        borderRadius: 6,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12 } },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${formatCurrency(context.raw, currency)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value) => formatCurrency(value, currency) },
        grid: { color: 'rgba(150, 150, 150, 0.1)' },
      },
      x: { grid: { display: false } },
    },
  };

  // Expense Doughnut
  const expenseDoughnut = {
    labels: expenseCategories.map((c) => c.name),
    datasets: [
      {
        data: expenseCategories.map((c) => c.total),
        backgroundColor: expenseCategories.map((c) => c.color || '#dc2626'),
        borderWidth: 2,
        borderColor: 'var(--bg-surface)',
      },
    ],
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Spending & Income Reports</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Deep-dive financial breakdown, category distributions, and annual trends
          </p>
        </div>

        <button className="btn btn-secondary" onClick={handleExportAll}>
          <Download size={16} />
          <span>Export Transactions CSV</span>
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Year:</label>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={year}
            disabled={!!(startDate || endDate)}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
          >
            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Or Custom Range:</label>
          <input
            type="date"
            className="form-input"
            style={{ width: 'auto' }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            title="Start Date"
          />
          <span style={{ color: 'var(--text-muted)' }}>to</span>
          <input
            type="date"
            className="form-input"
            style={{ width: 'auto' }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            title="End Date"
          />
          {(startDate || endDate) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
            >
              Reset to Full Year
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="stat-grid">
        <StatCard
          title="Period Income"
          amount={formatCurrency(summary.totalIncome, currency)}
          subtext={`${summary.incomeCount} income deposits`}
          icon={TrendingUp}
          colorVariant="green"
        />
        <StatCard
          title="Period Expenses"
          amount={formatCurrency(summary.totalExpense, currency)}
          subtext={`${summary.expenseCount} purchases`}
          icon={TrendingDown}
          colorVariant="red"
        />
        <StatCard
          title="Net Savings"
          amount={formatCurrency(summary.netSavings, currency)}
          subtext={summary.netSavings >= 0 ? `${summary.savingsRate}% saved` : 'Net deficit'}
          icon={DollarSign}
          colorVariant={summary.netSavings >= 0 ? 'green' : 'red'}
        />
        <StatCard
          title="Average Expense"
          amount={formatCurrency(summary.avgExpense, currency)}
          subtext="Per recorded expense"
          icon={BarChart3}
          colorVariant="blue"
        />
      </div>

      {summary.totalTransactions === 0 ? (
        <div className="card">
          <EmptyState
            icon={BarChart3}
            title="No data for this time period"
            description="There are no transactions recorded within the chosen timeframe to generate charts or reports."
          />
        </div>
      ) : (
        <>
          {/* Monthly Trend Chart */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Monthly Cash Flow Comparison</h3>
                <span className="card-subtitle">Income vs Expenses over time</span>
              </div>
            </div>
            <div style={{ height: '300px', position: 'relative' }}>
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>

          {/* Breakdown Grid: Expenses & Income */}
          <div className="dashboard-lower-grid">
            {/* Expense Categories */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Expense by Category</h3>
                  <span className="card-subtitle">{expenseCategories.length} categories active</span>
                </div>
              </div>

              {expenseCategories.length > 0 ? (
                <>
                  <div style={{ height: '220px', position: 'relative', marginBottom: '1.25rem' }}>
                    <Doughnut
                      data={expenseDoughnut}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'right', labels: { boxWidth: 10 } } },
                        cutout: '60%',
                      }}
                    />
                  </div>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Count</th>
                          <th style={{ textAlign: 'right' }}>Share</th>
                          <th style={{ textAlign: 'right' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenseCategories.map((c) => (
                          <tr key={c.categoryId}>
                            <td>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                                <span
                                  style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: 'var(--radius-full)',
                                    backgroundColor: c.color,
                                  }}
                                />
                                {c.name}
                              </span>
                            </td>
                            <td>{c.count}</td>
                            <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{c.percentage}%</td>
                            <td style={{ textAlign: 'right', fontWeight: 700 }}>
                              {formatCurrency(c.total, currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                  No expenses recorded in this period.
                </div>
              )}
            </div>

            {/* Income Categories */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Income Sources</h3>
                  <span className="card-subtitle">{incomeCategories.length} sources active</span>
                </div>
              </div>

              {incomeCategories.length > 0 ? (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Source</th>
                        <th>Deposits</th>
                        <th style={{ textAlign: 'right' }}>Share</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incomeCategories.map((c) => (
                        <tr key={c.categoryId}>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                              <span
                                style={{
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: 'var(--radius-full)',
                                  backgroundColor: c.color,
                                }}
                              />
                              {c.name}
                            </span>
                          </td>
                          <td>{c.count}</td>
                          <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{c.percentage}%</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-green)' }}>
                            {formatCurrency(c.total, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                  No income recorded in this period.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
