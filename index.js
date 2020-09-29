'use strict';

const fs = require('fs');
const { networkInterfaces } = require('os');
const path = require('path');

// If started through service, preloaded dotenv does not work.
if (!process.env.ZONE_ID) require('dotenv').config();

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

    // Create the Logs Directory
    if (!fs.existsSync(path.join(__dirname, 'logs/'))) fs.mkdirSync(path.join(__dirname, 'logs'));
    // Get last updated address, if any.
    if (!fs.existsSync(path.join(__dirname, 'last_address.txt'))) fs.writeFileSync(path.join(__dirname, 'last_address.txt'), '');
    const lastAddress = fs.readFileSync(path.join(__dirname, 'last_address.txt'), 'utf-8');

    // Keep a running log
    fs.appendFileSync(path.join(__dirname, "logs/running.log"), `${new Date().toISOString()} | Script Executed \n`);

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
    fs.appendFileSync(path.join(__dirname, "logs/update.log"), `${new Date().toISOString()} | Records Updated \n`);

    // Update Last Address
    fs.writeFileSync(path.join(__dirname, 'last_address.txt'), address);
  } catch (err) {
    fs.appendFileSync(path.join(__dirname, "logs/error.log"), `${new Date().toISOString()} | ${err.message} \n`);
  }
})();
