
'use strict';

var uuid = require( 'uuid' );


/**
*   Class representing a connection to a database
*
*   @constructor
*   @param {Ifx} ifx - Native object instance
*   @param {object} [opts] - Constructor options
*/
var Connection = function ( ifx, opts ) {

	// privileged data
	this.$ = {
		id    : uuid.v4(),
		index : -1,
		ifx   : ifx,
	};

	this.options( opts );

};


/**
*   Open a connection to a database
*
*   @param {object} params - Connection parameters
*   @return {Promise.<Connection, Error>} - A promise to a connection object or an
*           Error if rejected.
*/
Connection.prototype.connect = function ( params ) {

	var self = this;

	// set INFORMIXSERVER environment variable if needed
	if ( params.database ) {

		var server = params.database.split( '@' )[ 1 ];
		if ( server && ( process.env.INFORMIXSERVER !== server ) ) {
			process.env.INFORMIXSERVER = server;
		}

	}

	return new Promise( function ( resolve, reject ) {
		params.id = self.$.id;
		self.$.ifx.connect( params, function ( err, connid ) {
			if ( err ) {
				return reject( err );
			}

			resolve( self );
		} );
	} );

};


/**
*   Return the connection ID
*
*   @return {string} - ID generated for this connection.
*/
Connection.prototype.id = function () {
	return this.$.id;
};


/**
*   Return the instance of the native binding used with this connection
*
*   @return {Ifx} - Native object instance.
*/
Connection.prototype.ifx = function () {
	return this.$.ifx;
};


/**
*   Return the connection pool index
*
*   @return {integer} - Connection pool index associated with this connection.
*/
Connection.prototype.index = function () {
	return this.$.index;
};


/**
*   Set options
*
*   @param {object} opts - Options
*/
Connection.prototype.options = function ( opts ) {
	this.$.opts = opts || {};

	if ( this.$.opts.index !== undefined ) {
		this.$.index = this.$.opts.index;
	}
};


/**
*   Prepare a statement
*
*   @param {string} sql - SQL statement to prepare
*   @param {object} [opts] - Options to be passed to the {@link Statement} constructor
*
*   @return {Promise.<Statement, Error>} - A promise to a statement object or an
*           Error if rejected.
*/
Connection.prototype.prepare = function ( sql, opts ) {

	var Statement = require( './statement' );
	var stmt = new Statement( this, opts );
	return stmt.prepare( sql );

};



module.exports = Connection;

