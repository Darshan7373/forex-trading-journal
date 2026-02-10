import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { toast } from 'react-toastify';
import './Analytics.css';

const Analytics = () => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const formatDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString('en-GB');
  };

  const loadAnalytics = async () => {
    try {
      const response = await analyticsAPI.getTrends();
      setTrends(response.data.trends);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await analyticsAPI.export();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `trades-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Trades exported successfully');
    } catch (error) {
      toast.error('Failed to export trades');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  const latestTrend = trends[0];
  const heroText = latestTrend
    ? `You're ${latestTrend.totalPips >= 0 ? 'up' : 'down'} ${latestTrend.totalPips >= 0 ? '+' : ''}${latestTrend.totalPips} pips this week — ${latestTrend.winRate}% win rate, stay focused.`
    : 'Your performance insights will appear here as you log trades.';

  const consistencyLabel = latestTrend && latestTrend.trades >= 5
    ? 'Discipline: Solid'
    : 'Discipline: Building';

  const progressValue = latestTrend ? Math.min(Math.max(latestTrend.winRate, 0), 100) : 0;

  return (
    <div className="page analytics-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Your trading performance, distilled.</p>
        </div>
        <button onClick={handleExport} className="btn-secondary btn-compact">
          Export CSV
        </button>
      </div>

      <div className="analytics-hero">
        <div className="hero-icon">AI</div>
        <p className="hero-text">{heroText}</p>
      </div>

      <div className="insight-row">
        <div className="insight-card">
          <div className="insight-label">This Week</div>
          <div className={`insight-value ${latestTrend && latestTrend.totalPips >= 0 ? 'positive' : 'negative'}`}>
            {latestTrend ? `${latestTrend.totalPips >= 0 ? '+' : ''}${latestTrend.totalPips} pips` : '—'}
          </div>
          <div className="insight-sub">{latestTrend ? `${latestTrend.trades} trades` : 'No data yet'}</div>
        </div>
        <div className="insight-card">
          <div className="insight-label">Win Rate</div>
          <div className="insight-value neutral">
            {latestTrend ? `${latestTrend.winRate}%` : '—'}
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressValue}%` }}></div>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-label">Consistency</div>
          <div className="insight-value neutral">{latestTrend ? consistencyLabel : '—'}</div>
          <div className="insight-sub">Keep your routine steady.</div>
        </div>
      </div>
      
      <div className="card card-section analytics-section">
        <div className="section-header">
          <h3 className="section-title">Performance Trends</h3>
        </div>
        {trends.length === 0 ? (
          <p>Not enough data yet. Keep trading.</p>
        ) : (
          <div className="table-shell">
            <table className="data-table analytics-table">
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Win Rate</th>
                  <th>Total Pips</th>
                  <th>Trades</th>
                </tr>
              </thead>
              <tbody>
                {trends.map((trend, idx) => (
                  <tr key={idx}>
                    <td className="muted">{formatDate(trend.week)}</td>
                    <td>
                      <span className="metric-number">{trend.winRate}%</span>
                    </td>
                    <td>
                      <span className={`pips ${trend.totalPips >= 0 ? 'positive' : 'negative'}`}>
                        {trend.totalPips >= 0 ? '+' : ''}{trend.totalPips}
                      </span>
                    </td>
                    <td>
                      <span className="metric-number">{trend.trades}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
