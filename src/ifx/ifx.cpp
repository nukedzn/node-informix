
#include <cstring>
#include <sqlhdr.h>

#include "ifx.h"
#include "workers/connect.h"
#include "workers/stmtprepare.h"
#include "workers/stmtexec.h"
#include "workers/stmtfree.h"
#include "workers/fetch.h"
#include "workers/cursorclose.h"


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
		Nan::SetPrototypeMethod( tpl, "exec", exec );
		Nan::SetPrototypeMethod( tpl, "fetch", fetch );
		Nan::SetPrototypeMethod( tpl, "close", close );
		Nan::SetPrototypeMethod( tpl, "free", free );

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
		const ifx::conn_t conn = { *id, *database, username, password };
		Nan::AsyncQueueWorker( new ifx::workers::Connect( conn, cb ) );

		// return undefined
		info.GetReturnValue().Set( Nan::Undefined() );

	}


	void Ifx::prepare( const Nan::FunctionCallbackInfo< v8::Value > &info ) {

		// basic validation
		if ( info.Length() != 4 ) {
			return Nan::ThrowError( "Invalid number of arguments" );
		}

		if (! info[0]->IsString() ) {
			return Nan::ThrowTypeError( "Connection ID must be a string" );
		}

		if (! info[1]->IsString() ) {
			return Nan::ThrowTypeError( "Statement ID must be a string" );
		}

		if (! info[2]->IsString() ) {
			return Nan::ThrowTypeError( "Statement must be a string" );
		}

		if (! info[3]->IsFunction() ) {
			return Nan::ThrowTypeError( "Callback must be a function" );
		}


		// unwrap ourself
		Ifx * self = ObjectWrap::Unwrap< Ifx >( info.Holder() );

		// grab JS arguments
		Nan::Utf8String utf8conn ( info[0] );
		Nan::Utf8String utf8sid ( info[1] );
		Nan::Utf8String utf8stmt ( info[2] );
		Nan::Callback * cb = new Nan::Callback( info[3].As< v8::Function >() );

		// check whether we already have a prepared statement with the same ID
		ifx::stmt_t * stmt = self->_stmts[ *utf8sid ];
		if ( stmt ) {
			return Nan::ThrowError( "A Statement is already prepared with the same ID" );
		}

		// prepare statement data structures
		stmt = new ifx::stmt_t();
		stmt->connid = *utf8conn;
		stmt->id = *utf8sid;
		stmt->stmt = *utf8stmt;

		// update internal reference
		self->_stmts[ stmt->id ] = stmt;

		// schedule async worker
		Nan::AsyncQueueWorker( new ifx::workers::StmtPrepare( stmt, cb ) );


		// return undefined
		info.GetReturnValue().Set( Nan::Undefined() );

	}


	void Ifx::exec( const Nan::FunctionCallbackInfo< v8::Value > &info ) {

		// basic validation
		if ( info.Length() < 3 ) {
			return Nan::ThrowError( "Invalid number of arguments" );
		}

		if (! info[0]->IsString() ) {
			return Nan::ThrowTypeError( "Statement ID must be a string" );
		}

		if (! info[1]->IsString() ) {
			return Nan::ThrowTypeError( "Cursor ID must be a string" );
		}

		if (! info[info.Length() - 1]->IsFunction() ) {
			return Nan::ThrowTypeError( "Callback must be a function" );
		}

		if (! info[2]->IsFunction () ) {
			if ( (! info[2]->IsString() ) && (! info[2]->IsArray() ) ) {
				return Nan::ThrowTypeError( "Statement args must be a string or an array" );
			}
		}


		// unwrap ourself
		Ifx * self = ObjectWrap::Unwrap< Ifx >( info.Holder() );

		Nan::Utf8String utf8stmtid( info[0] );
		ifx::stmt_t * stmt = self->_stmts[ *utf8stmtid ];

		if (! stmt ) {
			return Nan::ThrowError( "Invalid statement ID" );
		}

		Nan::Utf8String utf8curid( info[1] );
		if ( stmt->cursors[ *utf8curid ] || self->_cursors[ *utf8curid ] ) {
			return Nan::ThrowError( "A cursor with the same ID already exists" );
		}


		// SQL descriptor area
		ifx::cursor_t * cursor = new ifx::cursor_t();
		ifx_sqlda_t * insqlda = 0;

		if ( info.Length() > 3 ) {

			insqlda = new ifx_sqlda_t();
			std::memset( insqlda, 0, sizeof( ifx_sqlda_t ) );

			// FIXME: can we get away with only using CSTRINGTYPE data?

			if ( info[2]->IsString() ) {

				Nan::Utf8String utf8arg( info[2] );
				size_t size = ( utf8arg.length() + 1 );
				char * arg  = new char[ size ];

				std::strncpy( arg, *utf8arg, size );
				cursor->args.push_back( arg );

				insqlda->sqld     = 1;
				insqlda->sqlvar   = new ifx_sqlvar_t[1];
				insqlda->desc_occ = 0;

				std::memset( insqlda->sqlvar, 0, sizeof( ifx_sqlvar_t[1] ) );
				insqlda->sqlvar[0].sqltype = CSTRINGTYPE;
				insqlda->sqlvar[0].sqllen  = size;
				insqlda->sqlvar[0].sqldata = arg;

			} else {

				char * arg;
				v8::Local< v8::Array > args = info[2].As< v8::Array >();

				insqlda->sqld     = args->Length();
				insqlda->sqlvar   = new ifx_sqlvar_t[ args->Length() ];
				insqlda->desc_occ = 0;

				for ( uint32_t i = 0; i < args->Length(); i++ ) {

					Nan::Utf8String utf8arg( args->Get( Nan::New< v8::Integer >( i ) ) );
					size_t size = ( utf8arg.length() + 1 );
					arg = new char[ size ];

					std::strncpy( arg, *utf8arg, size );
					cursor->args.push_back( arg );

					std::memset( insqlda->sqlvar, 0, sizeof( ifx_sqlvar_t[ args->Length() ] ) );
					insqlda->sqlvar[i].sqltype = CSTRINGTYPE;
					insqlda->sqlvar[i].sqllen  = size;
					insqlda->sqlvar[i].sqldata = arg;

				}

			}
		}


		// prepare cursor data structures
		cursor->id      = *utf8curid;
		cursor->stmt    = stmt;
		cursor->insqlda = insqlda;

		// update internal references
		self->_cursors[ cursor->id ] = cursor;

		// schedule async worker
		Nan::Callback * cb = new Nan::Callback( info[info.Length() - 1].As< v8::Function >() );
		Nan::AsyncQueueWorker( new ifx::workers::StmtExec( cursor, cb ) );


		// return undefined
		info.GetReturnValue().Set( Nan::Undefined() );

	}


	void Ifx::fetch( const Nan::FunctionCallbackInfo< v8::Value > &info ) {

		// basic validation
		if ( info.Length() != 2 ) {
			return Nan::ThrowError( "Invalid number of arguments" );
		}

		if (! info[0]->IsString() ) {
			return Nan::ThrowTypeError( "Cursor ID must be a string" );
		}

		if (! info[1]->IsFunction() ) {
			return Nan::ThrowTypeError( "Callback must be a function" );
		}


		// unwrap ourself
		Ifx * self = ObjectWrap::Unwrap< Ifx >( info.Holder() );

		Nan::Utf8String utf8curid( info[0] );
		ifx::cursor_t * cursor = self->_cursors[ *utf8curid ];

		if (! cursor ) {
			return Nan::ThrowError( "Invalid cursor ID" );
		}


		if ( (! cursor->outsqlda ) && cursor->stmt->outsqlda ) {

			cursor->outsqlda = new ifx_sqlda_t();
			std::memcpy( cursor->outsqlda, cursor->stmt->outsqlda, sizeof( ifx_sqlda_t ) );

			// calculate the size of the output data buffer we need
			size_t size = 0;
			ifx_sqlvar_t * sqlvar = cursor->outsqlda->sqlvar;
			for ( size_t i = 0; i < static_cast< size_t >( cursor->outsqlda->sqld ); i++ ) {

				if ( sqlvar->sqltype == SQLCHAR ) {
					sqlvar->sqllen += 1;
				}

				size = rtypalign( size, sqlvar->sqltype );
				size += rtypmsize( sqlvar->sqltype, sqlvar->sqllen );

				sqlvar++;

			}

			// new output data buffer
			cursor->data = new char[ size ];

			// update sqlvar->sqldata refereces
			size   = 0;
			sqlvar = cursor->outsqlda->sqlvar;
			for ( size_t i = 0; i < static_cast< size_t >( cursor->outsqlda->sqld ); i++ ) {
				size = rtypalign( size, sqlvar->sqltype );
				sqlvar->sqldata = ( cursor->data + size );

				size += rtypmsize( sqlvar->sqltype, sqlvar->sqllen );
				sqlvar++;
			}

		}

		// schedule async worker
		Nan::Callback * cb = new Nan::Callback( info[1].As< v8::Function >() );
		Nan::AsyncQueueWorker( new ifx::workers::Fetch( cursor, cb ) );


		// return undefined
		info.GetReturnValue().Set( Nan::Undefined() );

	}


	void Ifx::close( const Nan::FunctionCallbackInfo< v8::Value > &info ) {

		// basic validation
		if ( info.Length() != 2 ) {
			return Nan::ThrowError( "Invalid number of arguments" );
		}

		if (! info[0]->IsString() ) {
			return Nan::ThrowTypeError( "Cursor ID must be a string" );
		}

		if (! info[1]->IsFunction() ) {
			return Nan::ThrowTypeError( "Callback must be a function" );
		}


		// unwrap ourself
		Ifx * self = ObjectWrap::Unwrap< Ifx >( info.Holder() );

		Nan::Utf8String utf8curid( info[0] );
		ifx::cursor_t * cursor = self->_cursors[ *utf8curid ];

		if (! cursor ) {
			return Nan::ThrowError( "Invalid cursor ID" );
		}


		// FIXME: Deleting this here means we can't recover from any failures within
		//        the async worker.
		// update internal references
		self->_cursors.erase( *utf8curid );

		// schedule async worker
		Nan::Callback * cb = new Nan::Callback( info[1].As< v8::Function >() );
		Nan::AsyncQueueWorker( new ifx::workers::CursorClose( cursor, cb ) );


		// return undefined
		info.GetReturnValue().Set( Nan::Undefined() );

	}


	void Ifx::free( const Nan::FunctionCallbackInfo< v8::Value > &info ) {

		// basic validation
		if ( info.Length() != 2 ) {
			return Nan::ThrowError( "Invalid number of arguments" );
		}

		if (! info[0]->IsString() ) {
			return Nan::ThrowTypeError( "Statement ID must be a string" );
		}

		if (! info[1]->IsFunction() ) {
			return Nan::ThrowTypeError( "Callback must be a function" );
		}


		// unwrap ourself
		Ifx * self = ObjectWrap::Unwrap< Ifx >( info.Holder() );

		Nan::Utf8String utf8stmtid( info[0] );
		ifx::stmt_t * stmt = self->_stmts[ *utf8stmtid ];

		if (! stmt ) {
			return Nan::ThrowError( "Invalid statement ID" );
		}

		if ( stmt->cursors.size() ) {
			return Nan::ThrowError( "Cursors need to be closed" );
		}

		// FIXME: Deleting this here means we can't recover from any failures within
		//        the async worker.
		// update internal references
		self->_stmts.erase( *utf8stmtid );

		// schedule async worker
		Nan::Callback * cb = new Nan::Callback( info[1].As< v8::Function >() );
		Nan::AsyncQueueWorker( new ifx::workers::StmtFree( stmt, cb ) );


		// return undefined
		info.GetReturnValue().Set( Nan::Undefined() );

	}

} /* end of namespace ifx */

