
'use strict';

/**
*   A node.js native client for IBM Informix.
*   @module informix
*/

var Informix = require( './lib/informix' );


/**
*   Initialise a new {@link Informix} instance
*
*   @param {object} opts - Options
*/
module.exports = function( opts ) {
	return new Informix( opts );
};

