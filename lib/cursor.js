
'use strict';

var uuid = require( 'uuid' );


/**
*   Class representing a cursor to a resultset
*
*   @constructor
*   @param {Ifx} ifx - Native object instance
*/
var Cursor = function ( ifx ) {

	// privileged data
	this._$ = {
		id  : '_' + uuid.v4().replace( /\-/g, 's' ),
		ifx : ifx
	};

};


/**
*   Return cursor ID
*
*   @return {string} - ID generated for this cursor object.
*/
Cursor.prototype.id = function () {
	return this._$.id;
};


/**
*   Fetch a result
*
*   @return {Promise.<Array|null, Error>} A promise to a results array (or null
*           if no more results) or an Error if rejected.
*/
Cursor.prototype.fetch = function () {

	var self = this;

	return new Promise( function ( resolve, reject ) {
		self._$.ifx.fetch( self._$.id, function ( err, result ) {
			if ( err ) {
				return reject( err );
			}

			resolve( result );
		} );
	} );

};


/**
*   Fetch all results
*
*   @return {Promise.<Array, Error>} A promise to an array of results or an
*           Error if rejected.
*/
Cursor.prototype.fetchAll = function () {

	var self = this;

	return new Promise( function ( resolve, reject ) {
		var results = [];
		var fetcher = function ( err, result ) {
			if ( err ) {
				return reject( err );
			}

			if ( result ) {
				results.push( result );
				return self._$.ifx.fetch( self._$.id, fetcher );
			}

			resolve( results );
		};

		self._$.ifx.fetch( self._$.id, fetcher );
	} );

};



module.exports = Cursor;

