const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 1338; // Different port from Strapi

app.use(cors());
app.use(express.json());

// Simple API to serve podcast data
app.get('/api/podcasts', (req, res) => {
  const db = new sqlite3.Database('./.tmp/data.db');

  db.all(`
    SELECT
      p.id,
      p.document_id,
      p.title,
      p.description,
      p.audio_url,
      p.publish_date,
      p.duration,
      p.published_at
    FROM podcasts p
    WHERE p.published_at IS NOT NULL
    ORDER BY p.publish_date DESC
  `, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Format the response to match Strapi's format
    const data = rows.map(row => ({
      id: row.id,
      documentId: row.document_id,
      title: row.title,
      description: row.description,
      audioUrl: row.audio_url,
      publishDate: row.publish_date,
      duration: row.duration,
      publishedAt: row.published_at,
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

app.listen(PORT, () => {
  console.log(`Simple API server running on port ${PORT}`);
});