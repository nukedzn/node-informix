
'use strict';

const expect = require( 'chai' ).expect;
const Informix = require( '../lib/informix' );


describe( 'issues', () => {

	const informix = new Informix( {
		database : 'test@ol_informix1210',
		username : 'informix',
		password : 'informix'
	} );

	context( 'issue #45', () => {
		before( () => {
			return informix
				.query(
					'create table tissue45(' +
						'c char(2) default \'AA\' not null' +
					');'
				)
				.then( ( cursor ) => {
					return cursor.close();
				} )
				.then( () => {
					return informix.query( 'insert into tissue45 (c) values ( \'CC\' );' );
				} )
				.then( ( cursor) => {
					return cursor.close();
				} );
		} );

		after( () => {
			return informix
				.query(
					'drop table tissue45;'
				)
				.then( ( cursor ) => {
					return cursor.close();
				} );
		} );

		it( 'should return correct length when re-using prepared statements with char columns', () => {
			let stmt;

			return informix
				.prepare( 'select c from tissue45 limit 1;' )
				.then( ( s ) => {
					stmt = s;
					return stmt.exec();
				} )
				.then( ( cursor ) => {
					return cursor.fetchAll( { close : true } );
				} )
				.then( ( results ) => {
					expect( results ).to.have.length( 1 )
						.with.nested.property( '[0][0]' )
						.with.length( 2 );
				} )
				.then( () => {
					return stmt.exec();
				} )
				.then( ( cursor ) => {
					return cursor.fetchAll( { close : true } );
				} )
				.then( ( results ) => {
					expect( results ).to.have.length( 1 )
						.with.nested.property( '[0][0]' )
						.with.length( 2 );
				} );
		} );
	} );
} );

