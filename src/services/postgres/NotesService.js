const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const mapDBToModel = require('../../utils');

class NotesService {
  constructor() {
    this._pool = new Pool();
  }

  async addNote({ title, body, tags }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const stmt = {
      text: 'INSERT INTO notes VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, title, body, tags, createdAt, updatedAt],
    };

    const result = await this._pool.query(stmt);

    if (!result.rows[0].id) {
      throw new InvariantError('Catatan gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getNotes() {
    const stmt = 'SELECT * FROM notes';

    const result = await this._pool.query(stmt);

    return result.rows.map(mapDBToModel);
  }

  async getNoteById(id) {
    const stmt = {
      text: 'SELECT * FROM notes WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(stmt);

    if (!result.rows.length) {
      throw NotFoundError('Caatan tidak ditemukan');
    }

    return result.rows.map(mapDBToModel)[0];
  }

  async editNoteById(id, { title, body, tags }) {
    const updatedAt = new Date().toISOString();
    const stmt = {
      text: 'UPDATE notes SET title = $1, body = $2, tags = $3, updated_at = $4 WHERE id = $5 returning id',
      values: [title, body, tags, updatedAt, id],
    };

    const result = await this._pool.query(stmt);

    if (!result.rows.length) {
      throw new NotFoundError('Catatan gagal diperbarui. Id tidak ditemukan');
    }
  }

  async deleteNoteById(id) {
    const stmt = {
      text: 'DELETE FROM notes WHERE id = $1 returning id',
      values: [id],
    };

    const result = await this._pool.query(stmt);

    if (!result.rows.length) {
      throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = NotesService;
