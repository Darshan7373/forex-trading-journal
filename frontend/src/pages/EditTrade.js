import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tradeAPI } from '../services/api';
import { toast } from 'react-toastify';

const EditTrade = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    loadTrade();
  }, [id]);

  const loadTrade = async () => {
    try {
      const response = await tradeAPI.getById(id);
      setFormData({
        ...response.data.trade,
        date: response.data.trade.date.split('T')[0]
      });
    } catch (error) {
      toast.error('Failed to load trade');
      navigate('/trades');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await tradeAPI.update(id, formData);
      toast.success('Trade updated successfully');
      navigate('/trades');
    } catch (error) {
      toast.error('Failed to update trade');
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div>
      <h1>Edit Trade</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
        {/* Reuse form fields from AddTrade */}
        <div className="form-group">
          <label>Outcome</label>
          <select 
            value={formData.outcome} 
            onChange={(e) => setFormData({...formData, outcome: e.target.value})}
          >
            <option value="Win">Win</option>
            <option value="Loss">Loss</option>
            <option value="BE">Break Even</option>
          </select>
        </div>
        <div className="form-group">
          <label>Pips</label>
          <input 
            type="number" 
            step="0.1"
            value={formData.pips} 
            onChange={(e) => setFormData({...formData, pips: e.target.value})}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Trade'}
          </button>
          <button type="button" onClick={() => navigate('/trades')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTrade;
