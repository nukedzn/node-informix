
'use strict';

var expect = require( 'chai' ).expect;
var ifx    = require( 'bindings' )( 'ifx' );


describe( 'ifx', function () {

	it( 'should have be able to connect to a database', function ( done ) {
		ifx.connect( 'test', 'id-1', function ( err, conn ) {
			if ( err ) {
				return done( err );
			}

			expect( conn ).to.eql( 'id-1' );
			done();
		} )
	} );

} );

