
'use strict';

var Ifx = require( 'bindings' )( 'ifx' ).Ifx;
var EventEmitter = require( 'events' ).EventEmitter;

var pool = require( './pool' );


/**
*   Class representing the IBM Informix client
*
*   @constructor
*   @param {object} opts - Constructor options
*/
var Informix = function ( opts ) {

	EventEmitter.call( this );

	// privileged data
	this.$ = {
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
	this.$.opts = opts || {};

	var popts = {
		database : this.$.opts.database,
		username : this.$.opts.username,
		password : this.$.opts.password
	};

	if ( this.$.opts.pool ) {
		for ( var key in this.$.opts.pool ) {
			popts[ key ] = this.$.opts.pool[ key ];
		}
	}

	pool.options( popts );
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

	return pool.acquire()
		.then( function ( conn ) {
			pool.release( conn );
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

	return pool.acquire()
		.then( function ( conn ) {
			pool.release( conn );
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

