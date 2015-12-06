
'use strict';

var crypto = require( 'crypto' );

var Cursor = require( './cursor' );


/**
*   Class representing a prepared statement
*
*   @constructor
*   @param {Ifx} ifx - Native object instance
*   @param {Connection} conn - Connection object
*   @param {object} [opts] - Constructor options
*   @param {boolean} [opts.autoFree] - Flag to indicate whether this statement
*          should be freed automatically.
*/
var Statement = function ( ifx, conn, opts ) {

	// privileged data
	this._$ = {
		conn : conn,
		ifx  : ifx
	};

	this.options( opts );

};


/**
*   Execute the prepared statement
*
*   @param {string|Array} [args] - Arguments to be used when executing the
*          prepared statement.

*   @return {Promise.<Cursor, Error>} - A promise to a results cursor object or
*           an Error if rejected.
*/
Statement.prototype.exec = function ( args ) {

	var self = this;

	return new Promise( function ( resolve, reject ) {
		var cursor = new Cursor( self._$.ifx, self );

		if ( args !== undefined ) {
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
*   Return statement flags
*
*   @return {object} flags - Statement flags
*   @return {boolean} flags.autoFree - Flag to indicate whether this statement
*          should be freed automatically.
*/
Statement.prototype.flags = function () {

	var flags = {
		autoFree : ( this._$.opts.autoFree ? true : false )
	};

	return flags;

};


/**
*   Free the prepared statement
*
*   @return {Promise.<string, Error>} - A promise to a string which would
*           contain the statement ID freed or an Error if rejected.
*/
Statement.prototype.free = function () {

	var self = this;

	return new Promise( function ( resolve, reject ) {
		self._$.ifx.free( self._$.conn.id(), self._$.id, function ( err, stmtid ) {
			if ( err ) {
				return reject( err );
			}

			resolve( stmtid );
		} );
	} );

};


/**
*   Set options
*
*   @param {object} opts - Options
*/
Statement.prototype.options = function ( opts ) {
	this._$.opts = opts || {};
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

