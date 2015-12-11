
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


Pool.prototype.$promise = function ( conn ) {

	var self = this;
	var chain, promise;

	promise = new Promise( function ( resolve, reject ) {
		self.$.resolvers[ conn.index() ].push( resolve );
	} );

	if ( this.$.promises[ conn.index() ] ) {
		// Create a promise chain which will wait for the last promise created
		// (i.e. queued) for this connection and return the connection.
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
		chain = conn.connect( params );
	}

	this.$.promises[ conn.index() ] = promise;
	return chain;

};


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


Pool.prototype.release = function ( conn ) {

	var resolve = this.$.resolvers[ conn.index() ].shift();
	resolve( conn );

};



var pool = new Pool();
module.exports = pool;

