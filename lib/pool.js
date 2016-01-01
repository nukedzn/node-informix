
'use strict';

var debug = require( 'debug' )( 'informix:pool' );
var Ifx = require( 'bindings' )( 'ifx' ).Ifx;

var Connection = require( './connection' );


/**
*   Class representing a connection pool
*
*   @constructor
*   @param {object} [opts] - Constructor options
*/
var Pool = function ( opts ) {
	this.$reset( opts );
};


/**
*   Internal helper function to add a new connection to the pool
*
*   @private
*   @return {Connection|undefined} - A connection object if successful or
*           undefined if unsuccessful.
*/
Pool.prototype.$add = function () {

	var conn;
	var index = ( this.$.pool.length ? this.$.pool.length : 0 );

	if ( index < this.$.max ) {
		var params = {
			database : this.$.opts.database
		};

		if ( this.$.opts.username ) { params.username = this.$.opts.username; }
		if ( this.$.opts.password ) { params.password = this.$.opts.password; }


		debug( '($add) adding new connection to the pool, index: %d', index );
		conn = new Connection( this.$.ifx, this, { index : index } );

		this.$.pool.push( conn );
		this.$.promises.push( conn.connect( params ) );
		this.$.resolvers.push( [] );
	}


	return conn;

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

	if ( this.$.pool.length ) {

		// There should be at least one connection in the pool, try to filter out any
		// idle connections.
		var filter = function ( element, index, array ) {
			// There won't be any resolvers left when all the promises for this
			// connection are resolved.
			return ( self.$.resolvers[ index ].length === 0 );
		};

		conn = this.$.pool.find( filter );

	}


	// Check whether there was an idle connection which could be used.
	if (! conn ) {

		// No idle connections found, try to add a new connection to the pool.
		conn = this.$add();

		if (! conn ) {

			// No idle connections found and couldn't add a new connection to
			// the pool, re-use existing connections in a round robin fashion.
			debug( '($next) no idle connections, reusing %d', this.$.next );
			conn = this.$.pool[ this.$.next ];
			if ( ++this.$.next >= this.$.pool.length ) {
				this.$.next = 0;
			}

		}
	}


	return conn;

};


/**
*   Internal helper function to return a promise for a connection
*
*   @private
*   @param {Connection|string} c - Connection object or context ID string
*   @return {Promise.<Connection, Error>} - A promise to a connection object or
*           an Error if rejected.
*/
Pool.prototype.$promise = function ( c ) {

	var self = this;
	var promise;

	// Take a copy of the existing promise (first ever promise will be from connect())
	// and replace it with a new promise for this connection/context which will be resolved
	// when released back to the pool.

	if ( c instanceof Connection ) {
		promise = this.$.promises[ c.index() ];
		this.$.promises[ c.index() ] = new Promise( function ( resolve, reject ) {
			self.$.resolvers[ c.index() ].push( resolve );
		} );

		debug( '($promise)[ %d ] waiters: %d', c.index(), ( this.$.resolvers[ c.index() ].length - 1 ) );
	} else {
		var ctx = this.$.contexts[ c ];
		promise = ctx.promise;
		ctx.promise = new Promise( function ( resolve, reject ) {
			ctx.resolvers.push( resolve );
		} );

		debug( '($promise)[ %s ] waiters: %d', c, ( ctx.resolvers.length - 1 ) );
	}


	// Return a promise chain which will wait for the last promise created for this
	// connection/context and then return a connection object.
	return promise
		.then( function ( conn ) {
			return conn;
		} );

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
		contexts  : {},
		promises  : [],
		resolvers : []
	};

	this.options( opts );

};


/**
*   Acquire a connection from the pool
*
*   @param {Connection|string} [c] - A connection object or a context ID string
*          to indicate which connection to be aquired from the pool.
*          If this is null, a randon connection will be aquired from the pool.
*
*   @return {Promise.<Connection, Error>} - A promise to a connection object or
*           an Error if rejected.
*/
Pool.prototype.acquire = function ( c ) {

	var self = this;

	if ( (typeof c) === 'string' ) {
		if (! this.$.contexts[ c ] ) {
			this.reserve( c );
		}

		debug( '(acquire)[ %s ]', c );
		return this.$promise( c );
	}


	var conn;
	if ( c instanceof Connection ) {
		conn = c;
	} else {
		conn = this.$next();
	}

	debug( '(acquire)[ %d ]', conn.index() );
	return this.$promise( conn );

};


/**
*   Close a context and release the reserved connection back to the pool
*
*   @param {string} context - Context ID
*   @return {Promise<string, Error>} - A promise to a context ID string which
*           resolves after the context is closed or an Error if rejected.
*/
Pool.prototype.close = function ( context ) {

	var self = this;
	var ctx  = this.$.contexts[ context ];

	debug( '(close)[ %s ] pending promises: %d', context, ctx.resolvers.length );
	return ctx.promise
		.then( function ( conn ) {
			ctx.resolve( conn );
			delete self.$.contexts[ context ];

			return context;
		} );

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
*   @param {Connection|string} c - Connection object or a context ID
*/
Pool.prototype.release = function ( c ) {

	var conn, resolve;

	if ( c instanceof Connection ) {
		debug( '(release)[ %d ]', c.index() );

		conn = c;
		resolve = this.$.resolvers[ c.index() ].shift();
	} else {
		debug( '(release)[ %s ]', c );

		var ctx = this.$.contexts[ c ];
		conn    = ctx.conn;
		resolve = ctx.resolvers.shift();
	}


	// Release the connection by resolving the first available promise. There will
	// be at least one promise to resolve since we always return a new promise to
	// a connection.
	resolve( conn );

};


/**
*   Reserve a connection to be used with a new context
*
*   @param {string} context - Context ID
*   @return {Connection} - A connection object reserved for this context.
*/
Pool.prototype.reserve = function ( context ) {

	if ( this.$.contexts[ context ] ) {
		throw new Error( 'A connection is already reserved for the given context.' );
	}

	debug( '(reserve)[ %s ]', context );

	var conn = this.$next();
	var ctx  = this.$.contexts[ context ] = {
		conn : conn,
		promise   : this.$.promises[ conn.index() ],
		resolve   : false,
		resolvers : []
	};

	this.$.promises[ conn.index() ] = new Promise( function ( resolve, reject ) {
		ctx.resolve = resolve;
	} );


	return conn;

};



module.exports = Pool;

