
#include "connect.h"
#include "../esqlc.h"


namespace ifx {

	Connect::Connect( std::string id, Nan::Callback * cb ) : Nan::AsyncWorker( cb ), _id( id ) {
		// constructor
	}


	Connect::~Connect() {
		// destructor
	}


	void Connect::Execute() {
		// TODO:
		esqlc_connect( "test@ol_informix1210", _id.c_str() );
	}


	void Connect::HandleOKCallback() {

		// stack-allocated handle scope
		Nan::HandleScope scope;

		v8::Local< v8::Value > argv[] = {
			Nan::Null(),
			Nan::New< v8::String >( _id ).ToLocalChecked()
		};

		callback->Call( 2, argv );

	}

}

