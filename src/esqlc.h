
#ifndef ESQLC_H
#define ESQLC_H

#include <stdint.h>
#include <string>


namespace esqlc {

	int32_t connect( const char * db, const char * id );
	std::string errmsg( int32_t code );

}

#endif /* !ESQLC_H */

