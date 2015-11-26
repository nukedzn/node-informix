
#ifndef IFX_COMMON_H
#define IFX_COMMON_H

#include <string>
#include <map>
#include <list>
#include <sqlda.h>

#include "../esqlc.h"


namespace ifx {

	// forward declarations
	struct cursor_t;


	struct conn_t {
		std::string id;
		std::string database;
		std::string username;
		std::string password;
	};


	struct stmt_t {
		std::string connid;
		std::string id;
		std::string stmt;
		std::map< std::string, cursor_t * > cursors;

		ifx_sqlda_t * insqlda;
		ifx_sqlda_t * outsqlda;

		stmt_t() : insqlda( 0 ), outsqlda( 0 ) {};
	};

	struct cursor_t {
		std::string id;
		std::list< char * > args;

		stmt_t * stmt;
		ifx_sqlda_t * insqlda;
	};


	typedef std::map< std::string, stmt_t * > stmts_t;

} /* end of namespace ifx */

#endif /* !IFX_COMMON_H */

