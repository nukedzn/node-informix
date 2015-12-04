
'use strict';

var expect = require( 'chai' ).expect;
var Ifx    = require( '../' ).Ifx;

var Connection = require( '../lib/connection' );
var Statement  = require( '../lib/statement' );
var Cursor     = require( '../lib/cursor' );


describe( 'lib/Cursor', function () {

	var ifx  = new Ifx();
	var conn = new Connection( ifx );
	var stmt = new Statement( ifx, conn.id() );

	before( function () {
		return conn.connect( {
			database : 'test@ol_informix1210',
			username : 'informix',
			password : 'informix'
		} );
	} );


	context( 'when a query with results is executed', function () {

		var cursor = {};

		before( function () {
			var sql  = 'select tabname from systables where tabname like ?;';
			return stmt.prepare( sql );
		} );

		beforeEach( function () {
			return stmt.exec( 'sys%auth' )
				.then( function ( c ) {
					expect( c ).to.be.an.instanceof( Cursor );
					cursor = c;
				} );
		} );


		it( 'should be possible to fetch a result', function () {
			return cursor.fetch()
				.then( function ( result ) {
					expect( result ).to.be.an.instanceof( Array );
					expect( result ).to.have.length( 1 );
					expect( result[0] ).to.match( /^sys(\w+)?auth$/ );
				} );
		} );

		it( 'should be possible to fetch all results', function () {
			return cursor.fetchAll()
				.then( function ( results ) {
					expect( results ).to.be.an.instanceof( Array );
					expect( results ).to.have.length.of.at.least( 4 );
					expect( results[0] ).to.be.an( 'array' )
						.with.length( 1 );
				} );
		} );

	} );

} );

