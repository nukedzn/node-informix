
#include <nan.h>

#include "ifx/connect.h"


void connect( const Nan::FunctionCallbackInfo< v8::Value > &info ) {

	Nan::Callback * cb = new Nan::Callback( info[1].As< v8::Function >() );

	Nan::Utf8String id( info[0] );
	Nan::AsyncQueueWorker( new ifx::Connect( *id, cb ) );

	// return undefined
	info.GetReturnValue().Set( Nan::Undefined() );

}


void init( v8::Local< v8::Object > exports ) {
	exports->Set( Nan::New( "connect" ).ToLocalChecked(), Nan::New< v8::FunctionTemplate >( connect )->GetFunction() );
}

NODE_MODULE( ifx, init )

