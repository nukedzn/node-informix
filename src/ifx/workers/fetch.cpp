
#include "fetch.h"
#include "../../esqlc.h"


namespace ifx {
namespace workers {

	Fetch::Fetch( ifx::cursor_t * cursor, Nan::Callback * cb ) : Nan::AsyncWorker( cb ), _cursor( cursor ) {
		// constructor
	}


	Fetch::~Fetch() {
		// destructor
	}


	void Fetch::Execute() {

		int32_t code = 0;

		// acquire the connection for this thread
		code = esqlc::acquire( _cursor->stmt->connid.c_str() );
		if ( code < 0 ) {
			return SetErrorMessage( esqlc::errmsg( code ).c_str() );
		}

		code = esqlc::fetch( _cursor->id.c_str(), _cursor->outsqlda );

		if ( code < 0 ) {
			SetErrorMessage( esqlc::errmsg( code ).c_str() );
		}

		// release the connection
		esqlc::release( _cursor->stmt->connid.c_str() );

	}


	void Fetch::HandleOKCallback() {

		// stack-allocated handle scope
		Nan::HandleScope scope;

		// TODO: return result data
		v8::Local< v8::Value > argv[] = {
			Nan::Null(),
			Nan::New< v8::String >( _cursor->id ).ToLocalChecked()
		};

		callback->Call( 2, argv );

		if ( _cursor->outsqlda ) {
			free( _cursor->outsqlda );
		}

	}


} /* end of namespace workers */
} /* end of namespace ifx */

