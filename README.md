# Cloudflare DDNS

A simple DDNS Client to update Cloudflare Zone records. Runs every 15 minutes. You can configure it through forever to run it.

> Set `DNS_TYPE` to `AAAA` for IPv6 or `A` for IPv4. 

## Setup

* Create a file `.env` in the root directory with content as follows:

```env
API_EMAIL=<cloudflare_email>
API_KEY=<cloudflare_api_key>
DNS_TYPE=AAAA
ZONE_ID=<cloudflare_zone_id>
```

## Running

> `npm run start-local`
