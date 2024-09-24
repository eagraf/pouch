import express from 'express';

import MessageResponse from '../interfaces/MessageResponse';
import emojis from './emojis';
import ingest from './ingest';
import links from './links';

const router = express.Router();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/emojis', emojis);
router.use('/emoji', emojis);
router.use('/ingest', ingest);
router.use('/links', links);

export default router;
