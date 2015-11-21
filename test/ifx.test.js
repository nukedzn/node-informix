/* jshint expr: true */

'use strict';

var expect = require( 'chai' ).expect;
var ifx    = require( 'bindings' )( 'ifx' );


describe( 'ifx', function () {

	context( 'when username and password is not specified', function () {

		/**
		*   Note: This test assumes the default user doesn't have permissions
		*         to connect to the database.
		*/
		it( 'should handle connection errors', function ( done ) {
			ifx.connect( 'test', 'conn:id:1001', function ( err, conn ) {
				expect( err ).to.be.an.instanceof( Error );
				expect( err.message ).to.be.string( '[-951] Incorrect password or user %s is not known on the database server.' );
				expect( conn ).to.be.undefined;
				done();
			} );
		} );

	} );

} );

