
#ifndef IFX_TYPES_H
#define IFX_TYPES_H

#include <string>
#include <map>
#include <list>
#include <sqlda.h>
#include <sqltypes.h>


namespace ifx {

	// forward declarations
	struct cursor_t;
	struct stmt_t;


	typedef std::map< std::string, stmt_t * > stmts_t;
	typedef std::map< std::string, cursor_t * > cursors_t;

	typedef std::list< char * > cursor_args_t;


	struct conn_t {
		std::string id;
		std::string database;
		std::string username;
		std::string password;
	};


	struct cursor_t {
		std::string id;
		cursor_args_t args;
		char * data;

		stmt_t * stmt;
		ifx_sqlda_t * insqlda;
		ifx_sqlda_t * outsqlda;

		cursor_t() : data( 0 ), stmt( 0 ), insqlda( 0 ), outsqlda( 0 ) {};
		~cursor_t() {

			for ( cursor_args_t::const_iterator it = args.begin(); it != args.end(); it++ ) {
				delete [] (* it);
			}

			if ( data ) {
				delete [] data;
			}

			if ( insqlda ) {
				delete insqlda;
			}

			if ( outsqlda ) {
				delete outsqlda;
			}

		}
	};


	struct stmt_t {
		std::string connid;
		std::string id;
		std::string stmt;
		cursors_t cursors;

		ifx_sqlda_t * insqlda;
		ifx_sqlda_t * outsqlda;

		stmt_t() : insqlda( 0 ), outsqlda( 0 ) {};
		~stmt_t() {

			for ( cursors_t::iterator it = cursors.begin(); it != cursors.end(); it++ ) {
				delete it->second;
			}

			if ( insqlda ) {
				delete insqlda;
			}

			if ( outsqlda ) {
				delete outsqlda;
			}

		}
	};

} /* end of namespace ifx */

#endif /* !IFX_TYPES_H */

