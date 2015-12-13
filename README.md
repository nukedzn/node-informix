node-informix
=============

[![Join the chat at https://gitter.im/nukedzn/node-informix](https://nukedzn.github.io/badges/gitter.svg)](https://gitter.im/nukedzn/node-informix?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![npm version](https://img.shields.io/npm/v/informix.svg)](https://www.npmjs.com/package/informix)
[![wercker status](https://app.wercker.com/status/6f7f1a8246881c3d98acec4875280c54/s/master "wercker status")](https://app.wercker.com/project/bykey/6f7f1a8246881c3d98acec4875280c54)
[![codecov.io](https://codecov.io/github/nukedzn/node-informix/coverage.svg?branch=master)](https://codecov.io/github/nukedzn/node-informix?branch=master)
[![Coverage Status](https://coveralls.io/repos/nukedzn/node-informix/badge.svg?branch=master&service=github)](https://coveralls.io/github/nukedzn/node-informix?branch=master)
[![Dependency Status](https://david-dm.org/nukedzn/node-informix.svg)](https://david-dm.org/nukedzn/node-informix)
[![devDependency Status](https://david-dm.org/nukedzn/node-informix/dev-status.svg)](https://david-dm.org/nukedzn/node-informix#info=devDependencies)

A node.js native client for IBM Informix.


## Features

* Developer friendly ES6 Promise based API
* Transparent connections with lazy connect
* Connection pooling
* Prepared Statements



## Dependencies

* [IBM Informix ESQL/C](http://www-03.ibm.com/software/products/en/esqlc) which
can be installed using [IBM Informix CSDK](http://www-03.ibm.com/software/products/en/csdk).
* A compiler with C++11 standards support (e.g. `g++ v4.8`).



### Environment variables

* [INFORMIXDIR](https://www-01.ibm.com/support/knowledgecenter/SSGU8G_12.1.0/com.ibm.sqlr.doc/ids_sqr_264.htm) -
(e.g. `INFORMIXDIR=/opt/informix`)
* [INFORMIXSERVER](https://www-01.ibm.com/support/knowledgecenter/SSGU8G_12.1.0/com.ibm.sqlr.doc/ids_sqr_266.htm) -
(e.g. `INFORMIXSERVER=ol_informix1210`)
* [INFORMIXSQLHOSTS](https://www-01.ibm.com/support/knowledgecenter/SSGU8G_12.1.0/com.ibm.sqlr.doc/ids_sqr_268.htm)
* `PATH` to include `${INFORMIXDIR}/bin` - (e.g. `export PATH="${INFORMIXDIR}/bin:${PATH}"`)
* `LD_LIBRARY_PATH` to include ESQL/C shared libraries -
(e.g. `export LD_LIBRARY_PATH="${INFORMIXDIR}/lib:${INFORMIXDIR}/lib/esql:${LD_LIBRARY_PATH}"`)


### Debian/Ubuntu

You'll need to patch `${INFORMIXDIR}/bin/esql` on Debian based systems.
e.g.
``` bash
$ cat esql-4.10.debian.patch | patch ${INFORMIXDIR}/bin/esql
```



## Installation

``` bash
$ npm install --save informix
```



## Usage

```js
var opts = {
	database : 'test@ol_informix1210',
	username : 'rockstar',
	password : 'secret'
};

var informix = require( 'informix' )( opts );
```

```js
var Informix = require( 'informix' ).Informix;
var informix = new Informix( { database : 'test@ol_informix1210' } );
```

```js
informix
	.query( "select tabname from systables where tabname like 'sys%auth';" )
	.then( function ( cursor ) {
		return cursor.fetchAll( { close : true } );
	} )
	.then( function ( results ) {
		console.log( 'results:', results );
	} )
	.catch( function ( err ) {
		console.log( err );
	} );
```



## API Documentation

JSDoc generated API documentation can be found at [http://nukedzn.github.io/node-informix/docs/](http://nukedzn.github.io/node-informix/docs/).



## Contributing

Contributions are welcome through GitHub pull requests ([using fork & pull model](https://help.github.com/articles/using-pull-requests/#fork--pull)).

