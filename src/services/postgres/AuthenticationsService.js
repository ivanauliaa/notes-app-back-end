const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class AuthenticationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addRefreshToken(token) {
    const stmt = {
      text: 'INSERT INTO authentications VALUES ($1)',
      values: [token],
    };

    await this._pool.query(stmt);
  }

  async verifyRefreshToken({ refreshToken }) {
    const stmt = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [refreshToken],
    };

    const result = await this._pool.query(stmt);

    if (!result.rows.length) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  async deleteRefreshToken(token) {
    const stmt = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };

    await this._pool.query(stmt);
  }
}

module.exports = AuthenticationsService;
