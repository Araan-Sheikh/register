const express = require('express');
const bodyParser = require('body-parser');
const { readDnsRecords, writeDnsRecords, updateDnsRecords } = require('./dnsManager');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Endpoint to get DNS records
app.get('/records', (req, res) => {
  const records = readDnsRecords();
  res.json(records);
});

// Endpoint to add a DNS record
app.post('/records', (req, res) => {
  const newRecord = req.body;

  // Basic validation
  if (!newRecord.type || !newRecord.name || !newRecord.content) {
    return res.status(400).json({ error: 'Missing required fields: type, name, content.' });
  }

  const records = readDnsRecords();
  records.push(newRecord);
  writeDnsRecords(records);
  res.status(201).json(newRecord);
});

// Endpoint to update DNS records with Cloudflare
app.post('/update', async (req, res) => {
  const cloudflareConfig = {
    CF_API_EMAIL: process.env.CF_API_EMAIL,
    CF_API_KEY: process.env.CF_API_KEY,
    CF_ZONE_ID: process.env.CF_ZONE_ID,
  };

  await updateDnsRecords(cloudflareConfig);
  res.json({ message: 'DNS records updated in Cloudflare.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
