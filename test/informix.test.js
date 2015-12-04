
'use strict';

var expect   = require( 'chai' ).expect;
var informix = require( '../' );
var Informix = require( '../' ).Informix;


describe( 'informix', function () {

	context( 'factory function', function () {
		it( 'should create a new client instance', function () {
			var client = informix();
			expect( client ).to.be.an.instanceof( Informix );
		} );
	} );

} );

