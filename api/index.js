'use strict';
/* Vercel serverless entry: Vercel calls this handler with every request,
   and it forwards them to the Express app in ../server.js. */
const app = require('../server');

module.exports = (req, res) => app(req, res);
