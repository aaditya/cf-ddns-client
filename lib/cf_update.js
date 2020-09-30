const axios = require('axios');

async function updateZone(dns, address) {
  const url = `https://api.cloudflare.com/client/v4/zones/${process.env.ZONE_ID}/dns_records/${dns}`;
  
  const headers = {
    "x-auth-email": process.env.API_EMAIL,
    "x-auth-key": process.env.API_KEY
  }
  
  const body = {
    "content": address
  }
  
  await axios.patch(url, body, { headers });

  return true;
}

module.exports = updateZone;