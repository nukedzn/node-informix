/**
*
*   transaction.example.js
*
*   Example of using transactions.
*
*/

'use strict';

var Informix = require( '../' ).Informix;
var informix = new Informix( {
	database : 'test@ol_informix1210',
	username : 'informix',
	password : 'informix'
} );


// Error event listener
informix.on( 'error', function ( err ) {
	console.log( '[event:error]', err );
} );


// Create a context to use with transactions
var ctx = informix.createContext();

// Prepare statements
var insert = ctx.prepare( 'insert into tcustomers( fname, lname ) values( ?, ? );' );
var select = ctx.prepare( 'select * from tcustomers where id = ?' );

var id;

// Begin a transaction
ctx.begin()
	.then( function () {
		// Insert data
		return insert
			.then( function ( stmt ) {
				return stmt.exec( [ 'John', 'Smith' ] );
			} );
	} )
	.then( function ( cursor ) {
		id = cursor.serial();
		cursor.close();
		console.log( '[insert] id:', id );

		// Rollback (or commit) the transaction
		return ctx.rollback();
		//return ctx.commit();
	} )
	.then( function () {
		// Select data
		return select
			.then( function ( stmt ) {
				return stmt.exec( id );
			} );
	} )
	.then( function ( cursor ) {
		return cursor.fetchAll( { close : true } );
	} )
	.then( function ( results ) {
		console.log( '[select] results:', results );
	} )
	.then( function () {
		// Free prepared statements
		return insert
			.then( function ( stmt ) { return stmt.free(); } )
			.then( function () {
				return select
					.then( function ( stmt ) { return stmt.free(); } );
			} );
	} )
	.then( function () {
		// End context
		return ctx.end();
	} )
	.catch( function ( err ) {
		console.log( err );
	} );

