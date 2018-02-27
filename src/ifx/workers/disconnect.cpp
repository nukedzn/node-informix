
#include "disconnect.h"
#include "../../esqlc.h"


namespace ifx {
namespace workers {

	Disconnect::Disconnect( ifx::conn_t * conn, Nan::Callback * cb ) : Nan::AsyncWorker( cb ), _conn( conn ) {
		// constructor
	}


	Disconnect::~Disconnect() {
		// destructor
	}


	void Disconnect::Execute() {

		int32_t code = esqlc::disconnect( _conn->id.c_str() );

		if ( code < 0 ) {
			SetErrorMessage( esqlc::errmsg( code ).c_str() );
		}

	}


	void Disconnect::HandleOKCallback() {

		// stack-allocated handle scope
		Nan::HandleScope scope;

		// copy connection ID
		Nan::MaybeLocal< v8::String > v8connid = Nan::New< v8::String >( _conn->id );

		// delete connection
		delete _conn;

		v8::Local< v8::Value > argv[] = {
			Nan::Null(),
			v8connid.ToLocalChecked()
		};

		callback->Call( 2, argv, async_resource );

	}

} /* end of namespace workers */
} /* end of namespace ifx */

