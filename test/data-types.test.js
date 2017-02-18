
'use strict';

const expect = require( 'chai' ).expect;
const sinon  = require( 'sinon' );

const Informix   = require( '../lib/informix' );


describe( 'data-types', () => {

	const informix = new Informix( {
		database : 'test@ol_informix1210',
		username : 'informix',
		password : 'informix'
	} );

	const values = {
		decimal : 7.964439875659,
	};

	before( () => {
		return informix.query( 'insert into tdatatypes( decimal ) values(' + values.decimal + ');' )
			.then( ( cursor ) => {
				return cursor.close();
			} );
	} );

	after( () => {
		return informix.query( 'truncate tdatatypes;' )
			.then( ( cursor ) => {
				return cursor.close();
			} );
	} );


	it( 'should fetch decimal values correctly', () => {
		return informix.query( 'select decimal from tdatatypes;' )
			.then( ( cursor ) => {
				return cursor.fetchAll( { close : true } );
			} )
			.then( ( results ) => {
				expect( results ).to.have.length( 1 )
					.with.deep.property( '[0][0]' )
					.that.eql( values.decimal );
			} );
	} );

} );

