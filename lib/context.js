
'use strict';

var uuid = require( 'uuid' );

var Statement = require( './statement' );


/**
*   Class representing a context which can be used to execute SQL statements in
*   chronological order and use transactions safely within the scope of the
*   context.
*
*   @constructor
*   @param {Pool} - Connection pool to be used for this context
*/
var Context = function ( pool ) {

	// Privileged data
	this.$ = {
		conn  : false,
		id    : uuid.v4(),
		pool  : pool,
		stmts : {
			cache    : [],
			begin    : false,
			commit   : false,
			rollback : false
		},
		transaction : false,
	};


	// Reserve a connection for this context
	this.$.conn = this.$.pool.reserve( this.id() );

};


/**
*   Begin a transaction for this context
*
*   @return {Promise.<string, Error>} - A promise which resolves after openning a
*           transaction or an Error if rejected.
*/
Context.prototype.begin = function () {

	var self = this;
	var stmt;

	if (! this.$.stmts.begin ) {
		stmt = new Statement( this.$.conn, { context : this.id(), id : 'begin' } );
		stmt = this.$.stmts.begin = stmt.prepare( 'begin;' );
	} else {
		stmt = this.$.stmts.begin;
	}

	return stmt
		.then( function ( stmt ) {
			self.$.transaction = true;
			return stmt.exec();
		} )
		.then( function ( cursor ) {
			return cursor.close();
		} );

};


/**
*   Commit a transaction opened for this context
*
*   @return {Promise.<string, Error>} - A promise which resolves after committing a
*          transaction or an Error if rejected.
*/
Context.prototype.commit = function () {

	var self = this;
	var stmt;

	if (! this.$.stmts.commit ) {
		stmt = new Statement( this.$.conn, { context : this.id(), id : 'commit' } );
		stmt = this.$.stmts.commit = stmt.prepare( 'commit;' );
	} else {
		stmt = this.$.stmts.commit;
	}

	return stmt
		.then( function ( stmt ) {
			self.$.transaction = false;
			return stmt.exec();
		} )
		.then( function ( cursor ) {
			return cursor.close();
		} );

};


/**
*   Rollback any open transactions and end the context by releasing the connection
*   used back to the pool.
*
*   @return {Promise<string, Error>} - A promise to a context ID string which
*           resolved after the context is ended or an Error if rejected.
*/
Context.prototype.end = function () {

	var self = this;
	var promise;

	if ( self.$.transaction ) {
		promise = self.rollback();
	} else {
		promise = Promise.resolve();
	}

	if ( self.$.stmts.begin ) {
		promise = promise
			.then( function () {
				return self.$.stmts.begin.then( function ( stmt ) {
					return stmt.free();
				} );
			} );
	}

	if ( self.$.stmts.commit ) {
		promise = promise
			.then( function () {
				return self.$.stmts.commit.then( function ( stmt ) {
					return stmt.free();
				} );
			} );
	}

	if ( self.$.stmts.rollback ) {
		promise = promise
			.then( function () {
				return self.$.stmts.rollback.then( function ( stmt ) {
					return stmt.free();
				} );
			} );
	}

	self.$.stmts.cache.forEach( function( stmt ) {
		promise = promise
			.then( function() {
				return stmt.then( function( s ) {
					return s.free();
				} );
			} );
	} );


	return promise
		.then( function () {
			return self.$.pool.close( self.id() );
		} )
		.then( function () {
			return self.id();
		} );

};


/**
*   Return the context ID
*
*   @return {string} - Context ID.
*/
Context.prototype.id = function () {
	return this.$.id;
};


/**
*   Prepare a statement which is only valid to be executed within this context
*
*   @param {string} sql - SQL statement to prepare
*   @return {Promise.<Statement, Error>} - A promise to a statement object or an
*           Error if rejected.
*/
Context.prototype.prepare = function ( sql ) {
	var stmt = new Statement( this.$.conn, { context : this.id() } );
	stmt = stmt.prepare( sql );
	this.$.stmts.cache.push( stmt );
	return stmt;
};


/**
*   Run a query within this context
*
*   @param {string} sql - SQL query to run
*   @return {Promise.<Cursor, Error>} - A promise to a results cursor or an Error
*           if rejected.
*/
Context.prototype.query = function ( sql ) {
	var stmt = new Statement( this.$.conn, { context : this.id(), reusable : false } );

	return stmt.prepare( sql )
		.then( function ( stmt ) {
			return stmt.exec();
		} );
};


/**
*   Rollback a transaction opened for this context
*
*   @return {Promise.<string, Error>} - A promise which resolves after rolling-back a
*          transaction or an Error if rejected.
*/
Context.prototype.rollback = function () {

	var self = this;
	var stmt;

	if (! this.$.stmts.rollback ) {
		stmt = new Statement( this.$.conn, { context : this.id(), id : 'rollback' } );
		stmt = this.$.stmts.rollback = stmt.prepare( 'rollback;' );
	} else {
		stmt = this.$.stmts.rollback;
	}

	return stmt
		.then( function ( stmt ) {
			self.$.transaction = false;
			return stmt.exec();
		} )
		.then( function ( cursor ) {
			return cursor.close();
		} );

};



module.exports = Context;

