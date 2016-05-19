'use strict';

const test = require('tape');
const parse = require('.');

const nl = '\x02\n';
const sep = '\x01';

test('simple', t => {
  t.plan(4);
  const p = parse();

  p.on('meta', m => {
    t.deepEqual(m, {
      columns: [{
        name: 'columnA',
        type: 'INT'
      }, {
        name: 'columnB',
        type: 'BIGINT'
      }],
      foo: 'bar',
      beep: 'boop'
    });
  });

  let i = 0;
  p.on('data', row => {
    if (!i++) t.deepEqual(row, ['valueAA', 'valueAB']);
    else t.deepEqual(row, ['valueBA', 'valueBB']);
  });

  p.on('end', () => t.ok(true));

  p.write(`##ignore this${nl}`);
  p.write(`#columnA${sep}columnB${nl}`);
  p.write(`#foo:bar${nl}`);
  p.write(`#beep:boop${nl}`);
  p.write(`#dbTypes:INT${sep}BIGINT${nl}`);
  p.write(`##ignore this as well${nl}`);
  p.write(`valueAA${sep}valueAB${nl}`);
  p.write(`valueBA${sep}valueBB${nl}`);
  p.end();
});
