
#ifndef ESQLC_H
#define ESQLC_H

#include <stdint.h>
#include <string>


namespace esqlc {

	int32_t connect( const char * id, const char * database, const char * username = 0, const char * password = 0 );
	std::string errmsg( int32_t code );

}

#endif /* !ESQLC_H */

