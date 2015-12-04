
'use strict';

var expect = require( 'chai' ).expect;

var Informix = require( '../lib/informix' );
var Connection = require( '../lib/connection' );


describe( 'lib/Informix', function () {

	var informix = {};

	beforeEach( function () {
		var opts = {
			database : 'test@ol_informix1210',
			username : 'informix',
			password : 'informix'
		};

		informix = new Informix( opts );
	} );


	it( 'should be able to connect to a database', function () {
		return informix.connect()
			.then( function ( conn ) {
				expect( conn ).to.be.an.instanceof( Connection );
			} );
	} );


	context( 'when a connection fails', function () {

		var opts = {
			database : 'dummy@ol_informix1210'
		};

		it( 'should emit an error object', function ( done ) {
			var ifx = new Informix( opts );

			ifx.on( 'error', function ( err ) {
				try {
					expect( err ).to.be.an.instanceof( Error );
				} catch ( e ) {
					return done( e );
				}

				done();
			} );

			ifx.connect()
				.then( function ( conn ) {
					done( new Error( 'Expected the connection to fail, but it did not!!!' ) );
				} );
		} );

	} );


	context( 'when connected to a database', function () {

		before( function () {
			return informix.connect();
		} );

		it( 'should be able to run a query', function () {
			return informix.query( 'select first 1 * from tcustomers;' )
				.catch( function ( err ) {
					expect( err ).to.be.an.instanceof( Error );
				} );
		} );

	} );

} );

