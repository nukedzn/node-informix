
'use strict';

var Ifx = require( 'bindings' )( 'ifx' ).Ifx;
var EventEmitter = require( 'events' ).EventEmitter;

var Connection = require( './connection' );


/**
*   Class representing the IBM Informix client
*
*   @constructor
*   @param {object} opts - Constructor options
*/
var Informix = function ( opts ) {

	EventEmitter.call( this );

	// privileged data
	this._$ = {
		ifx : new Ifx()
	};

	this.options( opts );

};

Informix.prototype = Object.create( EventEmitter.prototype );


/**
*   Set options
*
*   @param {object} opts - Options
*/
Informix.prototype.options = function ( opts ) {
	this._$.opts = opts || {};
};


/**
*   Open a connection to the database
*
*   @return {Promise.<Connection, Error>} - A promise to a connection object or
*           an Error if rejected.
*/
Informix.prototype.connect = function () {

	var self = this;

	var params = {
		database : this._$.opts.database
	};

	if ( this._$.opts.username ) { params.username = this._$.opts.username; }
	if ( this._$.opts.password ) { params.password = this._$.opts.password; }

	this._$.conn = new Connection( this._$.ifx );
	return this._$.conn
		.connect( params )
		.then( function ( conn ) {
			self.emit( 'connect', conn );
			return conn;
		} )
		.catch( function ( err ) {
			self.emit( 'error', err );
			throw err;
		} );

};


/**
*   Run a SQL query
*
*   @param {string} sql - SQL query to run
*   @return {Promise.<Cursor, Error>} - A promise to a results cursor or an Error
*           if rejected.
*/
Informix.prototype.query = function ( sql ) {

	// FIXME: we assume we have a connection here
	return this._$.conn.prepare( sql, { autoFree : true } )
		.then( function ( stmt ) {
			return stmt.exec();
		} );

};



module.exports = Informix;

