
# epf-parser

Parse [iTunes Enterprise Partner Feeds](https://affiliate.itunes.apple.com/resources/documentation/itunes-enterprise-partner-feed/).

## Usage

```js
'use strict';

const fs = require('fs');
const parse = require('epf-parser');

fs.createReadStream('/tmp/application')
  .pipe(parse((meta, rows) => {
    console.log('meta', meta);
    rows.on('data', row => console.log('row', row));
  }));
```

Will call back with `meta` like this, with all the meta k/v pairs in one object, and columns and column types merged:

```js
meta { columns:
   [ { name: 'export_date', type: 'BIGINT' },
     { name: 'application_id', type: 'INTEGER' },
     { name: 'title', type: 'VARCHAR(1000)' },
     { name: 'recommended_age', type: 'VARCHAR(20)' },
     { name: 'artist_name', type: 'VARCHAR(1000)' },
     { name: 'seller_name', type: 'VARCHAR(1000)' },
     { name: 'company_url', type: 'VARCHAR(1000)' },
     { name: 'support_url', type: 'VARCHAR(1000)' },
     { name: 'view_url', type: 'VARCHAR(1000)' },
     { name: 'artwork_url_large', type: 'VARCHAR(1000)' },
     { name: 'artwork_url_small', type: 'VARCHAR(1000)' },
     { name: 'itunes_release_date', type: 'DATETIME' },
     { name: 'copyright', type: 'VARCHAR(4000)' },
     { name: 'description', type: 'LONGTEXT' },
     { name: 'version', type: 'VARCHAR(100)' },
     { name: 'itunes_version', type: 'VARCHAR(100)' },
     { name: 'download_size', type: 'BIGINT' } ],
  primaryKey: 'application_id',
  exportMode: 'INCREMENTAL' }
```

Will emit rows as `data` events like this (real data hidden for reasons):

```
row [ 'some string',
  'some string',
  'some string',
  'some string',
  'some string',
  'some string',
  'some string',
  'some string',
  'some string',
  'some string',
  'some string',
  'some string',
  'some string',
  'some string',
  'some string',
  'some string',
  'some string' ]
```

## License

  MIT
