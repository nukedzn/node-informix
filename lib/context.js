
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
			rollback : false,
			prepared : []
		},
		transaction : false,
	};


	// Reserve a connection for this context
	this.$.conn = this.$.pool.reserve( this.id() );

};


Context.prototype.begin = function () {};


Context.prototype.commit = function () {};


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
	var stmt = new Statement( this.$.conn, { context : this.id(), reusable : false} );

	return stmt.prepare( sql )
		.then( function ( stmt ) {
			return stmt.exec();
		} );
};


Context.prototype.rollback = function () {};



module.exports = Context;

