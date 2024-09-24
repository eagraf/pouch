import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { withDBConnection } from '../database/sqlite';

const router = express.Router();

type IngestResponse = {};

async function upsertLink(uri: string, tags: string[]) {

  // Temporary schema creation
  await withDBConnection(async (db) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS links (
        uri TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (uri)
      )
    `, [], function (err) {
      if (err) {
        console.error('Error creating links table:', err);
      }
    });

    // Create tags table
    console.log('Creating tags table');
    await db.run(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      )
    `, [], function (err) {
      if (err) {
        console.error('Error creating tags table:', err);
      }
    });

    // Create index on tag name
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name)
    `, [], function (err) {
      if (err) {
        console.error('Error creating index on tags:', err);
      }
    });

    // Create link_tags table for many-to-many relationship
    await db.run(`
      CREATE TABLE IF NOT EXISTS link_tags (
        link_uri TEXT,
        tag_id INTEGER,
        PRIMARY KEY (link_uri, tag_id),
        FOREIGN KEY (link_uri) REFERENCES links(uri),
        FOREIGN KEY (tag_id) REFERENCES tags(id)
      )
    `, [], function (err) {
      if (err) {
        console.error('Error creating link_tags table:', err);
      }
    });

    // Create indexes for link_tags table
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_link_tags_link_uri ON link_tags(link_uri)
    `, [], function (err) {
      if (err) {
        console.error('Error creating index on link_tags:', err);
      }
    });
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_link_tags_tag_id ON link_tags(tag_id)
    `, [], function (err) {
      if (err) {
        console.error('Error creating index on link_tags:', err);
      }
    });
  });

  await withDBConnection(async (db) => {
    db.run(`
      INSERT OR REPLACE INTO links (uri)
      VALUES (?) 
    `, [uri]);

    // Insert the appropriate link_tags and tags if they don't already exist
    if (tags) {
      for (const tag of tags) {
        await db.run(`
          INSERT OR IGNORE INTO tags (name)
          VALUES (?)
        `, [tag], function () { 
          const tagId = this.lastID;
          db.run(`
            INSERT OR IGNORE INTO link_tags (link_uri, tag_id)
            VALUES (?, ?)
          `, [uri, tagId]);
        });
      }
    }
  });

}

// Stub functions for database operations
async function upsertPostLikeLink(record: any) {
  // Check if the post has facets
  if (record.value && record.value.facets) {
    for (const facet of record.value.facets) {
      console.log('Facet:', facet);
      if (facet.features && facet.features.some((feature: any) => feature.$type === 'app.bsky.richtext.facet#link')) {
        const linkFeature = facet.features.find((feature: any) => feature.$type === 'app.bsky.richtext.facet#link');
        if (linkFeature) {
          await upsertLink(linkFeature.uri, []);
        }
      }
    }
  }
}

async function upsertExtensionSaveLink(linkRecord: any) {
  console.log('tags: ', linkRecord.value.tags);
  await upsertLink(linkRecord.value.url, linkRecord.value.tags);
}

function getRecordTypeFromURI(uri: string): string {
  // Remove the 'at://' prefix and split the remaining string by '/'
  const parts = uri.replace('at://', '').split('/');
  
  // Return the second element (index 1) if it exists, otherwise return an empty string
  return parts.length > 1 ? parts[1].trim() : '';
}

router.post<{}, IngestResponse>('/', (req, res) => {
  try {
    const { records } = req.body;

    // Validate the incoming records
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Invalid request body. Expected an array of ATProto records.' });
    }

    // Process each record in the array
    for (const atProtoRecord of records) {
      if (!atProtoRecord || !atProtoRecord.uri || !atProtoRecord.cid) {
        console.warn('Skipping invalid ATProto record:', atProtoRecord);
        continue;
      }

      // Parse the record type out of the uri
      const recordType = getRecordTypeFromURI(atProtoRecord.uri);
      console.log('Processing record type:', recordType);

      // Normalize and upsert data based on record type
      console.log('Upserting record: ', atProtoRecord);
      switch (recordType) {
        case 'app.bsky.feed.post':
          upsertPostLikeLink(atProtoRecord);
          break;
        case 'com.habitat.pouch.link':
          upsertExtensionSaveLink(atProtoRecord);
          break;
        case 'app.bsky.feed.like':
          // TODO: Implement like handling if needed
          break;
        default:
          console.warn('Unsupported record type:', recordType);
      }
    }

    res.status(200).json({ message: 'Record ingested successfully' });
  } catch (error) {
    console.error('Error ingesting record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/links', async (req, res) => {
  try {
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    const links = await db.all('SELECT * FROM links ORDER BY created_at DESC');
    await db.close();

    res.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
