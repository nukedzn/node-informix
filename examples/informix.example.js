/**
*
*   informix.example.js
*
*   Basic example of using the informix client API to run a query.
*
*/

'use strict';

var Informix = require( '../' ).Informix;
var informix = new Informix( { database : 'test@ol_informix1210' } );


// Error event listener
informix.on( 'error', function ( err ) {
	console.log( '[event:error]', err );
} );



// Execute a query
informix
	.query( "select tabname from systables where tabname like 'sys%auth';" )
	.then( function ( cursor ) {
		// Fetch all results and close cursor
		return cursor.fetchAll( { close : true } );
	} )
	.then( function ( results ) {
		console.log( '[query] results:', results );
	} )
	.catch( function ( err ) {
		console.log( err );
	} );


// Execute a prepared statement
informix
	.prepare( 'select count(*) from tcustomers where id > ?;' )
	.then( function ( stmt ) {
		return stmt.exec( 0 );
	} )
	.then( function ( cursor ) {
		// Fetch all results and close cursor
		return cursor.fetchAll( { close : true } );
	} )
	.then( function ( results ) {
		console.log( '[stmt] results:', results );
	} )
	.catch( function ( err ) {
		console.log( err );
	} );

