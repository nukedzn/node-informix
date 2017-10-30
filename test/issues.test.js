
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
						'c char(1) default \'A\' not null' +
					');'
				)
				.then( ( cursor ) => {
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

		it( 'should return correct length when re-using prepared statements with char columns' );
	} );

} );

