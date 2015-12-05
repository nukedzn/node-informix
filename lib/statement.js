
'use strict';

var crypto = require( 'crypto' );

var Cursor = require( './cursor' );


/**
*   Class representing a prepared statement
*
*   @constructor
*   @param {Ifx} ifx - Native object instance
*   @param {Connection} conn - Connection object
*/
var Statement = function ( ifx, conn ) {

	// privileged data
	this._$ = {
		conn : conn,
		ifx  : ifx
	};

};


/**
*   Execute the prepared statement
*
*   @param {string|Array} [args] - Arguments to be used when executing the
*          prepared statement.
*
*   @return {Promise.<Cursor, Error>} - A promise to a results cursor object or
*           an Error if rejected.
*/
Statement.prototype.exec = function ( args ) {

	var self = this;

	return new Promise( function ( resolve, reject ) {
		var cursor = new Cursor( self._$.ifx );

		if ( args ) {
			self._$.ifx.exec( self._$.conn.id(), self._$.id, cursor.id(), args, function ( err, curid ) {
				if ( err ) {
					return reject( err );
				}

				resolve( cursor );
			} );
		} else {
			self._$.ifx.exec( self._$.conn.id(), self._$.id, cursor.id(), function ( err, curid ) {
				if ( err ) {
					return reject( err );
				}

				resolve( cursor );
			} );
		}
	} );

};


/**
*   Prepare a statement
*
*   @param {string} sql - SQL statement to prepare
*   @return {Promise.<Statement, Error>} - A promise to a statement object or an
*           Error if rejected.
*/
Statement.prototype.prepare = function ( sql ) {

	var self = this;

	return new Promise( function ( resolve, reject ) {
		self._$.id = '_' + crypto.createHash( 'sha256' ).update( sql ).digest( 'hex' );
		self._$.ifx.prepare( self._$.conn.id(), self._$.id, sql, function ( err, stmtid ) {
			if ( err ) {
				return reject( err );
			}

			resolve( self );
		} );
	} );

};



module.exports = Statement;

