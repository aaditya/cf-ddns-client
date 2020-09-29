# Cloudflare DDNS

A simple Script to update Cloudflare Zone records. Run it with cron or as a service via third party libraries.

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

> `npm i`

> `npm start`
