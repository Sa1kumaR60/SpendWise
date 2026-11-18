import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Categories from './pages/Categories';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: '1.1rem',
        }}
      >
        Loading SpendWise session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// App Layout with Sidebar and Navbar
function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMonth, setActiveMonth] = useState(new Date().toISOString().slice(0, 7));
  const location = useLocation();

  // Determine page title based on path
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'Dashboard';
      case '/transactions':
        return 'Transactions';
      case '/budgets':
        return 'Monthly Budgets';
      case '/categories':
        return 'Categories';
      case '/reports':
        return 'Reports & Analytics';
      case '/settings':
        return 'Account Settings';
      default:
        return 'SpendWise';
    }
  };

  const isMonthSelectablePage = location.pathname === '/' || location.pathname === '/budgets';

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-wrapper">
        <Navbar
          title={getPageTitle(location.pathname)}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          month={isMonthSelectablePage ? activeMonth : undefined}
          onMonthChange={isMonthSelectablePage ? setActiveMonth : undefined}
        />

        <main className="content-area">
          <Routes>
            <Route path="/" element={<Dashboard month={activeMonth} setMonth={setActiveMonth} />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budgets" element={<Budgets month={activeMonth} setMonth={setActiveMonth} />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
