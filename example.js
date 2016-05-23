'use strict';

const fs = require('fs');
const parse = require('.');

fs.createReadStream('/Users/julian/Downloads/itunes20160518/application')
  .pipe(parse((meta, rows) => {
    console.log('meta', meta);
    rows.on('data', r => console.log('row', r));
  }));
