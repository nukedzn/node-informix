
'use strict';

var Ifx = require( 'bindings' )( 'ifx' ).Ifx;
var EventEmitter = require( 'events' ).EventEmitter;


/**
*   Informix class
*
*   @constructor
*   @param {object} opts - Constructor options
*/
var Informix = function ( opts ) {

	EventEmitter.call( this );

	// privileged data
	this._$ = {};

	this.options( opts );
	this._$.ifx = new Ifx();

};

Informix.prototype = Object.create( EventEmitter.prototype );


/**
*   Set options
*
*   @param {object} opts - Options
*/
Informix.prototype.options = function ( opts ) {
	this._$.options = opts || {};
};


Informix.prototype.connect = function () {
	return new Promise( function ( resolve, reject ) {
		reject( new Error( 'Not Implemented' ) );
	} );
};


/**
*   Run a SQL query
*
*   @param {string} sql - SQL query to run
*   @return {Promise.<Cursor, Error>} A promise to a results cursor or an Error
*           if rejected.
*/
Informix.prototype.query = function ( sql ) {
	return new Promise( function ( resolve, reject ) {
		reject( new Error( 'Not Implemented' ) );
	} );
};



module.exports = Informix;

