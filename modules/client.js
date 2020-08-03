'use strict';
const pg = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('Missing database URL');
}

const client = new pg.Client(process.env.DATABASE_URL)
client.on('error', err => { throw err; });

module.exports = client;