
'use strict';

var expect = require( 'chai' ).expect;

var Informix   = require( '../lib/informix' );
var Statement  = require( '../lib/statement' );
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

	it( 'should use lazy auto connect', function () {
		var informix = new Informix( opts );
		expect( informix._$ ).to.not.to.have.property( 'conn' );

		return informix.query( 'select count(*) from tcustomers;' )
			.then( function ( cursor ) {
				expect( informix._$.conn ).to.be.an.instanceof( Connection );
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

		it( 'should emit an error object on auto connect', function ( done ) {
			var informix = new Informix( opts );
			informix.connect()
				.then( function ( conn ) {
					done( new Error( 'Expected the connection to fail, but it did not!!!' ) );
				} )
				.catch( function ( err ) {

					informix.on( 'error', function ( err ) {
						try {
							expect( err ).to.be.an.instanceof( Error );
						} catch ( e ) {
							return done( e );
						}

						done();
					} );

					informix.query( 'select count(*) from tcustomers;' )
						.then( function ( cursor ) {
							done( new Error( 'Expected to fail, but it did not!!!' ) );
						} );
				} );
		} );

	} );


	context( 'when a connection is in a failed state', function () {

		var informix = {};

		beforeEach( function () {
			informix = new Informix( { database : 'dummy@ol_informix1210' } );

			return informix.connect( { silent : true } )
				.then( function ( conn ) {
					throw new Error( 'Expected to fail, but it did not!!!' );
				} )
				.catch( function ( err ) {
					expect( err.message ).to.be.string( '[-329] Database not found or no system permission.' );
				} );
		} );


		it( 'should honor silent=false', function ( done ) {
			informix.on( 'error', function ( err ) {
				try {
					expect( err ).to.be.an.instanceof( Error );
				} catch ( e ) {
					return done( e );
				}

				done();
			} );

			informix.connect( { silent : false } )
				.then( function ( conn ) {
					done( new Error( 'Expected to fail, but it did not!!!' ) );
				} );
		} );

		it( 'should emit an error object when preparing a statement', function ( done ) {
			informix.on( 'error', function ( err ) {
				try {
					expect( err ).to.be.an.instanceof( Error );
				} catch ( e ) {
					return done( e );
				}

				done();
			} );

			informix.prepare( 'select count(*) from tcustomers;' )
				.then( function ( stmt ) {
					done( new Error( 'Expected to fail, but it did not!!!' ) );
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

		it( 'should be able to prepare a query', function () {
			return informix.prepare( 'select count(*) from tcustomers where id > ?;' )
				.then( function ( stmt ) {
					expect( stmt ).to.be.an.instanceof( Statement );
					return stmt.free();
				} );
		} );

	} );

} );

