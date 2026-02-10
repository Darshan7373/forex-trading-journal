const bcrypt = require('bcryptjs');
const db = require('../config/database');

class User {
  /**
   * Create a new user
   */
  static async create({ email, password, name }) {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const query = `
      INSERT INTO users (email, password, name, created_at, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, email, name, default_risk_percentage, trading_goals, created_at, updated_at
    `;
    
    const result = await db.query(query, [email.toLowerCase(), hashedPassword, name]);
    return result.rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email.toLowerCase()]);
    return result.rows[0];
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const query = 'SELECT id, email, name, default_risk_percentage, trading_goals, created_at, updated_at FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Find user by ID with password (for authentication)
   */
  static async findByIdWithPassword(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Find user by email with password (for login)
   */
  static async findByEmailWithPassword(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email.toLowerCase()]);
    return result.rows[0];
  }

  /**
   * Update user
   */
  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'password' && updates[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return await User.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, name, default_risk_percentage, trading_goals, created_at, updated_at
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Compare password
   */
  static async comparePassword(candidatePassword, hashedPassword) {
    try {
      return await bcrypt.compare(candidatePassword, hashedPassword);
    } catch (error) {
      throw new Error('Password comparison failed');
    }
  }

  /**
   * Convert to public JSON (exclude password)
   */
  static toPublicJSON(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      defaultRiskPercentage: user.default_risk_percentage,
      tradingGoals: user.trading_goals,
      createdAt: user.created_at
    };
  }
}

module.exports = User;
