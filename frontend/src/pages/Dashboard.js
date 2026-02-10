import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [aiReview, setAiReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewPeriod, setReviewPeriod] = useState('weekly');

  useEffect(() => {
    loadDashboard();
  }, [reviewPeriod]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, reviewRes] = await Promise.all([
        analyticsAPI.getSummary(),
        analyticsAPI.getAIReview(reviewPeriod)
      ]);
      
      setStats(statsRes.data.stats);
      setAiReview(reviewRes.data.review);
    } catch (error) {
      toast.error('Failed to load dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard">
        <div className="empty-state">
          <h2>Welcome to Your Trading Journal</h2>
          <p>Start logging your trades to unlock AI-powered insights</p>
          <Link to="/trades/new" className="btn-primary">
            Add Your First Trade
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header with CTA */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Trading Dashboard</h1>
          <p className="dashboard-subtitle">Your performance at a glance</p>
        </div>
        <Link to="/trades/new" className="btn-primary btn-add-trade">
          Add Trade
        </Link>
      </div>

      {/* Key Metrics Grid */}
      <div className="metrics-section">
        <h2 className="section-title">Key Metrics</h2>
        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-content">
              <div className="stat-label">Total Trades</div>
              <div className="stat-value">{stats.totalTrades}</div>
            </div>
          </div>
          
          <div className={`stat-card stat-success`}>
            <div className="stat-content">
              <div className="stat-label">Win Rate</div>
              <div className="stat-value">{stats.winRate}%</div>
            </div>
          </div>
          
          <div className={`stat-card stat-danger`}>
            <div className="stat-content">
              <div className="stat-label">Loss Rate</div>
              <div className="stat-value">{stats.lossRate}%</div>
            </div>
          </div>
          
          <div className={`stat-card ${stats.netPips >= 0 ? 'stat-profit' : 'stat-loss'}`}>
            <div className="stat-content">
              <div className="stat-label">Net Pips</div>
              <div className="stat-value">
                {stats.netPips >= 0 ? '+' : ''}{stats.netPips}
              </div>
            </div>
          </div>
          
          <div className="stat-card stat-info">
            <div className="stat-content">
              <div className="stat-label">R:R Ratio</div>
              <div className="stat-value">{stats.avgRR}</div>
            </div>
          </div>
          
          <div className="stat-card stat-info">
            <div className="stat-content">
              <div className="stat-label">Execution Score</div>
              <div className="stat-value">{stats.avgExecutionScore}/10</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="insights-section">
        <h2 className="section-title">Performance Insights</h2>
        <div className="insights-grid">
          <div className="insight-card insight-success">
            <div className="insight-header">
              <h3>Best Strategy</h3>
            </div>
            <p className="insight-content">{stats.bestStrategy}</p>
          </div>
          
          <div className="insight-card insight-warning">
            <div className="insight-header">
              <h3>Common Mistake</h3>
            </div>
            <p className="insight-content">{stats.commonMistake}</p>
          </div>
        </div>
      </div>

      {/* AI Review Section */}
      {aiReview && (
        <div className="ai-review-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">AI Performance Review</h2>
              <p className="section-subtitle">Intelligent analysis of your trading</p>
            </div>
            <select 
              value={reviewPeriod} 
              onChange={(e) => setReviewPeriod(e.target.value)}
              className="period-select"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="ai-review-grid">
            <div className="review-card review-summary">
              <h4>Performance Summary</h4>
              <div className="review-list">
                <div className="review-item">
                  <span className="review-label">Trades</span>
                  <span className="review-value">{aiReview.tradeCount}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Win Rate</span>
                  <span className="review-value">{aiReview.winRate}%</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Net Pips</span>
                  <span className={`review-value ${aiReview.netPips >= 0 ? 'positive' : 'negative'}`}>
                    {aiReview.netPips >= 0 ? '+' : ''}{aiReview.netPips}
                  </span>
                </div>
                <div className="review-item">
                  <span className="review-label">Avg R:R</span>
                  <span className="review-value">{aiReview.avgRR}</span>
                </div>
              </div>
            </div>

            <div className="review-card review-performers">
              <h4>Top Performers</h4>
              <div className="review-list">
                <div className="review-item">
                  <span className="review-label">Strategy</span>
                  <span className="review-value">{aiReview.bestStrategy}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Session</span>
                  <span className="review-value">{aiReview.bestSession}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Pair</span>
                  <span className="review-value">{aiReview.bestPair}</span>
                </div>
              </div>
            </div>

            <div className="review-card review-quality">
              <h4>Quality Metrics</h4>
              <div className="review-list">
                <div className="review-item">
                  <span className="review-label">Execution</span>
                  <span className="review-value">{aiReview.executionTrend}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Risk Grade</span>
                  <span className="review-value badge-grade">{aiReview.riskManagementGrade}</span>
                </div>
              </div>
            </div>
          </div>

          {aiReview.commonMistakes && aiReview.commonMistakes.length > 0 && (
            <div className="review-mistakes">
              <h4>Common Mistakes</h4>
              <ul className="mistake-list">
                {aiReview.commonMistakes.map((mistake, idx) => (
                  <li key={idx}><span className="bullet">•</span>{mistake}</li>
                ))}
              </ul>
            </div>
          )}

          {aiReview.recommendations && aiReview.recommendations.length > 0 && (
            <div className="review-recommendations">
              <h4>AI Recommendations</h4>
              <ol className="recommendation-list">
                {aiReview.recommendations.map((rec, idx) => (
                  <li key={idx}><span className="number">{idx + 1}</span>{rec}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Quick Navigation */}
      <div className="quick-actions">
        <Link to="/trades" className="action-btn action-primary">
          <span>View All Trades</span>
        </Link>
        <Link to="/analytics" className="action-btn action-secondary">
          <span>Detailed Analytics</span>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
