const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 1338; // Different port from Strapi

app.use(cors());
app.use(express.json());

// API endpoint to serve podcast data
app.get('/api/podcasts', (req, res) => {
  const db = new sqlite3.Database('./.tmp/data.db');

  db.all(`
    SELECT
      id,
      document_id as documentId,
      title,
      description,
      audio_url as audioUrl,
      publish_date as publishDate,
      duration,
      published_at as publishedAt
    FROM podcasts
    WHERE published_at IS NOT NULL
    ORDER BY publish_date DESC
  `, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        details: err.message
      });
    }

    // Format response to match Strapi's structure
    const data = rows.map(row => ({
      id: row.id,
      documentId: row.documentId,
      title: row.title,
      description: row.description,
      audioUrl: row.audioUrl,
      publishDate: row.publishDate,
      duration: row.duration,
      publishedAt: row.publishedAt,
    }));

    res.json({
      data: data,
      meta: {
        pagination: {
          page: 1,
          pageSize: data.length,
          pageCount: 1,
          total: data.length,
        },
      },
    });

    db.close();
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Simple API server is working!',
    timestamp: new Date().toISOString(),
    podcastCount: 1, // We know we have 1 podcast
  });
});

app.listen(PORT, () => {
  console.log(`Simple API server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`Podcasts endpoint: http://localhost:${PORT}/api/podcasts`);
});