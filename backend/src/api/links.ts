import express from 'express';
import axios from 'axios';
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

router.post('/', async (req, res) => {
  try {
    const { uri, userDid } = req.body;
    if (!uri || !userDid) {
      return res.status(400).json({ error: 'Missing uri or userDid in request body' });
    }


    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    // TODO Get the user's DID from the session

    // Prepare the record to be created
    const record = {
      $type: 'com.habitat.pouch.link',
      url: uri,
      createdAt: new Date().toISOString(),
    };

    // Make a request to the PDS to create the record
    try {
      const response = await axios.post(`https://${req.hostname}/xrpc/com.atproto.repo.createRecord`, {
        repo: userDid,
        collection: 'com.habitat.pouch.link',
        record: record,
      }, {
        headers: {
          // TODO just pass through the authorization from the frontend request to the PDS.
          'Authorization': req.headers.authorization,
        },
      });

      // If successful, return the created record
      res.status(201).json(response.data);
    } catch (error) {
      console.error('Error creating record in PDS:', error);
      res.status(500).json({ error: 'Failed to create record in PDS' });
    }

    await db.close();

  } catch (error) {
    console.error('Error adding tag:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




export default router;
