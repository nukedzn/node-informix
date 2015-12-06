
'use strict';

/**
*   A node.js native client for IBM Informix.
*   @module informix
*/

var Informix = require( './lib/informix' );
var Ifx      = require( 'bindings' )( 'ifx' ).Ifx;


/**
*   Create a new client by initialising a new {@link Informix} instance
*
*   @param {object} opts - Options
*/
module.exports = function( opts ) {
	return new Informix( opts );
};


/**
*   IBM Informix client
*
*   @type {Informix}
*/
module.exports.Informix = Informix;


/**
*   Low level client binding
*
*   @type {Ifx}
*/
module.exports.Ifx = Ifx;

