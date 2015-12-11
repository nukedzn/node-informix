
'use strict';

var expect = require( 'chai' ).expect;
var pool   = require( '../lib/pool' );

var Connection = require( '../lib/connection' );


describe( 'lib/Pool', function () {

	before( function () {
		pool.options( {
			max : 3,
			database : 'test@ol_informix1210',
			username : 'informix',
			password : 'informix'
		} );
	} );



	it( 'should be possible to acquire a connection', function () {
		return pool.acquire()
			.then( function ( conn ) {
				expect( conn ).to.be.an.instanceof( Connection );
				return pool.release( conn );
			} );
	} );


	context( 'when a connection is acquired', function () {

		var conn;
		before( function () {
			return pool.acquire()
				.then( function ( c ) {
					expect( pool.$.resolvers[ c.index() ] ).to.have.length( 1 );
					conn = c;
				} );
		} );

		after( function () {
			return pool.release( conn );
		} );


		it( 'should wait when requesting the same connection', function () {
			var promise = pool.acquire( conn );

			expect( pool.$.resolvers[ conn.index() ] ).to.have.length( 2 );
			pool.release( conn );
			return promise
				.then( function () {
					expect( pool.$.resolvers[ conn.index() ] ).to.have.length( 1 );
				} );
		} );

	} );


	context( 'when the connection pool is busy', function () {

		var conns = [];
		before( function () {
			var promises = [];
			while ( promises.push( pool.acquire() ) < 3 );

			return Promise.all( promises )
				.then( function ( result ) {
					conns = result;

					conns.forEach( function ( conn ) {
						expect( pool.$.resolvers[ conn.index() ] ).to.have.length( 1 );
					} );
				} );
		} );

		after( function () {
			conns.forEach( function ( conn ) {
				pool.release( conn );
				expect( pool.$.resolvers[ conn.index() ] ).to.have.length( 0 );
			} );
		} );


		it( 'should wait for existing promises when a connection is requested', function () {
			var promise = pool.acquire();
			expect( pool.$.resolvers[ 0 ] ).to.have.length( 2 );

			pool.release( conns[0] );
			return promise
				.then( function ( conn ) {
					expect( pool.$.resolvers[ 0 ] ).to.have.length( 1 );
				} );
		} );

		it( 'should wait for promises in a round robin manner', function () {
			pool.$.next = 2;
			var promise = pool.acquire();
			expect( pool.$.resolvers[ 2 ] ).to.have.length( 2 );

			pool.release( conns[2] );
			return promise
				.then( function ( conn ) {
					expect( pool.$.resolvers[ 2 ] ).to.have.length( 1 );
					expect( pool.$.next ).to.eql( 0 );
				} );
		} );

	} );

} );

