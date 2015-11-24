
#include "ifx.h"
#include "workers/connect.h"


namespace ifx {

	// initialise static vars
	Nan::Persistent< v8::Function > Ifx::constructor;


	Ifx::Ifx() {
		// constructor
	}


	Ifx::~Ifx() {
		// destructor
	}


	void Ifx::init( v8::Local< v8::Object > exports ) {

		// stack-allocated handle scope
		Nan::HandleScope scope;

		// prepare constructor template
		v8::Local< v8::FunctionTemplate > tpl = Nan::New< v8::FunctionTemplate >( construct );
		tpl->SetClassName( Nan::New( "Ifx" ).ToLocalChecked() );
		tpl->InstanceTemplate()->SetInternalFieldCount( 1 );

		// prototypes
		Nan::SetPrototypeMethod( tpl, "connect", connect );
		Nan::SetPrototypeMethod( tpl, "prepare", prepare );

		constructor.Reset( tpl->GetFunction() );
		exports->Set( Nan::New( "Ifx" ).ToLocalChecked(), tpl->GetFunction() );

	}


	void Ifx::construct( const Nan::FunctionCallbackInfo< v8::Value > &info ) {

		if (! info.IsConstructCall() ) {

			// invoked as `Ifx(...)`, convert to a constructor call
			const int argc = 1;
			v8::Local< v8::Value > argv[ argc ] = { info[0] };
			v8::Local< v8::Function > c = Nan::New< v8::Function >( constructor );
			return info.GetReturnValue().Set( c->NewInstance( argc, argv ) );

		}

		Ifx * obj = new Ifx();
		obj->Wrap( info.This() );
		info.GetReturnValue().Set( info.This() );

	}

	void Ifx::connect( const Nan::FunctionCallbackInfo< v8::Value > &info ) {

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


	void Ifx::prepare( const Nan::FunctionCallbackInfo< v8::Value > &info ) {

		// return undefined
		info.GetReturnValue().Set( Nan::Undefined() );

	}


} /* end of namespace ifx */

