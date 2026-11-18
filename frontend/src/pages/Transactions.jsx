import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Receipt,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import EmptyState from '../components/common/EmptyState';

export default function Transactions() {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  // State: List, Pagination, Filters
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Categories list for dropdown
  const [categories, setCategories] = useState([]);

  // Filter params
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Modal State: Create / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    notes: '',
  });

  // Delete State
  const [deletingId, setDeletingId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch Categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.getCategories();
        setCategories(res.categories || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Fetch Transactions
  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getTransactions({
        search,
        type: typeFilter,
        category: categoryFilter,
        startDate,
        endDate,
        sortBy,
        sortOrder,
        page,
        limit: 10,
      });
      setTransactions(res.transactions || []);
      setPagination(res.pagination || { page: 1, totalPages: 1, totalCount: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, typeFilter, categoryFilter, startDate, endDate, sortBy, sortOrder, page]);

  // Open Form for Create
  const handleOpenCreate = () => {
    const expenseCats = categories.filter((c) => c.type === 'expense');
    setEditingTransaction(null);
    setFormData({
      amount: '',
      type: 'expense',
      category: expenseCats[0]?._id || '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      notes: '',
    });
    setFormError('');
    setIsFormOpen(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (t) => {
    setEditingTransaction(t);
    setFormData({
      amount: t.amount,
      type: t.type,
      category: t.category?._id || t.category,
      date: new Date(t.date).toISOString().split('T')[0],
      description: t.description,
      notes: t.notes || '',
    });
    setFormError('');
    setIsFormOpen(true);
  };

  // Save Transaction
  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setFormError('Please enter a valid amount greater than 0.');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Description is required.');
      return;
    }
    if (!formData.category) {
      setFormError('Please select a valid category.');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingTransaction) {
        await api.updateTransaction(editingTransaction._id, formData);
      } else {
        await api.createTransaction(formData);
      }
      setIsFormOpen(false);
      fetchTransactions();
    } catch (err) {
      setFormError(err.message || 'Failed to save transaction');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Confirm and Delete
  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await api.deleteTransaction(deletingId);
      setIsConfirmOpen(false);
      setDeletingId(null);
      fetchTransactions();
    } catch (err) {
      alert(err.message || 'Failed to delete transaction');
    } finally {
      setDeleteLoading(false);
    }
  };

  // CSV Export
  const handleExportCsv = async () => {
    try {
      const blob = await api.exportCsv({
        search,
        type: typeFilter,
        category: categoryFilter,
        startDate,
        endDate,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SpendWise_Transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export CSV: ' + err.message);
    }
  };

  // Filtered categories for the active form type
  const formCategories = categories.filter((c) => c.type === formData.type);

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
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Transactions</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Track, filter, and manage your income and daily spending
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button className="btn btn-secondary" onClick={handleExportCsv} title="Export filtered transactions as CSV">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 200px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '32px' }}
            placeholder="Search description or notes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Filter by Type */}
        <div className="filter-group">
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
          </select>

          {/* Filter by Category */}
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </div>

        {/* Date Range & Sort */}
        <div className="filter-group">
          <input
            type="date"
            className="form-input"
            style={{ width: 'auto' }}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            title="Start Date"
          />
          <span style={{ color: 'var(--text-muted)' }}>to</span>
          <input
            type="date"
            className="form-input"
            style={{ width: 'auto' }}
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            title="End Date"
          />

          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-');
              setSortBy(sb);
              setSortOrder(so);
            }}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Loading transactions...
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No matching transactions"
            description="Try adjusting your filters, searching for a different keyword, or record a new transaction."
            actionText="Record Transaction"
            onAction={handleOpenCreate}
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t._id}>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                        {formatDate(t.date)}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.description}</div>
                        {t.notes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '300px' }}>
                            {t.notes}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.825rem',
                            fontWeight: 500,
                          }}
                        >
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: t.category?.color || '#dc2626',
                            }}
                          />
                          {t.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td>
                        <span className={`pill ${t.type === 'income' ? 'pill-income' : 'pill-expense'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          color: t.type === 'income' ? 'var(--accent-green)' : 'var(--text-primary)',
                        }}
                      >
                        {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount, currency)}
                      </td>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                          <button
                            className="btn-icon"
                            onClick={() => handleOpenEdit(t)}
                            title="Edit transaction"
                            aria-label={`Edit ${t.description}`}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleDeleteClick(t._id)}
                            title="Delete transaction"
                            aria-label={`Delete ${t.description}`}
                            style={{ color: 'var(--accent-red)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="pagination">
              <span>
                Showing {transactions.length} of {pagination.totalCount} transactions
              </span>
              <div className="pagination-controls">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create / Edit Modal Form */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTransaction ? 'Edit Transaction' : 'Record New Transaction'}
        maxWidth="520px"
      >
        {formError && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle size={18} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveTransaction}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Transaction Type</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  const matchingCats = categories.filter((c) => c.type === newType);
                  setFormData({
                    ...formData,
                    type: newType,
                    category: matchingCats[0]?._id || '',
                  });
                }}
              >
                <option value="expense">Expense (-)</option>
                <option value="income">Income (+)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Amount ({currency})</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                required
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select a category</option>
                {formCategories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Campus groceries, textbook, stipend"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Any additional details or context..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsFormOpen(false)}
              disabled={formSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={formSubmitting}
            >
              {formSubmitting ? 'Saving...' : editingTransaction ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to permanently delete this transaction? This will update your balances and monthly spending metrics."
        confirmText="Delete Transaction"
        loading={deleteLoading}
      />
    </div>
  );
}
