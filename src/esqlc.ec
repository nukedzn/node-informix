
#include "esqlc.h"


void esqlc_connect( const char * db, const char * id ) {

	EXEC SQL BEGIN DECLARE SECTION;

	const char * esql_db = db;
	const char * esql_id = id;

	EXEC SQL END DECLARE SECTION;


	EXEC SQL connect to :esql_db as :esql_id;

	// FIXME: error handling?

} ;

