import React, { useState, useEffect } from 'react';
import {
  Plus,
  PiggyBank,
  AlertTriangle,
  CheckCircle,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatMonth } from '../utils/formatters';
import ProgressBar from '../components/common/ProgressBar';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import EmptyState from '../components/common/EmptyState';
import StatCard from '../components/common/StatCard';

export default function Budgets({ month, setMonth }) {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const [data, setData] = useState({ budgets: [], totalBudget: 0, totalSpent: 0, totalRemaining: 0, overallPercentage: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [categoryId, setCategoryId] = useState('');
  const [budgetMonth, setBudgetMonth] = useState(month);
  const [amount, setAmount] = useState('');

  // Delete State
  const [deletingId, setDeletingId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load Expense Categories
  useEffect(() => {
    const fetchExpenseCategories = async () => {
      try {
        const res = await api.getCategories('expense');
        setCategories(res.categories || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchExpenseCategories();
  }, []);

  // Load Budgets for the selected month
  const fetchBudgets = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getBudgets(month);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [month]);

  // Handle open create
  const handleOpenCreate = () => {
    setEditingBudget(null);
    setCategoryId(categories[0]?._id || '');
    setBudgetMonth(month);
    setAmount('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle open edit
  const handleOpenEdit = (b) => {
    setEditingBudget(b);
    setCategoryId(b.category?._id || b.category);
    setBudgetMonth(b.month);
    setAmount(b.limit);
    setFormError('');
    setIsModalOpen(true);
  };

  // Submit budget
  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!amount || parseFloat(amount) <= 0) {
      setFormError('Budget limit must be a positive number greater than 0.');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingBudget) {
        await api.updateBudget(editingBudget._id, { amount: parseFloat(amount) });
      } else {
        await api.createBudget({
          category: categoryId,
          month: budgetMonth,
          amount: parseFloat(amount),
        });
      }
      setIsModalOpen(false);
      fetchBudgets();
    } catch (err) {
      setFormError(err.message || 'Failed to save budget');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete budget
  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await api.deleteBudget(deletingId);
      setIsConfirmOpen(false);
      setDeletingId(null);
      fetchBudgets();
    } catch (err) {
      alert(err.message || 'Failed to delete budget');
    } finally {
      setDeleteLoading(false);
    }
  };

  const { budgets, totalBudget, totalSpent, totalRemaining, overallPercentage } = data;

  return (
    <div>
      {/* Header Bar */}
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
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Monthly Budgets</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Plan category spending limits and monitor consumption for {formatMonth(month)}
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
              aria-label="Select budget month"
            />
          </div>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Set New Budget</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stat-grid">
        <StatCard
          title="Total Planned Budget"
          amount={formatCurrency(totalBudget, currency)}
          subtext={`Across ${budgets.length} categories`}
          icon={PiggyBank}
          colorVariant="blue"
        />
        <StatCard
          title="Total Spent So Far"
          amount={formatCurrency(totalSpent, currency)}
          subtext={`${overallPercentage}% of total planned`}
          icon={AlertTriangle}
          colorVariant={overallPercentage >= 100 ? 'red' : overallPercentage >= 80 ? 'amber' : 'green'}
        />
        <StatCard
          title="Remaining Budget"
          amount={formatCurrency(totalRemaining, currency)}
          subtext={totalRemaining >= 0 ? 'Available to spend' : 'Over budget'}
          icon={CheckCircle}
          colorVariant={totalRemaining >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Budgets List Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          Loading budgets...
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : budgets.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={PiggyBank}
            title={`No budgets set for ${formatMonth(month)}`}
            description="Create monthly spending caps on expense categories like Groceries, Rent, or Entertainment to stay on track."
            actionText="Create Budget Target"
            onAction={handleOpenCreate}
          />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {budgets.map((b) => (
            <div
              key={b._id}
              className="card"
              style={{
                borderLeft: `4px solid ${
                  b.status === 'exceeded'
                    ? 'var(--accent-red)'
                    : b.status === 'warning'
                    ? 'var(--accent-amber)'
                    : 'var(--accent-green)'
                }`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h3
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: b.category?.color || '#dc2626',
                      }}
                    />
                    {b.category?.name || 'Category'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Limit: {formatCurrency(b.limit, currency)} / month
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    className="btn-icon"
                    onClick={() => handleOpenEdit(b)}
                    title="Edit limit"
                    aria-label={`Edit ${b.category?.name} budget`}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleDeleteClick(b._id)}
                    title="Delete budget"
                    aria-label={`Delete ${b.category?.name} budget`}
                    style={{ color: 'var(--accent-red)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ margin: '1rem 0 0.5rem 0' }}>
                <ProgressBar percentage={b.percentage} status={b.status} />
              </div>

              {/* Metrics line */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.5rem',
                }}
              >
                <span>
                  Spent: <strong>{formatCurrency(b.spent, currency)}</strong>
                </span>
                <span>
                  {b.remaining >= 0 ? (
                    <>
                      Left: <strong style={{ color: 'var(--accent-green)' }}>{formatCurrency(b.remaining, currency)}</strong>
                    </>
                  ) : (
                    <>
                      Over by: <strong style={{ color: 'var(--accent-red)' }}>{formatCurrency(Math.abs(b.remaining), currency)}</strong>
                    </>
                  )}
                </span>
              </div>

              {/* Status Badge */}
              <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                {b.status === 'exceeded' && (
                  <span className="pill pill-expense">
                    <AlertTriangle size={12} /> Limit Exceeded ({b.percentage}%)
                  </span>
                )}
                {b.status === 'warning' && (
                  <span className="pill pill-warning">
                    <AlertTriangle size={12} /> Near Limit ({b.percentage}%)
                  </span>
                )}
                {b.status === 'normal' && (
                  <span className="pill pill-income">
                    <CheckCircle size={12} /> On Track ({b.percentage}%)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Set / Edit Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBudget ? 'Edit Budget Limit' : 'Set Monthly Budget'}
        maxWidth="460px"
      >
        {formError && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle size={18} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveBudget}>
          <div className="form-group">
            <label className="form-label">Expense Category</label>
            <select
              className="form-select"
              required
              disabled={!!editingBudget}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Target Month</label>
            <input
              type="month"
              className="form-input"
              required
              disabled={!!editingBudget}
              value={budgetMonth}
              onChange={(e) => setBudgetMonth(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Spending Limit ({currency})</label>
            <input
              type="number"
              step="1"
              min="1"
              className="form-input"
              required
              placeholder="e.g. 350"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={formSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={formSubmitting}
            >
              {formSubmitting ? 'Saving...' : editingBudget ? 'Update Limit' : 'Save Budget'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Budget"
        message="Are you sure you want to delete this monthly budget target? This will remove the spending cap for this category."
        confirmText="Delete Budget"
        loading={deleteLoading}
      />
    </div>
  );
}
