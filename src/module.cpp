
#include <nan.h>

#include "ifx/connect.h"


void connect( const Nan::FunctionCallbackInfo< v8::Value > &info ) {


	v8::Local< v8::Object > obj = info[0].As< v8::Object >();
	Nan::Callback * cb = new Nan::Callback( info[1].As< v8::Function >() );

	Nan::Utf8String database( obj->Get( Nan::New< v8::String >( "database" ).ToLocalChecked() ) );
	Nan::Utf8String id( obj->Get( Nan::New< v8::String >( "id" ).ToLocalChecked() ) );
	const ifx::connection_t conn = { *id, *database };

	Nan::AsyncQueueWorker( new ifx::Connect( conn, cb ) );

	// return undefined
	info.GetReturnValue().Set( Nan::Undefined() );

}


void init( v8::Local< v8::Object > exports ) {
	exports->Set( Nan::New( "connect" ).ToLocalChecked(), Nan::New< v8::FunctionTemplate >( connect )->GetFunction() );
}

NODE_MODULE( ifx, init )

