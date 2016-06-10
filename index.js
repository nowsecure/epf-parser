'use strict';

const splitStream = require('binary-split');
const split = require('buffer-split');
const pipe = require('multipipe');
const bytes = require('bytes');
const Writable = require('stream').Writable;
const PassThrough = require('stream').PassThrough;

const pound = '#'.charCodeAt(0);
const dbTypes = Buffer('dbTypes');
const primaryKey = Buffer('primaryKey');
const rowDelim = Buffer('\x01');

module.exports = (cb) => {
  let meta = { columns: [], primaryKey: [] };
  let metaEmitted = false;
  const rows = PassThrough({ objectMode: true });

  const out = pipe(
    splitStream('\x02\n', {
      maxLength: bytes('1mb')
    }),
    Writable({
      objectMode: true,
      write: (line, _, done) => {
        if (line[0] == pound) {
          if (line[1] == pound) return done();

          line = line.slice(1);
          const idx = line.indexOf(':');
          if (idx > -1) {
            const key = line.slice(0, idx);
            const value = line.slice(idx+1, line.length);

            if (key.compare(dbTypes) === 0) {
              const types = split(value, rowDelim);
              for (let i = 0; i < types.length; i++) {
                meta.columns[i].type = types[i].toString();
              }
            } else if (key.compare(primaryKey) === 0) {
              const keys = split(value, rowDelim);
              for (let i = 0; i < keys.length; i++) {
                meta.primaryKey.push(keys[i].toString());
              }
            } else {
              meta[key.toString()] = value.toString();
            }
          } else {
            for (let name of split(line, rowDelim)) {
              meta.columns.push({ name: name.toString() });
            }
          }
          done();
        } else {
          if (!metaEmitted) {
            cb(meta, rows);
            metaEmitted = true;
          }

          const row = split(line, rowDelim).map(String);
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

