import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * Order type reference (as expected from backend /api/orders/):
 * {
 *   id: number|string,
 *   customer_name: string,
 *   total_amount: number,
 *   status: 'created' | 'delivered' | 'invoiced',
 *   created_at?: string,
 *   updated_at?: string
 * }
 */

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch orders on first render
  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        // Use backend endpoint provided in task details
        const res = await fetch('http://localhost:3001/api/orders/');
        if (!res.ok) {
          throw new Error(`Failed to fetch orders: ${res.status}`);
        }
        const data = await res.json();
        if (isMounted) {
          setOrders(Array.isArray(data) ? data : (data?.results || []));
        }
      } catch (e) {
        if (isMounted) setError(e.message || 'Unknown error while fetching orders');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchOrders();
    return () => { isMounted = false; };
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Helpers for Ocean Professional theme styling
  const palette = {
    primary: '#2563EB',     // created
    secondary: '#F59E0B',   // invoiced
    success: '#F59E0B',     // delivered (amber per spec)
    error: '#EF4444',
    background: '#f9fafb',
    surface: '#ffffff',
    text: '#111827',
  };

  const statusStyles = {
    created: {
      chipBg: 'rgba(37, 99, 235, 0.12)',
      chipText: palette.primary,
      border: '1px solid rgba(37, 99, 235, 0.25)',
    },
    delivered: {
      chipBg: 'rgba(245, 158, 11, 0.12)',
      chipText: palette.success,
      border: '1px solid rgba(245, 158, 11, 0.25)',
    },
    invoiced: {
      chipBg: 'rgba(156, 163, 175, 0.15)', // gray-ish
      chipText: '#6B7280',
      border: '1px solid rgba(156, 163, 175, 0.3)',
    },
  };

  const getStatusLabel = (s) => {
    if (!s) return 'Unknown';
    const v = String(s).toLowerCase();
    if (v === 'created') return 'Created';
    if (v === 'delivered') return 'Delivered';
    if (v === 'invoiced') return 'Invoiced';
    return s;
  };

  const headerStyle = {
    background: `linear-gradient(135deg, rgba(37,99,235,0.06), rgba(249,250,251,0.9))`,
    borderBottom: '1px solid rgba(17,24,39,0.06)',
  };

  const containerStyle = {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '24px',
  };

  const cardStyle = {
    background: palette.surface,
    border: '1px solid rgba(17,24,39,0.08)',
    borderRadius: 12,
    boxShadow: '0 4px 14px rgba(17,24,39,0.06)',
    overflow: 'hidden',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
  };

  const thTdBase = {
    padding: '14px 16px',
    textAlign: 'left',
    borderBottom: '1px solid rgba(17,24,39,0.06)',
    color: palette.text,
    fontSize: 14,
  };

  const thStyle = {
    ...thTdBase,
    fontWeight: 600,
    background: '#F3F4F6',
  };

  const tdStyle = {
    ...thTdBase,
    background: palette.surface,
    fontWeight: 400,
  };

  const statusChip = (status) => {
    const key = String(status || '').toLowerCase();
    const sty = statusStyles[key] || statusStyles.created;
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '6px 10px',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 600,
          background: sty.chipBg,
          color: sty.chipText,
          border: sty.border,
          letterSpacing: 0.2,
          textTransform: 'uppercase',
        }}
        aria-label={`Order status: ${getStatusLabel(status)}`}
      >
        {getStatusLabel(status)}
      </span>
    );
  };

  return (
    <div className="App" style={{ background: palette.background, minHeight: '100vh' }}>
      <header style={{ ...headerStyle }}>
        <div style={{ ...containerStyle, paddingTop: 20, paddingBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h1 style={{ margin: 0, color: palette.text, fontSize: 22 }}>Order Lifecycle Dashboard</h1>
              <p style={{ margin: '6px 0 0 0', color: '#4B5563', fontSize: 14 }}>
                View and track orders across Created, Delivered, and Invoiced statuses.
              </p>
            </div>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              style={{
                backgroundColor: '#111827',
                color: '#F9FAFB',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </div>
      </header>

      <main style={{ ...containerStyle }}>
        <div style={{ ...cardStyle }}>
          <div style={{ padding: 16, borderBottom: '1px solid rgba(17,24,39,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 18, color: palette.text }}>Orders</h2>
            <div style={{ fontSize: 12, color: '#6B7280' }}>
              {loading ? 'Loading…' : `${orders.length} total`}
            </div>
          </div>

          {error && (
            <div style={{ padding: 16, color: palette.surface, background: palette.error }}>
              Error: {error}
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, borderTopLeftRadius: 12 }}>Order ID</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Total</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, borderTopRightRadius: 12 }}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {!loading && orders.length === 0 && !error && (
                  <tr>
                    <td style={tdStyle} colSpan={5}>
                      No orders found.
                    </td>
                  </tr>
                )}
                {orders.map((o) => {
                  const updated = o.updated_at || o.created_at || '';
                  return (
                    <tr key={o.id}>
                      <td style={tdStyle}>
                        <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
                          #{o.id}
                        </span>
                      </td>
                      <td style={tdStyle}>{o.customer_name || '—'}</td>
                      <td style={tdStyle}>
                        {typeof o.total_amount === 'number' ? `$${o.total_amount.toFixed(2)}` : o.total_amount || '—'}
                      </td>
                      <td style={tdStyle}>{statusChip(o.status)}</td>
                      <td style={tdStyle}>
                        {updated ? new Date(updated).toLocaleString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ padding: 14, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>
              Created = Blue, Delivered = Amber, Invoiced = Gray
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
