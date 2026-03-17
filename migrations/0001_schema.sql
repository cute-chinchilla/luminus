-- Initial Database Schema

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clerk_id TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' NOT NULL,
  agreed_terms INTEGER DEFAULT 0 NOT NULL,
  agreed_privacy INTEGER DEFAULT 0 NOT NULL,
  is_active INTEGER DEFAULT 1 NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS hero_slides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT NOT NULL,
  subtitle TEXT DEFAULT '' NOT NULL,
  title TEXT DEFAULT '' NOT NULL,
  description TEXT DEFAULT '' NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  is_active INTEGER DEFAULT 1 NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS doctors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  title TEXT DEFAULT '원장' NOT NULL,
  image_url TEXT DEFAULT '' NOT NULL,
  specialty TEXT DEFAULT '' NOT NULL,
  credentials TEXT DEFAULT '[]' NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  is_active INTEGER DEFAULT 1 NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS promotion_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  is_active INTEGER DEFAULT 1 NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS promotions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '' NOT NULL,
  price INTEGER NOT NULL,
  original_price INTEGER DEFAULT 0 NOT NULL,
  discount_percent INTEGER DEFAULT 0 NOT NULL,
  badge_text TEXT DEFAULT '' NOT NULL,
  extra_note TEXT DEFAULT '' NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  is_active INTEGER DEFAULT 1 NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (category_id) REFERENCES promotion_categories(id)
);

CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  booking_date TEXT NOT NULL,
  booking_time TEXT DEFAULT '' NOT NULL,
  booking_content TEXT DEFAULT '' NOT NULL,
  items_json TEXT DEFAULT '[]' NOT NULL,
  total_price INTEGER DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  memo TEXT DEFAULT '' NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role, is_active);
CREATE INDEX IF NOT EXISTS idx_hero_slides_active_order ON hero_slides(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_doctors_active_order ON doctors(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_promo_cat_active_order ON promotion_categories(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_promotions_cat_active ON promotions(category_id, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status, created_at);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(booking_date);
