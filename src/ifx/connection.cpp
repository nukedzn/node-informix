
#include "connection.h"


namespace ifx {

	Connection::Connection( std::string id, Nan::Callback * cb ) : Nan::AsyncWorker( cb ), _id( id ) {
		// constructor
	}


	Connection::~Connection() {
		// destructor
	}


	void Connection::Execute() {
		// TODO:
		// EXEC SQL connect to :db as :id
	}


	void Connection::HandleOKCallback() {

		// stack-allocated handle scope
		Nan::HandleScope scope;

		v8::Local< v8::Value > argv[] = {
			Nan::Null(),
			Nan::New< v8::String >( _id ).ToLocalChecked()
		};

		callback->Call( 2, argv );

	}

}

