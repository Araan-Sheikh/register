const fs = require('fs');
const axios = require('axios');

const dnsFilePath = './dns_records.json';

const readDnsRecords = () => {
  const data = JSON.parse(fs.readFileSync(dnsFilePath, 'utf8'));
  return data.records;
};

const writeDnsRecords = (records) => {
  fs.writeFileSync(dnsFilePath, JSON.stringify({ records }, null, 2));
};

const updateDnsRecords = async (cloudflareConfig) => {
  const records = readDnsRecords();
  for (const record of records) {
    try {
      await axios.post(
        `https://api.cloudflare.com/client/v4/zones/${cloudflareConfig.CF_ZONE_ID}/dns_records`,
        {
          type: record.type,
          name: record.name,
          content: record.content,
          ttl: record.ttl || 3600,
          proxied: record.proxied || false,
        },
        {
          headers: {
            'X-Auth-Email': cloudflareConfig.CF_API_EMAIL,
            'X-Auth-Key': cloudflareConfig.CF_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error(`Failed to update record ${record.name}:`, error.response?.data || error.message);
    }
  }
};

module.exports = {
  readDnsRecords,
  writeDnsRecords,
  updateDnsRecords,
};
