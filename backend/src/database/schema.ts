import { withDBConnection } from './sqlite';

export function setupDatabase() {
  withDBConnection(async (db) => {
    try {
      db.run(`
    CREATE TABLE IF NOT EXISTS links (
        uri TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (uri)
    )
    `, []); 

      // Create tags table
      console.log('Creating tags table');
      await db.run(`
      CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL
      )
      `, []); 

      // Create index on tag name
      await db.run(`
      CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name)
      `, []); 

      // Create link_tags table for many-to-many relationship
      await db.run(`
      CREATE TABLE IF NOT EXISTS link_tags (
          link_uri TEXT,
          tag_id INTEGER,
          PRIMARY KEY (link_uri, tag_id),
          FOREIGN KEY (link_uri) REFERENCES links(uri),
          FOREIGN KEY (tag_id) REFERENCES tags(id)
      )`, []); 
      // Create indexes for link_tags table
      await db.run(`
      CREATE INDEX IF NOT EXISTS idx_link_tags_link_uri ON link_tags(link_uri)
      `, []); 
      await db.run(`
      CREATE INDEX IF NOT EXISTS idx_link_tags_tag_id ON link_tags(tag_id)
     `, []); 
    } catch (error) {
      console.error('Error setting up database', error);
    }
  });
}