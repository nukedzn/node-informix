
#include <nan.h>

#include "ifx/connect.h"


void connect( const Nan::FunctionCallbackInfo< v8::Value > &info ) {

	Nan::Callback * cb = new Nan::Callback( info[2].As< v8::Function >() );

	Nan::Utf8String db( info[0] );
	Nan::Utf8String id( info[1] );
	const ifx::connection_t conn = { *id, *db };

	Nan::AsyncQueueWorker( new ifx::Connect( conn, cb ) );

	// return undefined
	info.GetReturnValue().Set( Nan::Undefined() );

}


void init( v8::Local< v8::Object > exports ) {
	exports->Set( Nan::New( "connect" ).ToLocalChecked(), Nan::New< v8::FunctionTemplate >( connect )->GetFunction() );
}

NODE_MODULE( ifx, init )

