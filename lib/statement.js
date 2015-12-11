
'use strict';

var crypto = require( 'crypto' );
var pool   = require( './pool' );


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
	this.$ = {
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

	return pool.acquire( self.$.conn )
		.then( function ( conn ) {
			return new Promise( function ( resolve, reject ) {
				var Cursor = require( './cursor' );
				var cursor = new Cursor( self.$.ifx, self.$.conn, self );

				if ( args !== undefined ) {
					self.$.ifx.exec( conn.id(), self.$.id, cursor.id(), args, function ( err, curid ) {
						if ( err ) {
							return reject( err );
						}

						pool.release( conn );
						resolve( cursor );
					} );
				} else {
					self.$.ifx.exec( conn.id(), self.$.id, cursor.id(), function ( err, curid ) {
						if ( err ) {
							return reject( err );
						}

						pool.release( conn );
						resolve( cursor );
					} );
				}
			} );
		} )
		.catch( function ( err ) {
			pool.release( self.$.conn );
			throw err;
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
		autoFree : ( this.$.opts.autoFree ? true : false )
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

	return pool.acquire( self.$.conn )
		.then( function ( conn ) {
			return new Promise( function ( resolve, reject ) {
				self.$.ifx.free( conn.id(), self.$.id, function ( err, stmtid ) {
					if ( err ) {
						return reject( err );
					}

					pool.release( conn );
					resolve( stmtid );
				} );
			} );
		} )
		.catch( function ( err ) {
			pool.release( self.$.conn );
			throw err;
		} );

};


/**
*   Set options
*
*   @param {object} opts - Options
*/
Statement.prototype.options = function ( opts ) {
	this.$.opts = opts || {};
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

	return pool.acquire( self.$.conn )
		.then( function ( conn ) {
			return new Promise( function ( resolve, reject ) {
				self.$.id = '_' + crypto.createHash( 'sha256' ).update( sql ).digest( 'hex' );
				self.$.ifx.prepare( conn.id(), self.$.id, sql, function ( err, stmtid ) {
					if ( err ) {
						return reject( err );
					}

					pool.release( conn );
					resolve( self );
				} );
			} );
		} )
		.catch( function ( err ) {
			pool.release( self.$.conn );
			throw err;
		} );

};



module.exports = Statement;

