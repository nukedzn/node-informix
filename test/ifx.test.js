/* jshint expr: true */

'use strict';

var expect = require( 'chai' ).expect;
var Ifx    = require( 'bindings' )( 'ifx' ).Ifx;


describe( 'ifx', function () {

	context( 'when username and password is not specified', function () {

		var ifx = new Ifx();

		/**
		*   Note: This test assumes the default user doesn't have permissions
		*         to connect to the database.
		*/
		it( 'should handle connection errors', function ( done ) {
			ifx.connect( {
				database : 'test',
				id : 'conn:id:1001'
			}, function ( err, conn ) {
				expect( err ).to.be.an.instanceof( Error );
				expect( err.message ).to.be.string( '[-951] Incorrect password or user %s is not known on the database server.' );
				expect( conn ).to.be.undefined;
				done();
			} );
		} );

	} );


	context( 'connect', function () {

		var ifx = new Ifx();

		it( 'should validate input arguments', function () {

			try {
				ifx.connect();
			} catch ( e ) {
				expect( e ).to.be.an.instanceof( Error );
				expect( e.message ).to.be.string( 'Invalid number of arguments' );
			}

			try {
				ifx.connect( 1, 2, 3 );
			} catch ( e ) {
				expect( e ).to.be.an.instanceof( Error );
				expect( e.message ).to.be.string( 'Invalid number of arguments' );
			}

			try {
				ifx.connect( 'value', function () {} );
			} catch ( e ) {
				expect( e ).to.be.an.instanceof( TypeError );
				expect( e.message ).to.be.string( 'Connection parameters must be an object' );
			}

			try {
				ifx.connect( {}, 'function' );
			} catch ( e ) {
				expect( e ).to.be.an.instanceof( TypeError );
				expect( e.message ).to.be.string( 'Callback must be a function' );
			}

			try {
				ifx.connect( {}, function () {} );
			} catch ( e ) {
				expect( e ).to.be.an.instanceof( TypeError );
				expect( e.message ).to.be.string( "Connection parameter 'id' and 'database' are mandatory" );
			}

		} );


		/**
		*   Note: This test assumes there is a 'test' database and a 'informix' user.
		*/
		it( 'should be able to connect to a database', function ( done ) {
			ifx.connect( {
				id : 'conn:id:2001',
				database : 'test',
				username : 'informix',
				password : 'informix'
			}, function ( err, conn ) {
				expect( err ).to.be.null;
				expect( conn ).to.be.string( 'conn:id:2001' );
				done();
			} );
		} );

	} );


	context( 'prepare', function () {

		var ifx  = new Ifx();
		var conn = 'conn:id:3001';

		before( function ( done ) {
			ifx.connect( {
				id : conn,
				database : 'test',
				username : 'informix',
				password : 'informix'
			}, function ( err, conn ) {
				done( err );
			} );
		} );


		it( 'should be able to prepare a statement', function ( done ) {

			var sql = 'select tabname from systables where tabname like ?;';

			ifx.prepare( conn, 'stmt:id:1001', sql, function ( err, sid ) {
				expect( err ).to.be.null;
				expect( sid ).to.be.string( 'stmt:id:1001' );
				done();
			} );

		} );

	} );

} );

