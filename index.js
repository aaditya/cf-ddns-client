'use strict';

const fs = require('fs');
const { networkInterfaces } = require('os');

const fetchZones = require('./lib/cf_fetch');
const updateZone = require('./lib/cf_update');

/**
 * To-Do
 * 1. Add paginated requests in cloudflare fetch
 * 2. Limit Update requests to ease load on cf api
 */

async function refreshDNS() {
  try {
    // Get current network info from system
    const nets = networkInterfaces();

    // Get last updated address, if any.
    if (!fs.existsSync('./last_address.txt')) fs.writeFileSync('last_address.txt', '');
    const lastAddress = fs.readFileSync('last_address.txt', 'utf-8');

    // Get the exact IP Address, change line 20 to '24' if IPv4.
    let networks = Object.values(nets).reduce((p, c) => p = p.concat(c), []);
    let { address } = networks.find(n => !n.internal && n.cidr.split('/')[1] === '128');

    if (lastAddress === address) return;

    // Get DNS Records for Zone
    let cfZones = await fetchZones();
    let unchangedZones = cfZones.filter(zone => zone.ip !== address);

    // Initial Update for IP
    if (unchangedZones.length === 0 && lastAddress === '') fs.writeFileSync('last_address.txt', address);
    // Complete if no changes
    if (unchangedZones.length === 0) return;

    // Only change non updated DNS Records
    await Promise.allSettled(unchangedZones.map(zone => updateZone(zone.id, address)));
    console.log(new Date(), "Records Updated");
    
    // Update Last Address
    fs.writeFileSync('last_address.txt', address);
  } catch (err) {
    console.log(err.message);
  }
}

// Run every 15 minutes
setInterval(refreshDNS, 900000);
