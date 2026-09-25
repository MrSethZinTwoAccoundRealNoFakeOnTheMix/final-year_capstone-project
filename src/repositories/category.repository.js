/**
 * Category Repository
 * Manages the dynamic categories table.
 */
const db = require('../db');

function findAll() {
  return db.prepare('SELECT id, name FROM categories ORDER BY name ASC').all();
}

function findByName(name) {
  return db.prepare('SELECT * FROM categories WHERE name = ?').get(name);
}

function findById(id) {
  return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
}

function create(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) throw new Error('Category name cannot be empty.');
  if (findByName(trimmed)) throw new Error(`Category "${trimmed}" already exists.`);
  const info = db.prepare('INSERT INTO categories (name) VALUES (?)').run(trimmed);
  return { id: info.lastInsertRowid, name: trimmed };
}

function remove(id) {
  const category = findById(id);
  if (!category) return { changes: 0 };
  const inUse = db.prepare(
    'SELECT 1 FROM products WHERE category = ? AND is_active = 1 LIMIT 1'
  ).get(category.name);
  if (inUse) {
    throw new Error('Cannot delete category — active products still use it. Archive or reassign products first.');
  }
  return db.prepare('DELETE FROM categories WHERE id = ?').run(id);
}

module.exports = { findAll, findByName, findById, create, remove };
