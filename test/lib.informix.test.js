
'use strict';

var expect = require( 'chai' ).expect;
var sinon  = require( 'sinon' );

var Informix   = require( '../lib/informix' );
var Statement  = require( '../lib/statement' );
var Cursor     = require( '../lib/cursor' );
var pool       = require( '../lib/pool' );


describe( 'lib/Informix', function () {

	var opts = {
		database : 'test@ol_informix1210',
		username : 'informix',
		password : 'informix'
	};

	before( function () {
		pool.$reset();
	} );


	it( 'should set connection pool options', function () {
		var opts = {
			database : 'dummy@ol_informix1210',
			pool : {
				max : 2,
				min : 1
			}
		};

		var informix = new Informix( opts );
		expect( pool.$.min ).to.eql( opts.pool.min );
		expect( pool.$.max ).to.eql( opts.pool.max );
	} );

	it( 'should be able to run a query', function () {
		var informix = new Informix( opts );
		return informix.query( 'select first 1 * from tcustomers;' )
			.then( function ( cursor ) {
				expect( cursor ).to.be.an.instanceof( Cursor );
				return cursor.close();
			} );
	} );

	it( 'should be able to prepare a statement', function () {
		var informix = new Informix( opts );
		return informix.prepare( 'select count(*) from tcustomers where id > ?;' )
			.then( function ( stmt ) {
				expect( stmt ).to.be.an.instanceof( Statement );
				return stmt.free();
			} );
	} );


	context( 'when acquiring a connection from the pool fails', function () {

		before( function () {
			sinon.stub( pool, 'acquire', function () {
				return Promise.reject( new Error( '[stub] Failed to acquire.' ) );
			} );
		} );

		after( function () {
			pool.acquire.restore();
		} );

		it( 'should emit an error object when running a query', function ( done ) {
			var informix = new Informix( opts );
			informix.on( 'error', function ( err ) {
				try {
					expect( err ).to.be.an.instanceof( Error );
					expect( err.message ).to.be.string( '[stub] Failed to acquire.' );
				} catch ( e ) {
					return done( e );
				}

				done();
			} );

			informix.query( 'select first 1 * from tcustomers;' )
				.then( function ( c ) {
					throw new Error( 'Expected to fail, but it did not!!!' );
				} );
		} );

		it( 'should emit an error object when preparing a statement', function ( done ) {
			var informix = new Informix( opts );
			informix.on( 'error', function ( err ) {
				try {
					expect( err ).to.be.an.instanceof( Error );
					expect( err.message ).to.be.string( '[stub] Failed to acquire.' );
				} catch ( e ) {
					return done( e );
				}

				done();
			} );

			informix.prepare( 'select count(*) from tcustomers where id > ?;' )
				.then( function ( c ) {
					throw new Error( 'Expected to fail, but it did not!!!' );
				} );
		} );

	} );

} );

