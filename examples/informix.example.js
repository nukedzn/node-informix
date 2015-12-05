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


// Connect event listener
informix.on( 'connect', function ( conn ) {
	console.log( '[event:connect] id:', conn.id() );
} );


informix
	.query( "select tabname from systables where tabname like 'sys%auth';" )
	.then( function ( cursor ) {
		return cursor.fetchAll();
	} )
	.then( function ( results ) {
		console.log( 'results:', results );
	} );

