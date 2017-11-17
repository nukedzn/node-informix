
'use strict';

const expect = require( 'chai' ).expect;
const sinon  = require( 'sinon' );
const moment = require( 'moment' );

const Informix   = require( '../lib/informix' );


describe( 'data-types', () => {

	const informix = new Informix( {
		database : 'test@ol_informix1210',
		username : 'informix',
		password : 'informix'
	} );

	const values = {
		dt : '2017-02-17 17:20:56.002',
		date : new Date( '2017-02-18' ),
		decimal : 7.964439875659,
	};

	before( () => {
		return informix.query(
				'insert into tdatatypes(' +
					'dt, ' +
					'date, ' +
					'decimal ' +
				') ' +
				'values(' +
					'"' + values.dt + '", ' +
					moment( values.date ).format( '[mdy(]MM,DD,YYYY[), ]' ) +
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
					.with.nested.property( '[0][0]' )
					.that.is.a( 'number' );
			} );
	} );

	it( 'should return date values in ISO format', () => {
		return informix.query( 'select date from tdatatypes;' )
			.then( ( cursor ) => {
				return cursor.fetchAll( { close : true } );
			} )
			.then( ( results ) => {
				expect( results ).to.have.length( 1 )
					.with.nested.property( '[0][0]' )
					.that.eql( values.date.toISOString().slice(0, -1) );
			} );
	} );

	it( 'should return datetime values in ISO format', () => {
		return informix.query( 'select dt from tdatatypes;' )
			.then( ( cursor ) => {
				return cursor.fetchAll( { close : true } );
			} )
			.then( ( results ) => {
				expect( results ).to.have.length( 1 )
					.with.nested.property( '[0][0]' )
					.that.eql( new Date( values.dt ).toISOString().slice(0, -1) );
			} );
	} );

	it( 'should fetch decimal values correctly', () => {
		return informix.query( 'select decimal from tdatatypes;' )
			.then( ( cursor ) => {
				return cursor.fetchAll( { close : true } );
			} )
			.then( ( results ) => {
				expect( results ).to.have.length( 1 )
					.with.nested.property( '[0][0]' )
					.that.eql( values.decimal );
			} );
	} );

} );

