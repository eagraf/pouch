import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    const links = await db.all('SELECT * FROM links ORDER BY created_at DESC');

    // Query links joined with link_tags and tags
    const linkTagsQuery = `
      SELECT l.uri, t.name AS tag_name
      FROM links l
      LEFT JOIN link_tags lt ON l.uri = lt.link_uri
      LEFT JOIN tags t ON lt.tag_id = t.id
    `;
    const linkTags = await db.all(linkTagsQuery);
    console.log('linkTags: ', linkTags);

    // Build a map of link URIs to tags
    const linkTagMap = new Map();
    linkTags.forEach(row => {
      if (!linkTagMap.has(row.uri)) {
        linkTagMap.set(row.uri, []);
      }
      if (row.tag_name) {
        linkTagMap.get(row.uri).push(row.tag_name);
      }
    });

    console.log('linkTagMap: ', linkTagMap);
    // Add tags to the original links data structure
    links.forEach(link => {
      link.tags = linkTagMap.get(link.uri) || [];
    });
    await db.close();
  
    res.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
