/* jshint expr: true */

'use strict';

var expect = require( 'chai' ).expect;
var Ifx    = require( 'bindings' )( 'ifx' ).Ifx;

var Connection = require( '../lib/connection' );
var Pool       = require( '../lib/pool' );


describe( 'lib/Pool', function () {

	var pool = {};
	before( function () {
		pool = new Pool( {
			max : 3,
			database : 'test@ol_informix1210',
			username : 'informix',
			password : 'informix'
		} );
	} );



	context( 'when acquiring a connection', function () {

		it( 'should acquire a connection successfully', function () {
			return pool.acquire()
				.then( function ( conn ) {
					expect( conn ).to.be.an.instanceof( Connection );
					return pool.release( conn );
				} );
		} );

		it( 'should reserve a connection for a context automatically', function () {
			var context = 'ctx:id:00001';
			return pool.acquire( context )
				.then( function ( conn ) {
					expect( pool.$.contexts[ context ].resolvers ).to.have.length( 1 );
					pool.release( context );
					pool.close( context );
				} );
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


	context( 'when reserving a connection to be used within a context', function () {

		it( 'should reserve a connection successfully', function () {
			var context = 'ctx:id:10001';
			pool.reserve( context );
			expect( pool.$.contexts[ context ].conn ).to.be.an.instanceof( Connection );
			expect( pool.$.contexts[ context ].resolvers ).to.have.length( 0 );
			pool.close( context );
		} );

		it( 'should not reserve connections for open contexts', function () {
			var context = 'ctx:id:10002';
			var exception = false;
			pool.reserve( context );

			try {
				pool.reserve( context );
			} catch ( e ) {
				expect( e.message ).to.be.string( 'A connection is already reserved for the given context.' );
				exception = true;
			}

			expect( exception ).to.be.true;
			pool.close( context );
		} );

	} );


	context( 'when a connection is reserved for a context', function () {

		var context = 'ctx:id:20001';
		before( function () {
			pool.reserve( context );
		} );

		after( function () {
			pool.close( context );
		} );


		it( 'should be possible to aquire the connection for the same context', function () {
			var ctx = pool.$.contexts[ context ];
			return pool.acquire( context )
				.then( function ( conn ) {
					expect( ctx.resolvers ).to.have.length( 1 );
					pool.release( context );
				} );
		} );

		it( 'should wait until the context is closed when the connection is acquired outside the context', function () {
			var conn = pool.$.contexts[ context ].conn;
			var promise = pool.acquire( conn );

			expect( pool.$.resolvers[ conn.index() ] ).to.have.length( 1 );
			pool.close( context );

			return promise.then( function ( conn ) {
				pool.release( conn );
				expect( pool.$.resolvers[ conn.index() ] ).to.have.length( 0 );

				pool.reserve( context );
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

