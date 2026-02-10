import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tradeAPI } from '../services/api';
import { toast } from 'react-toastify';

const Trades = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrades();
  }, []);

  const formatDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString('en-GB');
  };

  const loadTrades = async () => {
    try {
      const response = await tradeAPI.getAll();
      setTrades(response.data.trades);
    } catch (error) {
      toast.error('Failed to load trades');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trade?')) return;
    try {
      await tradeAPI.delete(id);
      toast.success('Trade deleted');
      loadTrades();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Trades</h1>
          <p className="page-subtitle">A complete record of your executions.</p>
        </div>
        <Link to="/trades/new" className="btn-primary btn-compact">+ Add Trade</Link>
      </div>
      
      {trades.length === 0 ? (
        <div className="empty-state-card">
          <p>No trades yet. Start logging your trades.</p>
        </div>
      ) : (
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Pair</th>
                <th>Direction</th>
                <th>Outcome</th>
                <th>Pips</th>
                <th>AI Score</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trades.map(trade => (
                <tr key={trade._id}>
                  <td className="muted">{formatDate(trade.date)}</td>
                  <td className="pair">{trade.currencyPair}</td>
                  <td>{trade.direction}</td>
                  <td>
                    <span className={`badge badge-${trade.outcome === 'Win' ? 'success' : trade.outcome === 'Loss' ? 'danger' : 'warning'}`}>
                      {trade.outcome}
                    </span>
                  </td>
                  <td>
                    <span className={`pips ${trade.pips >= 0 ? 'positive' : 'negative'}`}>
                      {trade.pips >= 0 ? '+' : ''}{trade.pips}
                    </span>
                  </td>
                  <td className="ai-score">{trade.aiFeedback?.executionScore || 'N/A'}/10</td>
                  <td className="actions-cell text-right">
                    <Link to={`/trades/edit/${trade._id}`} className="table-action">Edit</Link>
                    <button
                      onClick={() => handleDelete(trade._id)}
                      className="table-action danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Trades;
