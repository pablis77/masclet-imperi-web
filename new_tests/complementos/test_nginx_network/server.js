// Simple Express server para simular el servidor Node.js
const express = require('express');
const app = express();
const port = 10000;

app.use(express.static(__dirname));

app.get('/api/test', (req, res) => {
  res.json({ status: 'success', message: 'Node.js API test endpoint' });
});

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
