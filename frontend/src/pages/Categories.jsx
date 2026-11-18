import React, { useState, useEffect } from 'react';
import { Plus, Tags, Edit2, Trash2, AlertCircle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import EmptyState from '../components/common/EmptyState';

const PALETTE = [
  '#dc2626', // Red
  '#ea580c', // Orange
  '#d97706', // Amber
  '#16a34a', // Green
  '#0d9488', // Teal
  '#2563eb', // Blue
  '#7c3aed', // Violet
  '#db2777', // Pink
  '#475569', // Slate
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('expense'); // 'expense' | 'income'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [color, setColor] = useState('#dc2626');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete State
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getCategories();
      setCategories(res.categories || []);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setType(activeTab);
    setColor(activeTab === 'income' ? '#16a34a' : '#dc2626');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCategory(c);
    setName(c.name);
    setType(c.type);
    setColor(c.color);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Category name cannot be empty.');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory._id, { name: name.trim(), color });
      } else {
        await api.createCategory({ name: name.trim(), type, color });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError(err.message || 'Failed to save category');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteClick = (c) => {
    setDeletingCategory(c);
    setDeleteError('');
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.deleteCategory(deletingCategory._id);
      setIsConfirmOpen(false);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err) {
      setDeleteError(err.message || 'Cannot delete category');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === activeTab);

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
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Categories</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Organize transactions and budgets with custom categories
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {deleteError && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          className={`btn ${activeTab === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('expense')}
        >
          Expense Categories ({categories.filter((c) => c.type === 'expense').length})
        </button>
        <button
          className={`btn ${activeTab === 'income' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('income')}
          style={{
            backgroundColor: activeTab === 'income' ? 'var(--accent-green)' : undefined,
            borderColor: activeTab === 'income' ? 'var(--accent-green)' : undefined,
          }}
        >
          Income Categories ({categories.filter((c) => c.type === 'income').length})
        </button>
      </div>

      {/* Card Content */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Loading categories...
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            icon={Tags}
            title={`No ${activeTab} categories found`}
            description={`Create your first custom ${activeTab} category to label transactions.`}
            actionText={`Add ${activeTab} category`}
            onAction={handleOpenCreate}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            {filteredCategories.map((c) => (
              <div
                key={c._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-page)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: c.color,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {c.isDefault ? 'Default Category' : 'Custom Category'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    className="btn-icon"
                    onClick={() => handleOpenEdit(c)}
                    title="Rename / change color"
                    aria-label={`Edit ${c.name}`}
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleDeleteClick(c)}
                    title="Delete category"
                    aria-label={`Delete ${c.name}`}
                    style={{ color: 'var(--accent-red)' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        maxWidth="440px"
      >
        {formError && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle size={18} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveCategory}>
          <div className="form-group">
            <label className="form-label">Category Name</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Subscriptions, Groceries, Tutoring"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category Type</label>
            <select
              className="form-select"
              disabled={!!editingCategory}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Theme Color</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              {PALETTE.map((hex) => (
                <button
                  type="button"
                  key={hex}
                  onClick={() => setColor(hex)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: hex,
                    border: color === hex ? '3px solid var(--text-primary)' : '2px solid transparent',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                  title={hex}
                  aria-label={`Color ${hex}`}
                />
              ))}
            </div>
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
              {formSubmitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setDeleteError('');
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deletingCategory?.name}"? You will only be allowed to delete it if no transactions or budgets are currently using it.`}
        confirmText="Delete Category"
        loading={deleteLoading}
      />
    </div>
  );
}
