
'use strict';

var expect = require( 'chai' ).expect;

var Statement  = require( '../lib/statement' );
var Cursor     = require( '../lib/cursor' );
var pool       = require( '../lib/pool' );


describe( 'lib/Statement', function () {

	var conn = {};

	before( function () {
		pool.$reset( {
			max : 1,
			database : 'test@ol_informix1210',
			username : 'informix',
			password : 'informix'
		} );

		return pool.acquire()
			.then( function ( c ) {
				conn = c;
				pool.release( c );
			} );
	} );


	it( 'should be able to prepare a statement', function () {
		var sql  = 'select tabname from systables where tabname like ?;';
		var stmt = new Statement( conn );
		return stmt.prepare( sql )
			.then( function ( stmt ) {
				expect( stmt ).to.be.an.instanceof( Statement );
				return stmt.free();
			} );
	} );


	context( 'constructor options', function () {

		context( 'when reusable=false', function () {

			var stmt = {};
			before( function () {
				var sql = 'select count(*) from tcustomers';
				stmt = new Statement( conn, { reusable : false } );
				return stmt.prepare( sql );
			} );


			it( 'should free the statment automatically after closing the cursor', function () {
				return stmt.exec()
					.then( function ( cursor ) {
						return cursor.close();
					} )
					.then( function ( curid ) {
						return stmt.free();
					} )
					.then( function () {
						throw new Error( 'Expected the statement to fail, but it did not!!!' );
					} )
					.catch( function ( err ) {
						expect( err ).to.be.an.instanceof( Error );
						expect( err.message ).to.be.string( 'Invalid statement ID.' );
					} );
			} );

		} );


		context( 'when reusable=true', function () {

			var stmt = {};
			before( function () {
				var sql = 'select count(*) from tcustomers';
				stmt = new Statement( conn, { reusable : true } );
				return stmt.prepare( sql );
			} );


			it( 'should not free the statment automatically after closing the cursor', function () {
				return stmt.exec()
					.then( function ( cursor ) {
						return cursor.close();
					} )
					.then( function ( curid ) {
						return stmt.free();
					} );
			} );

		} );

	} );


	context( 'when preparing a statement', function () {

		it( 'should reject the promise on syntax errors', function () {
			var stmt = new Statement( conn );
			return stmt.prepare( 'select something;' )
				.then( function ( s ) {
					throw new Error( 'Expected the statement to fail, but it did not!!!' );
				} )
				.catch( function ( err ) {
					expect( err ).to.be.an.instanceof( Error );
					expect( err.message ).to.be.string( '[-201] A syntax error has occurred.' );
				} );
		} );

	} );


	context( 'when a statement is prepared which has input parameters', function () {

		var stmt = {};
		before( function () {
			var sql = 'select * from tcustomers where id < ?;';
			stmt = new Statement( conn );
			return stmt.prepare( sql );
		} );

		after( function () {
			return stmt.free();
		} );


		context( 'when executing the statment', function () {
			it( 'should be able to execute the statement successfully', function () {
				return stmt.exec( 2 )
					.then( function ( cursor ) {
						expect( cursor ).to.be.an.instanceof( Cursor );
						return cursor.close();
					} );
			} );

			it( 'should reject the promise if no arguments are passed in', function () {
				return stmt.exec()
					.then( function ( c ) {
						throw new Error( 'Expected to fail, but it did not!!!' );
					} )
					.catch( function ( err ) {
						expect( err ).to.be.an.instanceof( Error );
						expect( err.message ).to.be.string( 'This statment requires input arguments.' );
					} );
			} );

			it( 'should reject the promise if incorrect number of arguments are passed in' );
			/*
			it( 'should reject the promise if incorrect number of arguments are passed in', function () {
				// FIXME: the following will leave a cursor behind with no access to close it
				return stmt.exec( [ 1, 2, 3 ] )
					.then( function ( c ) {
						throw new Error( 'Expected to fail, but it did not!!!' );
					} )
					.catch( function ( err ) {
						expect( err ).to.be.an.instanceof( Error );
						expect( err.message ).to.be.string( '[-254] Too many or too few host variables given.' );
					} );
			} );
			*/
		} );

	} );


	context( 'when a statement is prepared which does not have any input parameters', function () {

		var stmt = {};
		before( function () {
			var sql = 'select * from tcustomers where id < 3;';
			stmt = new Statement( conn );
			return stmt.prepare( sql );
		} );

		after( function () {
			return stmt.free();
		} );


		context( 'when executing the statment', function () {
			it( 'should be able to execute the statement successfully', function () {
				return stmt.exec()
					.then( function ( cursor ) {
						expect( cursor ).to.be.an.instanceof( Cursor );
						return cursor.close();
					} );
			} );

			it( 'should reject the promise if argumenst are passed in', function () {
				return stmt.exec( 3 )
					.then( function ( c ) {
						throw new Error( 'Expected to fail, but it did not!!!' );
					} )
					.catch( function ( err ) {
						expect( err ).to.be.an.instanceof( Error );
						expect( err.message ).to.be.string( 'This statment does not expect any input arguments.' );
					} );
			} );
		} );

	} );

} );

