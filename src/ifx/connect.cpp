
#include <sstream>

#include "connect.h"
#include "../esqlc.h"


namespace ifx {

	Connect::Connect( const connection_t &conn, Nan::Callback * cb ) : Nan::AsyncWorker( cb ), _conn( conn ) {
		// constructor
	}


	Connect::~Connect() {
		// destructor
	}


	void Connect::Execute() {
		int32_t code = esqlc::connect( _conn.db.c_str(), _conn.id.c_str() );
		if ( code < 0 ) {
			SetErrorMessage( esqlc::errmsg( code ).c_str() );
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

}

