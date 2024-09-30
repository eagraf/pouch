import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const router = express.Router();

router.post('/', async (req, res) => {
  // TODO: validate uri
  try {
    const { uri, tag } = req.body;

    if (!uri || !tag) {
      return res.status(400).json({ error: 'Missing uri or tag in request body' });
    }

    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });


    // Insert the tag if it doesn't exist
    await db.run(`
    INSERT OR IGNORE INTO tags (name)
    VALUES (?)
    `, [tag]);

    // Get the tag ID
    const tagRow = await db.get(`
    SELECT id FROM tags WHERE name = ?
    `, [tag]);

    if (!tagRow) {
      throw new Error('Failed to insert or retrieve tag');
    }

    // Insert the link-tag relationship
    await db.run(`
    INSERT OR IGNORE INTO link_tags (link_uri, tag_id)
    VALUES (?, ?)
    `, [uri, tagRow.id]);


    res.status(200).json({ message: 'Tag added successfully' });
  } catch (error) {
    console.error('Error adding tag:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
