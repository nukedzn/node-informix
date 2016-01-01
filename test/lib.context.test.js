
'use strict';


var expect = require( 'chai' ).expect;

var Context   = require( '../lib/context' );
var Pool      = require( '../lib/pool' );
var Statement = require( '../lib/statement' );


describe( 'lib/Context', function () {

	var pool = new Pool( {
		max : 1,
		database : 'test@ol_informix1210',
		username : 'informix',
		password : 'informix'
	} );


	it( 'should be possible to execute a query', function () {
		var ctx = new Context( pool );
		return ctx.query( 'select count(*) from systables;' )
			.then( function ( cursor ) {
				return cursor.fetchAll( { close : true } );
			} )
			.then( function ( results ) {
				expect( results ).to.have.length( 1 );
				ctx.end();
			} );
	} );

	it( 'should be possible to prepare a query', function () {
		var ctx = new Context( pool );
		return ctx.prepare( 'select count(*) from systables where tabname like ?;' )
			.then( function ( stmt ) {
				expect( stmt ).to.be.an.instanceof( Statement );
				return stmt.free();
			} )
			.then( function ( stmtid ) {
				ctx.end();
			} );
	} );


	context( 'when working with transactions', function () {

		var ctx = {};
		before( function () {
			ctx = new Context( pool );
		} );

		after( function () {
			ctx.end();
		} );


		it( 'should be possible to commit transactions', function () {
			var serial;
			return ctx.begin()
				.then( function () {
					return ctx.query( "execute procedure pinscustomer( 'Name', '" + ctx.id() +  "' );" );
				} )
				.then( function ( cursor ) {
					return cursor.fetchAll( { close : true } );
				} )
				.then( function ( results ) {
					serial = results[0][0];
					return ctx.commit();
				} )
				.then( function () {
					return ctx.query( 'select * from tcustomers where id = ' + serial + ';' );
				} )
				.then( function ( cursor ) {
					return cursor.fetchAll( { close : true } );
				} )
				.then( function ( results ) {
					expect( results ).to.have.length( 1 );
					expect( results[0][0] ).to.eq( serial );
				} );
		} );

		it( 'should be possible to rollback transactions', function () {
			var count, stmt;
			return ctx.prepare( 'select count(*) from tcustomers;' )
				.then( function ( s ) {
					stmt = s;
					return stmt.exec();
				} )
				.then( function ( cursor ) {
					return cursor.fetchAll( { close : true } );
				} )
				.then( function ( results ) {
					count = results[0][0];
					expect( count ).to.be.at.least( 0 );
				} )
				.then( function () {
					return ctx.begin();
				} )
				.then( function () {
					return ctx.query( "insert into tcustomers( fname, lname ) values( 'Name', '" + ctx.id() +  "' );" );
				} )
				.then( function ( cursor ) {
					expect( cursor.serial() ).to.be.gt( count );
				} )
				.then( function () {
					return ctx.rollback();
				} )
				.then( function () {
					return stmt.exec();
				} )
				.then( function ( cursor ) {
					return cursor.fetchAll();
				} )
				.then( function ( results ) {
					expect( results[0][0] ).to.eq( count );
				} );
		} );
	} );

} );

