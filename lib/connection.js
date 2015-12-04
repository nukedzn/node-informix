
'use strict';

var uuid = require( 'uuid' );


/**
*   Class representing a connection to a database
*
*   @constructor
*   @param {Ifx} ifx - Native object instance
*   @param {object} [opts] - Constructor options
*/
var Connection = function ( ifx, opts ) {

	// privileged data
	this._$ = {};

	this._$.ifx = ifx;
	this._$.id  = uuid.v4();

};


Connection.prototype.connect = function ( params ) {

	var self = this;

	return new Promise( function ( resolve, reject ) {
		params.id = self._$.id;
		self._$.ifx.connect( params, function ( err, connid ) {
			if ( err ) {
				return reject( err );
			}

			resolve( self );
		} );
	} );

};


Connection.prototype.prepare = function ( stmt ) {};



module.exports = Connection;


