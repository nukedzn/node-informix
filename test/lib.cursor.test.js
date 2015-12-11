/* jshint expr: true */

'use strict';

var expect = require( 'chai' ).expect;
var sinon  = require( 'sinon' );

var Statement  = require( '../lib/statement' );
var Cursor     = require( '../lib/cursor' );
var pool       = require( '../lib/pool' );


describe( 'lib/Cursor', function () {

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


	context( 'when a query with results is executed', function () {

		var cursor = {};
		var stmt   = {};

		before( function () {
			var sql  = 'select tabname from systables where tabname like ?;';
			stmt = new Statement( conn.$.ifx, conn );
			return stmt.prepare( sql );
		} );

		beforeEach( function () {
			return stmt.exec( 'sys%auth' )
				.then( function ( c ) {
					expect( c ).to.be.an.instanceof( Cursor );
					cursor = c;
				} );
		} );

		after( function () {
			return stmt.free();
		} );


		it( 'should be possible to fetch a result', function () {
			return cursor.fetch()
				.then( function ( result ) {
					expect( result ).to.be.an.instanceof( Array );
					expect( result ).to.have.length( 1 );
					expect( result[0] ).to.match( /^sys(\w+)?auth$/ );
					return cursor.close();
				} );
		} );

		it( 'should be possible to fetch all results', function () {
			return cursor.fetchAll()
				.then( function ( results ) {
					expect( results ).to.be.an.instanceof( Array );
					expect( results ).to.have.length.of.at.least( 4 );
					expect( results[0] ).to.be.an( 'array' )
						.with.length( 1 );
					return cursor.close();
				} );
		} );

		it( 'should be possible to fetch all results and close the cursor', function () {
			var spy = sinon.spy( cursor, 'close' );
			return cursor.fetchAll( { close : true } )
				.then( function ( results ) {
					expect( spy.calledOnce ).to.be.true;
					spy.reset();
				} );
		} );


		context( 'when failing to close cursor', function () {

			beforeEach( function () {
				sinon.stub( cursor, 'close', function () {
					return Promise.reject( new Error( '[stub] Failed to close.' ) );
				} );
			} );

			afterEach( function () {
				cursor.close.restore();
				return cursor.close();
			} );


			it( 'should handle failures when fetching all and closing cursor', function () {
				return cursor.fetchAll( { close : true } )
					.then( function ( results ) {
						throw new Error( 'Expected to fail, but it did not!!!' );
					} )
					.catch( function ( err ) {
						expect( err.message ).to.be.string( '[stub] Failed to close.' );
					} );
			} );

		} );

	} );


	context( 'when an insert query is executed', function () {

		var cursor = {};
		var stmt   = {};

		before( function () {
			var sql  = 'insert into tcustomers( fname, lname ) values( ?, ? );';
			stmt = new Statement( conn.$.ifx, conn );
			return stmt.prepare( sql );
		} );

		beforeEach( function () {
			return stmt.exec( [ conn.id(), 'Name' ] )
				.then( function ( c ) {
					expect( c ).to.be.an.instanceof( Cursor );
					cursor = c;
				} );
		} );

		afterEach( function () {
			return cursor.close();
		} );

		after( function () {
			return stmt.free();
		} );


		it( 'should be able to get the serial ID', function () {
			expect( cursor.serial() ).to.be.above( 0 );
		} );

		it( 'should fail to fetch results', function () {
			return cursor.fetch()
				.then( function ( result ) {
					throw new Error( 'Expected to fail, but it did not!!!' );
				} )
				.catch( function ( err ) {
					expect( err ).to.be.an.instanceof( Error );
					expect( err.message ).to.be.string( '[-400] Fetch attempted on unopen cursor.' );
				} );
		} );

		it( 'should fail to fetch all results', function () {
			return cursor.fetchAll()
				.then( function ( results ) {
					throw new Error( 'Expected to fail, but it did not!!!' );
				} )
				.catch( function ( err ) {
					expect( err ).to.be.an.instanceof( Error );
					expect( err.message ).to.be.string( '[-400] Fetch attempted on unopen cursor.' );
				} );
		} );

	} );

} );

