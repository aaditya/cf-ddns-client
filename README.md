# Cloudflare DDNS

A simple DDNS Client to update Cloudflare Zone records. Runs every 15 minutes.
You can configure it through forever to run it.

## Setup

* Create a file `.env` in the root directory with content as follows:

```env
ZONE_ID=<cloudflare_zone_id>
API_KEY=<cloudflare_api_key>
API_EMAIL=<cloudflare_email>
```

## Running

> `npm run start-local`
