/**
*
*   ifx-insert.example.js
*
*   Example of connecting to a database and running a prepared insert statement
*   using the native binding directly.
*
*/

'use strict';

var Ifx    = require( 'bindings' )( 'ifx' ).Ifx;
var uuid   = require( 'uuid' );
var crypto = require( 'crypto' );
var ifx    = new Ifx();


// connect to the database, we use a UUID v4 as the connection ID
ifx.connect( {
	database : 'test@ol_informix1210',
	id : uuid.v4()
}, function ( err, connid ) {

	// check for errors
	if ( err ) {
		return console.log( 'Failed to connect,', err );
	}

	console.log( 'Connected with ID:', connid );

	/*
	*  Prepare a statement.
	*  We use a sha256 hash of the statement as the statement id (prefixed with
	*  an underscore to avoid -481 errors). Using a sha256 hash helps to ensure
	*  we don't try to prepare the same statmement twice.
	*/
	var sql    = 'insert into customers( fname, lname ) values( ?, ? );';
	var stmtid = '_' + crypto.createHash( 'sha256' ).update( sql ).digest( 'hex' );
	ifx.prepare( connid, stmtid, sql, function ( err, stmtid ) {

		// check for errors
		if ( err ) {
			return console.log( 'Failed to prepare statement', err );
		}

		console.log( 'Statement prepared with ID:', stmtid );

		/*
		*  Run a prepared statement and open a cursor.
		*  A UUID v4 without dashes and prefixed with an underscore (to avoid -404
		*  errors) is used as the connection ID.
		*/
		var fname = uuid.v4();
		var curid = '_' + fname.replace( /\-/g, 's' );
		ifx.exec( connid, stmtid, curid, [ fname, 'Name' ], function ( err, curid ) {

			// check for errors
			if ( err ) {
				return console.log( 'Failed to run statmenet,', err );
			}

			console.log( 'Have a cursor with ID:', curid, ', for statement[', stmtid, ']' );
			console.log( '[', curid, '] serial:', ifx.serial( curid ) );

			// close cursor
			ifx.close( curid, function ( err, curid ) {
				if ( err ) {
					return console.log( 'Failed to close cursor,', err );
				}

				console.log( '[', curid, '] closed' );

				// free statement
				ifx.free( connid, stmtid, function ( err , stmtid ) {
					if ( err ) {
						return console.log( 'Failed to free statement,', err );
					}

					console.log( '[', stmtid ,'] freed' );

					// disconnect
					ifx.disconnect( connid, function ( err, connid ) {
						if ( err ) {
							return console.log( 'Failed to disconnect', err );
						}

						console.log( '[', connid, '] disconnected' );
					} );
				} );
			} );

		} );

	} );

} );

