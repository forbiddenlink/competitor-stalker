-- Initial schema for competitor-stalker
-- Migration: 0001_initial

-- Competitors table - core competitor tracking
CREATE TABLE IF NOT EXISTS competitors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT,
    website TEXT NOT NULL,
    founded TEXT,
    size TEXT,
    location TEXT,
    one_liner TEXT,
    target_audience TEXT,
    estimated_revenue TEXT,
    key_people TEXT DEFAULT '[]',
    threat_level TEXT NOT NULL DEFAULT 'Low',
    position_x REAL,
    position_y REAL,
    features TEXT DEFAULT '{}',
    pricing_models TEXT DEFAULT '[]',
    social_handles TEXT,
    weaknesses TEXT DEFAULT '[]',
    strategies TEXT DEFAULT '[]',
    strengths TEXT DEFAULT '[]',
    opportunities TEXT DEFAULT '[]',
    threats TEXT DEFAULT '[]',
    sources TEXT DEFAULT '[]',
    notes TEXT DEFAULT '',
    last_reviewed TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Scrape results - raw data from competitor page scrapes
CREATE TABLE IF NOT EXISTS scrape_results (
    id TEXT PRIMARY KEY,
    competitor_id TEXT NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    pricing TEXT,
    features TEXT,
    h1 TEXT,
    h2s TEXT,
    social_links TEXT,
    tech_stack TEXT,
    cta_buttons TEXT,
    open_graph TEXT,
    scraped_at TEXT NOT NULL DEFAULT (datetime('now')),
    http_status INTEGER,
    error_message TEXT
);

-- Snapshots - historical competitor state for trend tracking
CREATE TABLE IF NOT EXISTS snapshots (
    id TEXT PRIMARY KEY,
    competitor_id TEXT NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'auto',
    label TEXT,
    data TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Alerts - notifications about competitor changes
CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    competitor_id TEXT NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    date TEXT NOT NULL DEFAULT (datetime('now'))
);

-- User profile/settings
CREATE TABLE IF NOT EXISTS user_profile (
    id TEXT PRIMARY KEY DEFAULT 'default',
    name TEXT NOT NULL DEFAULT 'My Company',
    position_x REAL DEFAULT 50,
    position_y REAL DEFAULT 50,
    features TEXT DEFAULT '{}',
    pricing_models TEXT DEFAULT '[]',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Scrape schedule - for cron job tracking
CREATE TABLE IF NOT EXISTS scrape_schedule (
    id TEXT PRIMARY KEY,
    competitor_id TEXT NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    frequency TEXT NOT NULL DEFAULT 'weekly',
    last_run TEXT,
    next_run TEXT,
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_scrape_results_competitor ON scrape_results(competitor_id);
CREATE INDEX IF NOT EXISTS idx_scrape_results_scraped_at ON scrape_results(scraped_at);
CREATE INDEX IF NOT EXISTS idx_snapshots_competitor ON snapshots(competitor_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_timestamp ON snapshots(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_competitor ON alerts(competitor_id);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_scrape_schedule_next_run ON scrape_schedule(next_run);
CREATE INDEX IF NOT EXISTS idx_scrape_schedule_enabled ON scrape_schedule(enabled);

-- Insert default user profile
INSERT OR IGNORE INTO user_profile (id, name) VALUES ('default', 'My Company');
