
'use strict';

var expect = require( 'chai' ).expect;

var Informix   = require( '../lib/informix' );
var Connection = require( '../lib/connection' );
var Cursor     = require( '../lib/cursor' );


describe( 'lib/Informix', function () {

	var opts = {
		database : 'test@ol_informix1210',
		username : 'informix',
		password : 'informix'
	};


	it( 'should be able to connect to a database', function () {
		var informix = new Informix( opts );
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
			var informix = new Informix( opts );

			informix.on( 'error', function ( err ) {
				try {
					expect( err ).to.be.an.instanceof( Error );
				} catch ( e ) {
					return done( e );
				}

				done();
			} );

			informix.connect()
				.then( function ( conn ) {
					done( new Error( 'Expected the connection to fail, but it did not!!!' ) );
				} );
		} );

	} );


	context( 'when connected to a database', function () {

		var informix = new Informix( opts );
		before( function () {
			return informix.connect();
		} );

		it( 'should be able to run a query', function () {
			return informix.query( 'select first 1 * from tcustomers;' )
				.then( function ( cursor ) {
					expect( cursor ).to.be.an.instanceof( Cursor );
					return cursor.close();
				} );
		} );

	} );

} );

