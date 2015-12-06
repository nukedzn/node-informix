
'use strict';

var expect = require( 'chai' ).expect;
var Ifx    = require( '../' ).Ifx;

var Connection = require( '../lib/connection' );
var Statement  = require( '../lib/statement' );


describe( 'lib/Connection', function () {

	context( 'when connecting to a database', function () {

		var conn = {};
		beforeEach( function () {
			conn = new Connection( new Ifx() );
		} );


		it( 'should resolve the promise upon success', function () {
			var params = {
				database : 'test@ol_informix1210',
				username : 'informix',
				password : 'informix'
			};

			return conn.connect( params )
				.then( function ( c ) {
					expect( c ).to.be.an.instanceof( Connection );
				} );
		} );

		it( 'should reject the the promise upon failure', function () {
			var params = {
				database : 'dummy@ol_informix1210',
				username : 'informix',
				password : 'informix'
			};

			return conn.connect( params )
				.then( function ( c ) {
					throw new Error( 'Expected the connection to fail, but it did not!!!' );
				} )
				.catch( function ( err ) {
					expect( err ).to.be.an.instanceof( Error );
					expect( err.message ).to.be.string( '[-329] Database not found or no system permission.' );
				} );
		} );

		it( 'should set the INFORMIXSERVER environment variable', function () {
			var params = {
				database : 'test@ol_informix1210',
				username : 'informix',
				password : 'informix'
			};

			process.env.INFORMIXSERVER = 'dummy';
			return conn.connect( params )
				.then( function ( c ) {
					expect( process.env.INFORMIXSERVER ).to.be.string( 'ol_informix1210' );
				} );
		} );

	} );


	context( 'when connected to a database', function () {

		var conn = {};
		before( function () {
			conn = new Connection( new Ifx() );
			return conn.connect( {
				database : 'test@ol_informix1210',
				username : 'informix',
				password : 'informix'
			} );
		} );

		it( 'should be able to prepare a statement', function () {
			var sql = 'select tabname from systables where tabname like ?;';
			return conn.prepare( sql )
				.then( function ( stmt ) {
					expect( stmt ).to.be.an.instanceof( Statement );
				} );
		} );

	} );

} );

