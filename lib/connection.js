
'use strict';

var uuid = require( 'uuid' );

var Statement = require( './statement' );


/**
*   Class representing a connection to a database
*
*   @constructor
*   @param {Ifx} ifx - Native object instance
*   @param {object} [opts] - Constructor options
*/
var Connection = function ( ifx, opts ) {

	// privileged data
	this._$ = {
		id  : uuid.v4(),
		ifx : ifx,
	};

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

	return new Promise( function ( resolve, reject ) {
		params.id = self._$.id;
		self._$.ifx.connect( params, function ( err, connid ) {
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
	return this._$.id;
};


/**
*   Prepare a statement
*
*   @param {string} sql - SQL statement to prepare
*   @param {object} [opts] - Options to be passed to the {@link Statement} constructor
*
*   @return {Promise.<Statement, Error>} - A promise to a statement object or an
*           Error if rejected
*/
Connection.prototype.prepare = function ( sql, opts ) {

	var stmt = new Statement( this._$.ifx, this, opts );
	return stmt.prepare( sql );

};



module.exports = Connection;

