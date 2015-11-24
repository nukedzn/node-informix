
#ifndef IFX_COMMON_H
#define IFX_COMMON_H

#include <string>
#include <map>

#include "../esqlc.h"


namespace ifx {

	struct connection_t {
		std::string id;
		std::string database;
		std::string username;
		std::string password;
	};

	struct statement_t {
		std::string id;
		std::string stmt;
	};

	typedef std::map< std::string, esqlc::stmt_t * > stmts_t;

} /* end of namespace ifx */

#endif /* !IFX_COMMON_H */

