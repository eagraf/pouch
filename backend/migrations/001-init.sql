--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS links (
    uri TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (uri)
);

CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS link_tags (
    link_uri TEXT,
    tag_id INTEGER,
    PRIMARY KEY (link_uri, tag_id),
    FOREIGN KEY (link_uri) REFERENCES links(uri),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);

CREATE INDEX IF NOT EXISTS idx_link_tags_link_uri ON link_tags(link_uri);

CREATE INDEX IF NOT EXISTS idx_link_tags_tag_id ON link_tags(tag_id);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------
DROP TABLE IF EXISTS link_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS links;
