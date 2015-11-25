
#ifndef ESQLC_H
#define ESQLC_H

#include <stdint.h>
#include <string>
#include <map>
#include <sqlda.h>


class esqlc {
public:

	static int32_t connect( const char * id, const char * database, const char * username = 0, const char * password = 0 );
	static int32_t prepare( const char * conn, const char * id, const char * stmt, ifx_sqlda_t * insqlda, ifx_sqlda_t * outsqlda );
	static int32_t run( const char * sid, const char * cid, ifx_sqlda_t * insqlda );
	static int32_t closeS( const char * sid );
	static int32_t closeC( const char * cid );

	static int32_t acquire( const char * conn );
	static int32_t release( const char * conn );

	static std::string errmsg( int32_t code );

};

#endif /* !ESQLC_H */

