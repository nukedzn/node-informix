
#include <nan.h>

#include "ifx/workers/connect.h"


void connect( const Nan::FunctionCallbackInfo< v8::Value > &info ) {

	// basic validation
	if ( info.Length() != 2 ) {
		return Nan::ThrowError( "Invalid number of arguments" );
	}

	if (! info[0]->IsObject() ) {
		return Nan::ThrowTypeError( "Connection parameters must be an object" );
	}

	if (! info[1]->IsFunction() ) {
		return Nan::ThrowTypeError( "Callback must be a function" );
	}


	v8::Local< v8::Object > params = info[0].As< v8::Object >();

	// validate mandatory connection params
	if ( (! params->Has( Nan::New< v8::String >( "id" ).ToLocalChecked() ) )
		|| (! params->Has( Nan::New< v8::String >( "database" ).ToLocalChecked() ) ) ) {
		return Nan::ThrowTypeError( "Connection parameter 'id' and 'database' are mandatory" );
	}


	std::string username;
	std::string password;
	Nan::Utf8String id( params->Get( Nan::New< v8::String >( "id" ).ToLocalChecked() ) );
	Nan::Utf8String database( params->Get( Nan::New< v8::String >( "database" ).ToLocalChecked() ) );
	Nan::Callback * cb = new Nan::Callback( info[1].As< v8::Function >() );

	if ( params->Has( Nan::New< v8::String >( "username" ).ToLocalChecked() ) ) {
		Nan::Utf8String user( params->Get( Nan::New< v8::String >( "username" ).ToLocalChecked() ) );
		username = std::string( *user );
	}

	if ( params->Has( Nan::New< v8::String >( "password" ).ToLocalChecked() ) ) {
		Nan::Utf8String pass( params->Get( Nan::New< v8::String >( "password" ).ToLocalChecked() ) );
		password = std::string( *pass );
	}


	// schedule async connection worker
	const ifx::connection_t conn = { *id, *database, username, password };
	Nan::AsyncQueueWorker( new ifx::workers::Connect( conn, cb ) );

	// return undefined
	info.GetReturnValue().Set( Nan::Undefined() );

}


void prepare( const Nan::FunctionCallbackInfo< v8::Value > &info ) {

	// return undefined
	info.GetReturnValue().Set( Nan::Undefined() );

}


void init( v8::Local< v8::Object > exports ) {
	exports->Set( Nan::New( "connect" ).ToLocalChecked(), Nan::New< v8::FunctionTemplate >( connect )->GetFunction() );
	exports->Set( Nan::New( "prepare" ).ToLocalChecked(), Nan::New< v8::FunctionTemplate >( prepare )->GetFunction() );
}

NODE_MODULE( ifx, init )

