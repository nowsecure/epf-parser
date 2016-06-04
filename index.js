'use strict';

const split = require('split2');
const pipe = require('multipipe');
const bytes = require('bytes');
const { Writable, PassThrough } = require('stream');

module.exports = (cb) => {
  let meta = { columns: [] };
  let metaEmitted = false;
  const rows = PassThrough({ objectMode: true });

  const out = pipe(
    split(/\x02\n/, {
      maxLength: bytes('1mb')
    }),
    Writable({
      objectMode: true,
      write: (line, _, done) => {
        if (/^##/.test(line)) return done();
        if (/^#/.test(line)) {
          line = line.slice(1);
          if (/:/.test(line)) {
            const [ key, value ] = line.split(':');
            if (key == 'dbTypes') {
              const types = value.split(/\x01/);
              for (let i = 0; i < types.length; i++) {
                meta.columns[i].type = types[i];
              }
            } else if (key == 'primaryKey') {
              meta.primaryKey = value.split(/\x01/);
            } else {
              meta[key] = value;
            }
          } else {
            for (let name of line.split(/\x01/)) {
              meta.columns.push({ name: name });
            }
          }
          done();
        } else {
          if (!metaEmitted) {
            cb(meta, rows);
            metaEmitted = true;
          }

          const row = line.split(/\x01/);
          row.raw = line;
          rows.push(row);
          done();
        }
      }
    }).on('finish', () => {
      if (!metaEmitted) cb(meta, rows);
      rows.push(null);
    })
  );

  return out;
};

