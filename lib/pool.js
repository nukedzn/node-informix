
'use strict';

var Ifx = require( 'bindings' )( 'ifx' ).Ifx;

var Connection = require( './connection' );


/**
*   Class representing a connection pool
*
*   @constructor
*/
var Pool = function () {
	this.$reset();
};


/**
*   Internal helper function to get the next available connection
*
*   @private
*   @return {Connection} - Connection object
*/
Pool.prototype.$next = function () {

	var self = this;
	var conn;

	if (! this.$.pool.length ) {

		// FIXME: expand dynamically
		for ( var i = 0; i < this.$.max; i++ ) {
			this.$.pool.push( new Connection( this.$.ifx, { index : i } ) );
			this.$.promises.push( false );
			this.$.resolvers.push( [] );
		}

		conn = this.$.pool[ 0 ];

	} else {

		// Filter out any idle connections.
		var filter = function ( element, index, array ) {
			// There won't be any resolvers left when all the promises for this
			// connection are resolved.
			return ( self.$.resolvers[ index ].length === 0 );
		};

		conn = this.$.pool.find( filter );

	}


	if (! conn ) {
		conn = this.$.pool[ this.$.next ];
		if ( ++this.$.next >= this.$.pool.length ) {
			this.$.next = 0;
		}
	}


	return conn;

};


/**
*   Internal helper function to return a promise for a connection
*
*   @private
*   @param {Connection} conn - Connection object
*   @return {Promise.<Connection, Error>} - A promise (or a promise chain) to
*           a connection object or an Error if rejected.
*/
Pool.prototype.$promise = function ( conn ) {

	var self = this;
	var chain, promise;

	// Create a promise for this connection which will be resolved when released
	// back to the pool. This will be used to queue future acquire requests for
	// this connection using promise chains.
	promise = new Promise( function ( resolve, reject ) {

		// Since this promise will be resolved when the connection is released back
		// to the pool, we need to store the resolve() callback internally. An array
		// is used to store these callbacks so they can be resolved in FIFO order.
		self.$.resolvers[ conn.index() ].push( resolve );

	} );

	// Check whether we already have promise for this connection.
	if ( this.$.promises[ conn.index() ] ) {

		// We have a promise for this connection so create a promise chain which will
		// wait for the last promise created (i.e. queued) for this connection and return
		// the connection.
		chain = this.$.promises[ conn.index() ]
			.then( function ( conn ) {
				return conn;
			} );

	} else {

		var params = {
			database : this.$.opts.database
		};

		if ( this.$.opts.username ) { params.username = this.$.opts.username; }
		if ( this.$.opts.password ) { params.password = this.$.opts.password; }

		// We don't have any promises for this connection, which implies this is the first
		// request for this connection. So our promise chain is a connect() here.
		chain = conn.connect( params );

	}

	// Store the last promise created for this connection. This will be used as the
	// starting point of the chain for the next request for this connection.
	this.$.promises[ conn.index() ] = promise;

	return chain;

};


/**
*   Internal helper function to reset the connection pool
*
*   @private
*   @param {object} [opts] - Options
*/
Pool.prototype.$reset = function ( opts ) {

	// privileged data
	this.$ = {
		ifx  : new Ifx(),
		min  : 0,
		max  : 5,
		next : 0,
		opts : {},
		pool : [],
		promises  : [],
		resolvers : []
	};

	this.options( opts );

};


/**
*   Acquire a connection from the pool
*
*   @param {Connection} [conn] - A specific connection to aquire from the pool.
*          If this is null, a randon connection will be aquired from the pool.
*
*   @return {Promise.<Connection, Error>} - A promise to a connection object or
*           an Error if rejected.
*/
Pool.prototype.acquire = function ( conn ) {

	var self = this;

	if ( conn )  { conn = this.$.pool[ conn.index() ]; }
	if (! conn ) { conn = this.$next(); }


	return this.$promise( conn );

};


/**
*   Set options
*
*   @param {object} opts - Options
*/
Pool.prototype.options = function ( opts ) {
	this.$.opts = opts || {};

	if ( this.$.opts.min ) { this.$.min = parseInt( this.$.opts.min ); }
	if ( this.$.opts.max ) { this.$.max = parseInt( this.$.opts.max ); }
};


/**
*   Release a connection back to the pool
*
*   @param {Connection} conn - Connection object
*/
Pool.prototype.release = function ( conn ) {

	// Release the connection by resolving the first available promise. There will
	// be at least one promise to resolve since we always return a new promise to
	// a connection.
	var resolve = this.$.resolvers[ conn.index() ].shift();
	resolve( conn );

};



var pool = new Pool();
module.exports = pool;

