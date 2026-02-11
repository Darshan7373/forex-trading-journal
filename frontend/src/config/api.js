/**
 * Centralized API Configuration
 * 
 * Uses environment variable REACT_APP_API_URL for production deployments
 * Falls back to localhost:5000/api for local development
 * 
 * Environment Setup:
 * - Local: REACT_APP_API_URL=http://localhost:5000/api (in .env)
 * - Production: Set REACT_APP_API_URL in Vercel dashboard
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default API_BASE_URL;
