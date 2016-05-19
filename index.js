'use strict';

const split = require('split2');
const pipe = require('multipipe');
const through = require('through2').obj;
const bytes = require('bytes');

module.exports = () => {
  let meta = { columns: [] };
  let metaEmitted = false;

  const out = pipe(
    split(/\x02\n/, {
      maxLength: bytes('1mb')
    }),
    through((line, _, cb) => {
      if (/^##/.test(line)) return cb();
      if (/^#/.test(line)) {
        line = line.slice(1);
        if (/:/.test(line)) {
          const [ key, value ] = line.split(':');
          if (key == 'dbTypes') {
            const types = value.split(/\x01/);
            for (let i = 0; i < types.length; i++) {
              meta.columns[i].type = types[i];
            }
          } else {
            meta[key] = value;
          }
        } else {
          for (let name of line.split(/\x01/)) {
            meta.columns.push({ name: name });
          }
        }
        cb();
      } else {
        if (!metaEmitted) {
          out.emit('meta', meta);
          metaEmitted = true;
        }

        cb(null, line.split(/\x01/));
      }
    })
  );

  return out;
};

