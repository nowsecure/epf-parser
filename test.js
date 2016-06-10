'use strict';

const test = require('tape');
const parse = require('.');

const nl = '\x02\n';
const sep = '\x01';

test('simple', t => {
  t.plan(6);

  const p = parse((meta, rows) => {
    t.deepEqual(meta, {
      columns: [{
        name: 'columnA',
        type: 'INT'
      }, {
        name: 'columnB',
        type: 'BIGINT'
      }],
      foo: 'bar',
      beep: 'boop',
      primaryKey: []
    });

    let i = 0;
    rows.on('data', row => {
      t.ok(row.raw);
      delete row.raw;
      if (!i++) t.deepEqual(row, ['valueAA', 'valueAB']);
      else t.deepEqual(row, ['valueBA', 'valueBB']);
    });

    rows.on('end', () => t.ok(true));
  });

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

test('no rows', t => {
  t.plan(2);

  const p = parse((meta, rows) => {
    t.deepEqual(meta, {
      columns: [{
        name: 'columnA',
        type: 'INT'
      }, {
        name: 'columnB',
        type: 'BIGINT'
      }],
      primaryKey: []
    });

    rows.on('data', row => t.fail());
    rows.on('end', () => t.ok(true));
  });

  p.write(`#columnA${sep}columnB${nl}`);
  p.write(`#dbTypes:INT${sep}BIGINT${nl}`);
  p.end();
});

test('single primary key', t => {
  t.plan(2);

  const p = parse((meta, rows) => {
    t.deepEqual(meta, {
      columns: [],
      primaryKey: ['foo']
    });

    rows.on('data', row => t.fail());
    rows.on('end', () => t.ok(true));
  });

  p.write(`#primaryKey:foo${nl}`);
  p.end();
});

test('compound primary key', t => {
  t.plan(2);

  const p = parse((meta, rows) => {
    t.deepEqual(meta, {
      columns: [],
      primaryKey: ['foo', 'bar']
    });

    rows.on('data', row => t.fail());
    rows.on('end', () => t.ok(true));
  });

  p.write(`#primaryKey:foo${sep}bar${nl}`);
  p.end();
});
