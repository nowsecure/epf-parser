'use strict';

const fs = require('fs');
const parse = require('.');

fs.createReadStream('/Users/julian/Downloads/itunes20160518/application')
  .pipe(parse())
  .on('meta', m => console.log('meta', m))
  .on('data', r => console.log('row', r));
