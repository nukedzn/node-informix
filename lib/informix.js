
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
*   @param {object} [opts] - Options
*   @param {boolean} [opts.silent=false] - Flag indicating to suppress error
*          events.
*
*   @return {Promise.<Connection, Error>} - A promise to a connection object or
*           an Error if rejected.
*/
Informix.prototype.connect = function ( opts ) {

	var self = this;
	if (! opts ) { opts = {}; }

	if ( this._$.conn ) {
		return Promise
			.resolve( this._$.conn )
			.catch( function ( err ) {
				if ( opts.silent !== true ) {
					self.emit( 'error', err );
				}

				throw err;
			} );
	}

	var params = {
		database : this._$.opts.database
	};

	if ( this._$.opts.username ) { params.username = this._$.opts.username; }
	if ( this._$.opts.password ) { params.password = this._$.opts.password; }

	var conn = new Connection( this._$.ifx );
	this._$.conn = conn.connect( params )
		.then( function ( conn ) {
			self._$.conn = conn;
			self.emit( 'connect', conn );
			return conn;
		} )
		.catch( function ( err ) {
			if ( opts.silent !== true ) {
				self.emit( 'error', err );
			}
			throw err;
		} );

	return this._$.conn;

};


/**
*   Prepare a statement
*
*   @param {string} sql - SQL statement to prepare
*   @return {Promise.<Statement, Error>} - A promise to a statement object or an
*           Error if rejected
*/
Informix.prototype.prepare = function ( sql ) {

	var self = this;

	return this.connect( { silent : true } )
		.then( function ( conn ) {
			return conn.prepare( sql );
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

	var self = this;

	return this.connect( { silent : true } )
		.then( function ( conn ) {
			return conn.prepare( sql, { autoFree : true } );
		} )
		.then( function ( stmt ) {
			return stmt.exec();
		} )
		.catch( function ( err ) {
			self.emit( 'error', err );
			throw err;
		} );

};



module.exports = Informix;

