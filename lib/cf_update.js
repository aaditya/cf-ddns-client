const axios = require('axios');

async function updateZone(dns, address) {
  const url = `https://api.cloudflare.com/client/v4/zones/${process.env.ZONE_ID}/dns_records/${dns}`;
  
  const headers = {
    "x-auth-email": process.env.API_EMAIL,
    "x-auth-key": process.env.API_KEY
  }
  
  const body = {
    "type": process.env.DNS_TYPE,
    "content": address,
    "proxied": true
  }
  
  await axios.put(url, body, { headers });

  return true;
}

module.exports = updateZone;