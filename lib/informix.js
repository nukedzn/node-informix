
'use strict';

var EventEmitter = require( 'events' ).EventEmitter;

var Context = require( './context' );
var Pool    = require( './pool' );


/**
*   Class representing the IBM Informix client
*
*   @constructor
*   @param {object} opts - Constructor options
*/
var Informix = function ( opts ) {

	EventEmitter.call( this );

	// Privileged data
	this.$ = {
		pool : new Pool()
	};

	this.options( opts );

};

Informix.prototype = Object.create( EventEmitter.prototype );


/**
*   Create a new context to execute SQL statements and use transactions safely
*
*   @return {Context} - A context object.
*/
Informix.prototype.createContext = function () {
	return new Context( this.$.pool );
};


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

	this.$.pool.options( popts );
};


/**
*   Prepare a statement
*
*   @param {string} sql - SQL statement to prepare
*   @param {string} [name] - Statement name
*   @return {Promise.<Statement, Error>} - A promise to a statement object or an
*           Error if rejected.
*/
Informix.prototype.prepare = function ( sql, name ) {

	var self = this;
	var opts;

	if ( ( typeof name === 'string' ) && name.length > 0 ) {
		opts = { id : name };
	}

	return self.$.pool.acquire()
		.then( function ( conn ) {
			self.$.pool.release( conn );
			return conn.prepare( sql, opts );
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

	return self.$.pool.acquire()
		.then( function ( conn ) {
			self.$.pool.release( conn );
			return conn.prepare( sql, { reusable : false } );
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

