
#ifndef IFX_TYPES_H
#define IFX_TYPES_H

#include <string>
#include <map>
#include <list>
#include <sqlda.h>
#include <sqltypes.h>
#include <sqlhdr.h>


namespace ifx {

	// forward declarations
	struct conn_t;
	struct cursor_t;
	struct stmt_t;


	typedef std::map< std::string, conn_t * > conns_t;
	typedef std::map< std::string, stmt_t * > stmts_t;
	typedef std::map< std::string, cursor_t * > cursors_t;

	typedef std::list< char * > cursor_args_t;


	struct cursor_t {
		std::string id;
		cursor_args_t args;
		char * data;

		stmt_t * stmt;
		ifx_sqlda_t * insqlda;
		ifx_sqlda_t * outsqlda;

		int32_t serial;

		cursor_t() : data( 0 ), stmt( 0 ), insqlda( 0 ), outsqlda( 0 ) {}
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
		std::string id;
		std::string stmt;
		int32_t type;

		cursors_t cursors;

		conn_t * conn;
		ifx_sqlda_t * insqlda;
		ifx_sqlda_t * outsqlda;

		stmt_t() : conn( 0 ), insqlda( 0 ), outsqlda( 0 ) {}
		~stmt_t() {

			for ( cursors_t::iterator it = cursors.begin(); it != cursors.end(); it++ ) {
				delete it->second;
			}

#if _WIN32
			SqlFreeMem( insqlda, SQLDA_FREE );
			SqlFreeMem( outsqlda, SQLDA_FREE );
#else
			if ( insqlda ) {
				delete insqlda;
			}

			if ( outsqlda ) {
				delete outsqlda;
			}
#endif

		}
	};


	struct conn_t {
		std::string id;
		std::string database;
		std::string username;
		std::string password;

		stmts_t stmts;

		~conn_t() {
			for ( stmts_t::iterator it = stmts.begin(); it != stmts.end(); it++ ) {
				delete it->second;
			}
		}
	};

} /* end of namespace ifx */

#endif /* !IFX_TYPES_H */

