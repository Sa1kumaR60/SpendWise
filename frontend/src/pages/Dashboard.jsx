import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Receipt,
  Calendar,
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
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, formatMonth } from '../utils/formatters';
import StatCard from '../components/common/StatCard';
import ProgressBar from '../components/common/ProgressBar';
import EmptyState from '../components/common/EmptyState';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function Dashboard({ month, setMonth }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currency = user?.currency || 'USD';

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getDashboard(month);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [month]);

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        Loading dashboard overview...
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <AlertTriangle size={18} />
        <span>{error}</span>
      </div>
    );
  }

  const { summary, categoryBreakdown, monthlyTrend, budgets, alertBudgets, recentTransactions, isEmptyState } = data;

  // Bar chart config (Monthly Trend: Income vs Expense)
  const barChartData = {
    labels: monthlyTrend.map((m) => m.label),
    datasets: [
      {
        label: 'Income',
        data: monthlyTrend.map((m) => m.income),
        backgroundColor: '#16a34a',
        borderRadius: 6,
      },
      {
        label: 'Expenses',
        data: monthlyTrend.map((m) => m.expense),
        backgroundColor: '#dc2626',
        borderRadius: 6,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { boxWidth: 12, font: { family: 'inherit', size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${formatCurrency(context.raw, currency)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(value, currency),
          font: { size: 11 },
        },
        grid: { color: 'rgba(150, 150, 150, 0.1)' },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  // Doughnut chart config (Category breakdown)
  const doughnutData = {
    labels: categoryBreakdown.map((c) => c.name),
    datasets: [
      {
        data: categoryBreakdown.map((c) => c.total),
        backgroundColor: categoryBreakdown.map((c) => c.color || '#dc2626'),
        borderWidth: 2,
        borderColor: 'var(--bg-surface)',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { boxWidth: 10, font: { family: 'inherit', size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${formatCurrency(context.raw, currency)} (${categoryBreakdown[context.dataIndex]?.percentage}%)`,
        },
      },
    },
    cutout: '65%',
  };

  return (
    <div>
      {/* Month Selector header banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
            {formatMonth(month)} Overview
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Financial health and budget progress report
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="filter-group" style={{ margin: 0 }}>
            <Calendar size={16} color="var(--text-muted)" />
            <input
              type="month"
              className="form-input"
              style={{ width: 'auto', padding: '0.45rem 0.75rem' }}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              aria-label="Filter dashboard by month"
            />
          </div>
          <Link to="/transactions" className="btn btn-primary btn-sm">
            <PlusCircle size={16} />
            <span>Add Transaction</span>
          </Link>
        </div>
      </div>

      {/* Budget Over Limit or Warning Alert Banner */}
      {alertBudgets && alertBudgets.length > 0 && (
        <div className="alert alert-warning">
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong>Budget Attention Needed!</strong> You have {alertBudgets.length} budget(s) nearing or exceeding their monthly limits:
            <ul style={{ margin: '0.35rem 0 0 1.25rem', fontSize: '0.85rem' }}>
              {alertBudgets.map((b) => (
                <li key={b._id}>
                  <strong>{b.category?.name || 'Category'}</strong>: {b.percentage}% used ({formatCurrency(b.spent, currency)} / {formatCurrency(b.limit, currency)})
                  {b.status === 'exceeded' && ' — Exceeded!'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Top 4 Stat Cards */}
      <div className="stat-grid">
        <StatCard
          title="Total Income"
          amount={formatCurrency(summary.totalIncome, currency)}
          subtext={`In ${formatMonth(month)}`}
          icon={TrendingUp}
          colorVariant="green"
        />
        <StatCard
          title="Total Expenses"
          amount={formatCurrency(summary.totalExpense, currency)}
          subtext={`In ${formatMonth(month)}`}
          icon={TrendingDown}
          colorVariant="red"
        />
        <StatCard
          title="Net Balance"
          amount={formatCurrency(summary.netSavings, currency)}
          subtext={summary.netSavings >= 0 ? 'Surplus / Savings' : 'Deficit this month'}
          icon={DollarSign}
          colorVariant={summary.netSavings >= 0 ? 'green' : 'red'}
        />
        <StatCard
          title="Savings Rate"
          amount={`${summary.savingsRate}%`}
          subtext={summary.totalIncome > 0 ? 'Of monthly income saved' : 'No income recorded'}
          icon={PiggyBank}
          colorVariant={summary.savingsRate > 20 ? 'green' : 'amber'}
        />
      </div>

      {isEmptyState ? (
        <div className="card">
          <EmptyState
            icon={Receipt}
            title="No transactions yet"
            description="You haven't recorded any income or expenses for this month. Start by recording your internship stipend or daily expenses!"
            actionText="Record First Transaction"
            onAction={() => (window.location.href = '/transactions')}
          />
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="charts-grid">
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Cash Flow Trend</h3>
                  <span className="card-subtitle">Last 6 months income vs. expenses</span>
                </div>
              </div>
              <div style={{ height: '280px', position: 'relative' }}>
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Expense Breakdown</h3>
                  <span className="card-subtitle">By category for {formatMonth(month)}</span>
                </div>
              </div>
              <div style={{ height: '280px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {categoryBreakdown.length > 0 ? (
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No expenses recorded in this period.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lower Row: Budgets Progress & Recent Transactions */}
          <div className="dashboard-lower-grid">
            {/* Budgets Summary */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Monthly Budgets</h3>
                  <span className="card-subtitle">Spending limits for {formatMonth(month)}</span>
                </div>
                <Link to="/budgets" className="btn btn-ghost btn-sm">
                  View All <ArrowRight size={14} />
                </Link>
              </div>

              {budgets.length === 0 ? (
                <EmptyState
                  icon={PiggyBank}
                  title="No budgets configured"
                  description="Set monthly spending targets to keep your expenses in check."
                  actionText="Set a Budget"
                  onAction={() => (window.location.href = '/budgets')}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                  {budgets.slice(0, 4).map((b) => (
                    <div key={b._id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: b.category?.color || '#dc2626',
                            }}
                          />
                          {b.category?.name || 'Category'}
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          <strong>{formatCurrency(b.spent, currency)}</strong> / {formatCurrency(b.limit, currency)}{' '}
                          <span style={{ color: b.status === 'exceeded' ? 'var(--accent-red)' : b.status === 'warning' ? 'var(--accent-amber)' : 'inherit', fontWeight: 700 }}>
                            ({b.percentage}%)
                          </span>
                        </span>
                      </div>
                      <ProgressBar percentage={b.percentage} status={b.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Recent Transactions</h3>
                  <span className="card-subtitle">Latest activity</span>
                </div>
                <Link to="/transactions" className="btn btn-ghost btn-sm">
                  View All <ArrowRight size={14} />
                </Link>
              </div>

              {recentTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No recent transactions found.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <tbody>
                      {recentTransactions.map((t) => (
                        <tr key={t._id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{t.description}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {formatDate(t.date)} • {t.category?.name || 'Uncategorized'}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <span
                              style={{
                                fontWeight: 700,
                                color: t.type === 'income' ? 'var(--accent-green)' : 'var(--text-primary)',
                              }}
                            >
                              {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount, currency)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
