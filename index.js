require('dotenv').config();
require('@babel/register')();
require('@babel/polyfill');
require('./src/server.js');
