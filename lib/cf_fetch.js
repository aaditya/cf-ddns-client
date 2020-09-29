const axios = require('axios');

async function fetchZone() {
  const url = `https://api.cloudflare.com/client/v4/zones/${process.env.ZONE_ID}/dns_records`;

  const headers = {
    "x-auth-email": process.env.API_EMAIL,
    "x-auth-key": process.env.API_KEY
  }

  const params = {
    "type": process.env.DNS_TYPE,
    "per_page": 100
  }

  const { data } = await axios.get(url, { headers, params });

  // data -> paginated, 100 per page, { result_info: { page: 1, per_page: 20, count: 1, total_count: 1, total_pages: 1 } }

  return data.result.map(({ id, name, content: ip, proxied }) => ({ id, name, ip, proxied }));
}

module.exports = fetchZone;