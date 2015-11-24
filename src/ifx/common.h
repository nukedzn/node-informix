
#ifndef IFX_COMMON_H
#define IFX_COMMON_H

#include <string>
#include <map>

#include "../esqlc.h"


namespace ifx {

	std::map< std::string, esqlc::stmt_t * > stmts;
	struct connection_t {
		std::string id;
		std::string database;
		std::string username;
		std::string password;
	};


} /* end of namespace ifx */

#endif /* !IFX_COMMON_H */

