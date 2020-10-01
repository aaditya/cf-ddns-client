'use strict';

const fs = require('fs');
const { networkInterfaces } = require('os');
const path = require('path');
const publicIp = require('public-ip');

// If started through service, preloaded dotenv does not work.
if (!process.env.ZONE_ID) require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const fetchZones = require('./lib/cf_fetch');
const updateZone = require('./lib/cf_update');

/**
 * To-Do
 * 1. Add paginated requests in cloudflare fetch
 * 2. Limit Update requests to ease load on cf api
 */

(async () => {
  try {
    // Get current network info from system
    const nets = networkInterfaces();

    // Files
    const lastAddressFile = path.resolve(__dirname, 'last_address.txt');

    // Create the Logs Directory
    if (!fs.existsSync(path.join(__dirname, 'logs/'))) fs.mkdirSync(path.join(__dirname, 'logs'));
    // Get last updated address, if any.
    if (!fs.existsSync(lastAddressFile)) fs.writeFileSync(lastAddressFile, '');
    const lastAddress = fs.readFileSync(lastAddressFile, 'utf-8');

    // Get the exact IP Address, change line 20 to '24' if IPv4.
    let address;
    
    if(process.env.DNS_TYPE === "AAAA")
    {
      let networks = Object.values(nets).reduce((p, c) => p = p.concat(c), []);
      address = networks.find(n => !n.internal && n.cidr.split('/')[1] === '128').address;  
    }
    else if(process.env.DNS_TYPE === "A")
    {
      address = await publicIp.v4();
    }
    if (lastAddress === address) return;
    
    // Get DNS Records for Zone
    let cfZones = await fetchZones();
    let unchangedZones = cfZones.filter(zone => zone.ip !== address);

    // Initial Update for IP
    if (unchangedZones.length === 0 && lastAddress === '') fs.writeFileSync(lastAddressFile, address);
    // Complete if no changes
    if (unchangedZones.length === 0) return;

    // Only change non updated DNS Records
    await Promise.all(unchangedZones.map(zone => updateZone(zone.id, address)));
    fs.appendFileSync(path.join(__dirname, "logs/update.log"), `${new Date().toISOString()} | Records Updated \n`);

    // Update Last Address
    fs.writeFileSync(lastAddressFile, address);
  } catch (err) {
    fs.appendFileSync(path.join(__dirname, "logs/error.log"), `${new Date().toISOString()} | ${err.message} \n`);
  }
})();
