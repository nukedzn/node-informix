
#include <sstream>

#include "connect.h"
#include "../../esqlc.h"


namespace ifx {
namespace workers {

	Connect::Connect( const ifx::conn_t &conn, Nan::Callback * cb ) : Nan::AsyncWorker( cb ), _conn( conn ) {
		// constructor
	}


	Connect::~Connect() {
		// destructor
	}


	void Connect::Execute() {

		int32_t code = esqlc::connect(
				_conn.id.c_str(),
				_conn.database.c_str(),
				( _conn.username.length() ? _conn.username.c_str() : 0 ),
				( _conn.password.length() ? _conn.password.c_str() : 0 ) );

		if ( code < 0 ) {
			SetErrorMessage( esqlc::errmsg( code ).c_str() );
		} else {
			// release the connection to make it available to other threads
			esqlc::release( _conn.id.c_str() );
		}

	}


	void Connect::HandleOKCallback() {

		// stack-allocated handle scope
		Nan::HandleScope scope;

		v8::Local< v8::Value > argv[] = {
			Nan::Null(),
			Nan::New< v8::String >( _conn.id ).ToLocalChecked()
		};

		callback->Call( 2, argv );

	}

} /* end of namespace workers */
} /* end of namespace ifx */

