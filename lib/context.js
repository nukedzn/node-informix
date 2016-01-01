
'use strict';

var uuid = require( 'uuid' );

var Statement = require( './statement' );


var Context = function ( pool ) {

	// Privileged data
	this.$ = {
		conn  : false,
		id    : uuid.v4(),
		pool  : pool,
		stmts : {
			begin    : false,
			commit   : false,
			rollback : false
		},
		transaction : false,
	};


	// Reserve a connection for this context
	this.$.conn = this.$.pool.reserve( this.id() );

};


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
		} );

};


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
		} );

};


Context.prototype.end = function () {
	this.$.pool.close( this.id() );
};


Context.prototype.id = function () {
	return this.$.id;
};


Context.prototype.prepare = function ( sql ) {
	var stmt = new Statement( this.$.conn, { context : this.id() } );
	return stmt.prepare( sql );
};


Context.prototype.query = function ( sql ) {
	var stmt = new Statement( this.$.conn, { context : this.id(), reusable : false } );

	return stmt.prepare( sql )
		.then( function ( stmt ) {
			return stmt.exec();
		} );
};


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
		} );

};



module.exports = Context;

