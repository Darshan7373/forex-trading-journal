import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tradeAPI } from '../services/api';
import { toast } from 'react-toastify';
import './TradeForm.css';

const AddTrade = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    dayOfWeek: getDayOfWeek(new Date().toISOString().split('T')[0]),
    session: 'London',
    currencyPair: '',
    timeframe: 'H1',
    direction: 'Buy',
    entryTime: '',
    exitTime: '',
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    lotSize: '',
    riskPercentage: '1',
    rrRatio: '',
    fourHrSink: 'No',
    strategyName: '',
    outcome: 'Win',
    pips: '',
    notes: '',
    emotionsBefore: '',
    emotionsDuring: '',
    emotionsAfter: ''
  });

  // Helper function to get day of week from date
  function getDayOfWeek(dateString) {
    const date = new Date(dateString + 'T00:00:00Z');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getUTCDay()];
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-calculate day of week when date changes
    if (name === 'date') {
      const dayOfWeek = getDayOfWeek(value);
      setFormData(prev => ({
        ...prev,
        date: value,
        dayOfWeek: dayOfWeek
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Auto-calculate R:R ratio
    if (['entryPrice', 'stopLoss', 'takeProfit'].includes(name)) {
      calculateRR({ ...formData, [name]: value });
    }
  };

  const calculateRR = (data) => {
    const { entryPrice, stopLoss, takeProfit } = data;
    if (entryPrice && stopLoss && takeProfit) {
      const risk = Math.abs(parseFloat(entryPrice) - parseFloat(stopLoss));
      const reward = Math.abs(parseFloat(takeProfit) - parseFloat(entryPrice));
      if (risk > 0) {
        const rr = (reward / risk).toFixed(2);
        setFormData(prev => ({ ...prev, rrRatio: rr }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAiFeedback(null);

    try {
      // Safe numeric conversion helper
      const toNumber = (value) => {
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      };

      // Safe string conversion helper (null if empty)
      const toString = (value) => value && value.trim() ? value.trim() : null;

      // Build normalized payload with proper field types
      const tradeData = {
        // Required fields - strings
        date: formData.date.trim(),
        dayOfWeek: formData.dayOfWeek.trim(),
        session: formData.session.trim(),
        currencyPair: formData.currencyPair.trim().toUpperCase(),
        timeframe: formData.timeframe.trim(),
        direction: formData.direction.trim(),
        fourHrSink: formData.fourHrSink.trim(),
        strategyName: formData.strategyName.trim(),
        outcome: formData.outcome.trim(),
        
        // Required fields - numbers
        entryPrice: toNumber(formData.entryPrice),
        stopLoss: toNumber(formData.stopLoss),
        takeProfit: toNumber(formData.takeProfit),
        lotSize: toNumber(formData.lotSize),
        riskPercentage: toNumber(formData.riskPercentage),
        rrRatio: toNumber(formData.rrRatio),
        pips: toNumber(formData.pips),
        
        // Time fields
        entryTime: formData.entryTime ? formData.entryTime.trim() : null,
        exitTime: formData.exitTime ? formData.exitTime.trim() : null,
        
        // Optional fields
        notes: toString(formData.notes),
        emotionsBefore: toString(formData.emotionsBefore),
        emotionsDuring: toString(formData.emotionsDuring),
        emotionsAfter: toString(formData.emotionsAfter)
      };

      // Validate required numeric fields
      if (tradeData.entryPrice === null || tradeData.stopLoss === null || 
          tradeData.takeProfit === null || tradeData.lotSize === null || 
          tradeData.pips === null) {
        toast.error('Invalid numeric values. Please check price levels, lot size, and pips.');
        setLoading(false);
        return;
      }

      // Make API request
      const response = await tradeAPI.create(tradeData);
      
      // Display AI feedback if available
      if (response.data?.trade?.aiFeedback) {
        setAiFeedback(response.data.trade.aiFeedback);
      }
      
      toast.success('Trade added successfully with AI analysis!');
      
      // Navigate after showing feedback
      setTimeout(() => {
        navigate('/trades');
      }, 3000);
      
    } catch (error) {
      console.error('Trade creation error:', error);
      
      // Enhanced error message
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details || 
                          error.message || 
                          'Failed to add trade. Please try again.';
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trade-form-container">
      <div className="form-header">
        <h1>Add New Trade</h1>
        <button onClick={() => navigate('/trades')} className="btn-secondary">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="trade-form">
        <div className="form-section">
          <h3>Trade Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Day of Week</label>
              <input
                type="text"
                value={formData.dayOfWeek}
                readOnly
                disabled
                className="readonly-field"
              />
            </div>
            
            <div className="form-group">
              <label>Session *</label>
              <select name="session" value={formData.session} onChange={handleChange} required>
                <option value="London">London</option>
                <option value="NY">New York</option>
                <option value="Asia">Asia</option>
                <option value="Sydney">Sydney</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Entry Time</label>
              <input
                type="time"
                name="entryTime"
                value={formData.entryTime}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Exit Time</label>
              <input
                type="time"
                name="exitTime"
                value={formData.exitTime}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>4Hr Sink *</label>
              <select name="fourHrSink" value={formData.fourHrSink} onChange={handleChange} required>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Currency Pair *</label>
              <input
                type="text"
                name="currencyPair"
                value={formData.currencyPair}
                onChange={handleChange}
                placeholder="e.g., EURUSD"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Timeframe *</label>
              <select name="timeframe" value={formData.timeframe} onChange={handleChange} required>
                <option value="M1">M1</option>
                <option value="M5">M5</option>
                <option value="M15">M15</option>
                <option value="M30">M30</option>
                <option value="H1">H1</option>
                <option value="H4">H4</option>
                <option value="D1">D1</option>
                <option value="W1">W1</option>
                <option value="MN">Monthly</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Direction *</label>
              <select name="direction" value={formData.direction} onChange={handleChange} required>
                <option value="Buy">Buy</option>
                <option value="Sell">Sell</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Price Levels</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Entry Price *</label>
              <input
                type="number"
                step="0.00001"
                name="entryPrice"
                value={formData.entryPrice}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Stop Loss *</label>
              <input
                type="number"
                step="0.00001"
                name="stopLoss"
                value={formData.stopLoss}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Take Profit *</label>
              <input
                type="number"
                step="0.00001"
                name="takeProfit"
                value={formData.takeProfit}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Position Sizing & Risk</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Lot Size *</label>
              <input
                type="number"
                step="0.01"
                name="lotSize"
                value={formData.lotSize}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Risk % *</label>
              <input
                type="number"
                step="0.1"
                name="riskPercentage"
                value={formData.riskPercentage}
                onChange={handleChange}
                required
                min="0.1"
                max="10"
              />
            </div>
            
            <div className="form-group">
              <label>R:R Ratio *</label>
              <input
                type="number"
                step="0.01"
                name="rrRatio"
                value={formData.rrRatio}
                onChange={handleChange}
                required
                readOnly
                placeholder="Auto-calculated"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Strategy & Outcome</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Strategy Name *</label>
              <input
                type="text"
                name="strategyName"
                value={formData.strategyName}
                onChange={handleChange}
                placeholder="e.g., Trend Following, Breakout"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Outcome *</label>
              <select name="outcome" value={formData.outcome} onChange={handleChange} required>
                <option value="Win">Win</option>
                <option value="Loss">Loss</option>
                <option value="BE">Break Even</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Pips Gained/Lost *</label>
              <input
                type="number"
                step="0.1"
                name="pips"
                value={formData.pips}
                onChange={handleChange}
                required
                placeholder="Use negative for losses"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Notes & Psychology</h3>
          <div className="form-group">
            <label>Trade Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="What was your trade thesis? What did you observe?"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Emotions Before Trade</label>
              <input
                type="text"
                name="emotionsBefore"
                value={formData.emotionsBefore}
                onChange={handleChange}
                placeholder="e.g., Calm, confident, anxious"
              />
            </div>
            
            <div className="form-group">
              <label>Emotions During Trade</label>
              <input
                type="text"
                name="emotionsDuring"
                value={formData.emotionsDuring}
                onChange={handleChange}
                placeholder="e.g., Patient, fearful, greedy"
              />
            </div>
            
            <div className="form-group">
              <label>Emotions After Trade</label>
              <input
                type="text"
                name="emotionsAfter"
                value={formData.emotionsAfter}
                onChange={handleChange}
                placeholder="e.g., Satisfied, frustrated, relieved"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary btn-large" disabled={loading}>
          {loading ? '🤖 Analyzing...' : 'Add Trade & Analyze'}
        </button>
      </form>

      {/* AI Feedback Display */}
      {aiFeedback && (
        <div className="ai-feedback-display">
          <h2>🤖 AI Analysis Complete</h2>
          
          <div className="feedback-score">
            <div className="score-label">Execution Quality</div>
            <div className={`score-value score-${Math.floor(aiFeedback.executionScore / 3)}`}>
              {aiFeedback.executionScore}/10
            </div>
          </div>

          <div className="feedback-section">
            <h3>✅ Strengths</h3>
            <ul>
              {aiFeedback.strengths.map((strength, idx) => (
                <li key={idx}>{strength}</li>
              ))}
            </ul>
          </div>

          {aiFeedback.mistakes.length > 0 && (
            <div className="feedback-section mistakes">
              <h3>⚠️ Mistakes</h3>
              <ul>
                {aiFeedback.mistakes.map((mistake, idx) => (
                  <li key={idx}>{mistake}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="feedback-section suggestion">
            <h3>💡 Improvement Suggestion</h3>
            <p>{aiFeedback.suggestion}</p>
          </div>

          <div className="feedback-meta">
            <span><strong>Risk Assessment:</strong> {aiFeedback.riskAssessment}</span>
            <span><strong>Emotional State:</strong> {aiFeedback.emotionalState}</span>
          </div>

          <div className="redirect-message">
            Redirecting to trades list in 3 seconds...
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTrade;
