
'use strict';

var expect = require( 'chai' ).expect;
var Ifx    = require( 'bindings' )( 'ifx' ).Ifx;

var Connection = require( '../lib/connection' );
var Statement  = require( '../lib/statement' );
var Cursor     = require( '../lib/cursor' );


describe( 'lib/Statement', function () {

	var ifx  = new Ifx();
	var conn = new Connection( ifx );

	before( function () {
		return conn.connect( {
			database : 'test@ol_informix1210',
			username : 'informix',
			password : 'informix'
		} );
	} );


	it( 'should be able to prepare a statement', function () {
		var sql  = 'select tabname from systables where tabname like ?;';
		var stmt = new Statement( ifx, conn.id() );
		return stmt.prepare( sql )
			.then( function ( stmt ) {
				expect( stmt ).to.be.an.instanceof( Statement );
			} );
	} );


	context( 'when preparing a statement', function () {

		var stmt = new Statement( ifx, conn.id() );

		it( 'should reject the promise on syntax errors', function () {
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


	context( 'when a statement is prepared which has input arguments', function () {

		var stmt = new Statement( ifx, conn.id() );
		before( function () {
			var sql = 'select * from tcustomers where id < ?;';
			return stmt.prepare( sql );
		} );

		context( 'when executing the statment', function () {
			it( 'should be able to execute the statement successfully', function () {
				return stmt.exec( 2 )
					.then( function ( cursor ) {
						expect( cursor ).to.be.an.instanceof( Cursor );
					} );
			} );

			it( 'should reject the promise if no arguments are passed in', function () {
				return stmt.exec()
					.then( function ( c ) {
						throw new Error( 'Expected to fail, but it did not!!!' );
					} )
					.catch( function ( err ) {
						expect( err ).to.be.an.instanceof( Error );
						expect( err.message ).to.be.string( '[-254] Too many or too few host variables given.' );
					} );
			} );
		} );

	} );


	context( 'when a statement is prepared which does not have any input arguments', function () {

		var stmt = new Statement( ifx, conn.id() );
		before( function () {
			var sql = 'select * from tcustomers where id < 3;';
			return stmt.prepare( sql );
		} );

		context( 'when executing the statment', function () {
			it( 'should be able to execute the statement successfully', function () {
				return stmt.exec()
					.then( function ( cursor ) {
						expect( cursor ).to.be.an.instanceof( Cursor );
					} );
			} );

			it( 'should reject the promise if argumenst are passed in', function () {
				return stmt.exec( 3 )
					.then( function ( c ) {
						throw new Error( 'Expected to fail, but it did not!!!' );
					} )
					.catch( function ( err ) {
						expect( err ).to.be.an.instanceof( Error );
						expect( err.message ).to.be.string( '[-254] Too many or too few host variables given.' );
					} );
			} );
		} );

	} );

} );

