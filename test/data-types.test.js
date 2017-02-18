
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
		dt : '2017-02-17 17:20:56.002',
		decimal : 7.964439875659,
	};

	before( () => {
		return informix.query(
				'insert into tdatatypes(' +
					'dt, ' +
					'decimal ' +
				') ' +
				'values(' +
					'"' + values.dt + '", ' +
					values.decimal +
				');'
			)
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


	it( 'should fetch int8/serial8 values correctly', () => {
		return informix.query( 'select id from tdatatypes;' )
			.then( ( cursor ) => {
				return cursor.fetchAll( { close : true } );
			} )
			.then( ( results ) => {
				expect( results ).to.have.length( 1 )
					.with.deep.property( '[0][0]' )
					.that.is.a( 'number' );
			} );
	} );

	it( 'should return datetime values in ISO format', () => {
		return informix.query( 'select dt from tdatatypes;' )
			.then( ( cursor ) => {
				return cursor.fetchAll( { close : true } );
			} )
			.then( ( results ) => {
				expect( results ).to.have.length( 1 )
					.with.deep.property( '[0][0]' )
					.that.eql( new Date( values.dt ).toISOString() );
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

