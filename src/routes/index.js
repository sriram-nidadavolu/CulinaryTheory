const express = require('express');
const response = require('../helpers/response');
const routes  = express.Router();
const api = require('./api');
const ui = require('./ui');

routes.use(response.setHeadersForCORS);

routes.use('/api', api);
routes.use('/', ui);

module.exports = routes;
