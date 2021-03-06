
#include <cstring>
#include <sqlhdr.h>

#include "ifx.h"
#include "workers/connect.h"
#include "workers/stmtprepare.h"
#include "workers/stmtexec.h"
#include "workers/stmtfree.h"
#include "workers/fetch.h"
#include "workers/cursorclose.h"
#include "workers/disconnect.h"


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
		Nan::SetPrototypeMethod( tpl, "disconnect", disconnect );

		Nan::SetPrototypeMethod( tpl, "serial", serial );


		constructor.Reset( tpl->GetFunction() );
		exports->Set( Nan::New( "Ifx" ).ToLocalChecked(), tpl->GetFunction() );

	}


	void Ifx::construct( const Nan::FunctionCallbackInfo< v8::Value > &info ) {

		if (! info.IsConstructCall() ) {

			// invoked as `Ifx(...)`, convert to a constructor call
			const int argc = 1;
			v8::Local< v8::Value > argv[ argc ] = { info[0] };
			v8::Local< v8::Function > c = Nan::New< v8::Function >( constructor );
			return info.GetReturnValue().Set( Nan::NewInstance( c, argc, argv ).ToLocalChecked() );

		}

		Ifx * obj = new Ifx();
		obj->Wrap( info.This() );
		info.GetReturnValue().Set( info.This() );

	}


	void Ifx::connect( const Nan::FunctionCallbackInfo< v8::Value > &info ) {

		// basic validation
		if ( info.Length() != 2 ) {
			return Nan::ThrowError( "Invalid number of arguments." );
		}

		if (! info[0]->IsObject() ) {
			return Nan::ThrowTypeError( "Connection parameters must be an object." );
		}

		if (! info[1]->IsFunction() ) {
			return Nan::ThrowTypeError( "Callback must be a function." );
		}


		v8::Local< v8::Object > params = info[0].As< v8::Object >();

		// validate mandatory connection params
		if ( (! params->Has( Nan::New< v8::String >( "id" ).ToLocalChecked() ) )
			|| (! params->Has( Nan::New< v8::String >( "database" ).ToLocalChecked() ) ) ) {
			return Nan::ThrowTypeError( "Connection parameter 'id' and 'database' are mandatory." );
		}


		// unwrap ourself
		Ifx * self = ObjectWrap::Unwrap< Ifx >( info.Holder() );

		// check whether we already have a connection with the same ID
		Nan::Utf8String utf8connid( params->Get( Nan::New< v8::String >( "id" ).ToLocalChecked() ) );
		ifx::conn_t * conn = self->_conns[ *utf8connid ];
		if ( conn ) {
			return Nan::ThrowError( "A connection with the same ID already exists." );
		}


		std::string username;
		std::string password;
		Nan::Utf8String utf8database( params->Get( Nan::New< v8::String >( "database" ).ToLocalChecked() ) );
		Nan::Callback * cb = new Nan::Callback( info[1].As< v8::Function >() );

		if ( params->Has( Nan::New< v8::String >( "username" ).ToLocalChecked() ) ) {
			Nan::Utf8String utf8user( params->Get( Nan::New< v8::String >( "username" ).ToLocalChecked() ) );
			username = std::string( *utf8user );
		}

		if ( params->Has( Nan::New< v8::String >( "password" ).ToLocalChecked() ) ) {
			Nan::Utf8String utf8pass( params->Get( Nan::New< v8::String >( "password" ).ToLocalChecked() ) );
			password = std::string( *utf8pass );
		}


		// prepare connection data structure
		conn = new ifx::conn_t();
		conn->id = *utf8connid;
		conn->database = *utf8database;
		conn->username = username;
		conn->password = password;

		// update internal reference
		self->_conns[ conn->id ] = conn;

		// schedule async connection worker
		Nan::AsyncQueueWorker( new ifx::workers::Connect( conn, cb ) );


		// return undefined
		info.GetReturnValue().Set( Nan::Undefined() );

	}


	void Ifx::prepare( const Nan::FunctionCallbackInfo< v8::Value > &info ) {

		// basic validation
		if ( info.Length() != 4 ) {
			return Nan::ThrowError( "Invalid number of arguments." );
		}

		if (! info[0]->IsString() ) {
			return Nan::ThrowTypeError( "Connection ID must be a string." );
		}

		if (! info[1]->IsString() ) {
			return Nan::ThrowTypeError( "Statement ID must be a string." );
		}

		if (! info[2]->IsString() ) {
			return Nan::ThrowTypeError( "Statement must be a string." );
		}

		if (! info[3]->IsFunction() ) {
			return Nan::ThrowTypeError( "Callback must be a function." );
		}


		// unwrap ourself
		Ifx * self = ObjectWrap::Unwrap< Ifx >( info.Holder() );

		// grab JS arguments
		Nan::Utf8String utf8connid ( info[0] );
		Nan::Utf8String utf8stmtid ( info[1] );
		Nan::Utf8String utf8stmt ( info[2] );
		Nan::Callback * cb = new Nan::Callback( info[3].As< v8::Function >() );


		ifx::conn_t * conn = self->_conns[ *utf8connid ];
		if (! conn ) {
			return Nan::ThrowError( "Invalid connection ID." );
		}

		// check whether we already have a prepared statement with the same ID
		ifx::stmt_t * stmt = conn->stmts[ *utf8stmtid ];
		if ( stmt ) {
			return Nan::ThrowError( "A Statement is already prepared with the same ID." );
		}

		// prepare statement data structures
		stmt = new ifx::stmt_t();
		stmt->id = *utf8stmtid;
		stmt->stmt = *utf8stmt;
		stmt->conn = conn;

		// update internal reference
		conn->stmts[ stmt->id ] = stmt;

		// schedule async worker
		Nan::AsyncQueueWorker( new ifx::workers::StmtPrepare( stmt, cb ) );


		// return undefined
		info.GetReturnValue().Set( Nan::Undefined() );

	}


	void Ifx::exec( const Nan::FunctionCallbackInfo< v8::Value > &info ) {

		// basic validation
		if ( info.Length() < 4 ) {
			return Nan::ThrowError( "Invalid number of arguments." );
		}

		if (! info[0]->IsString() ) {
			return Nan::ThrowTypeError( "Connection ID must be a string." );
		}

		if (! info[1]->IsString() ) {
			return Nan::ThrowTypeError( "Statement ID must be a string." );
		}

		if (! info[2]->IsString() ) {
			return Nan::ThrowTypeError( "Cursor ID must be a string." );
		}

		if (! info[info.Length() - 1]->IsFunction() ) {
			return Nan::ThrowTypeError( "Callback must be a function." );
		}


		// unwrap ourself
		Ifx * self = ObjectWrap::Unwrap< Ifx >( info.Holder() );

		Nan::Utf8String utf8connid( info[0] );
		ifx::conn_t * conn = self->_conns[ *utf8connid ];
		if (! conn ) {
			return Nan::ThrowError( "Invalid connection ID." );
		}

		Nan::Utf8String utf8stmtid( info[1] );
		ifx::stmt_t * stmt = conn->stmts[ *utf8stmtid ];
		if (! stmt ) {
			return Nan::ThrowError( "Invalid statement ID." );
		}

		/*
		*  ESQL/C has this bad habit of reusing last closed cursor's input ifx_sqlda_t
		*  (insqda) if the cursor is closed and freed. So we have to check input
		*  arguments here rather than relying on ESQL/C.
		*/
		if ( ( stmt->insqlda && stmt->insqlda->sqld > 0 ) && info.Length() < 5 ) {
			return Nan::ThrowError( "This statment requires input arguments." );
		}

		if ( (! stmt->insqlda ) && info.Length() > 4 ) {
			return Nan::ThrowError( "This statment does not expect any input arguments." );
		}

		Nan::Utf8String utf8curid( info[2] );
		if ( stmt->cursors[ *utf8curid ] || self->_cursors[ *utf8curid ] ) {
			return Nan::ThrowError( "A cursor with the same ID already exists." );
		}


		// SQL descriptor area
		ifx::cursor_t * cursor = new ifx::cursor_t();
		ifx_sqlda_t * insqlda = 0;

		if ( info.Length() > 4 ) {

			insqlda = new ifx_sqlda_t();
			std::memset( insqlda, 0, sizeof( ifx_sqlda_t ) );

			// FIXME: can we get away with only using CSTRINGTYPE data?

			if ( info[3]->IsArray() ) {

				char * arg;
				v8::Local< v8::Array > args = info[3].As< v8::Array >();

				if ((int) stmt->insqlda->sqld != (int) args->Length()) {
					return Nan::ThrowError( "Too many or too few host variables given." );
				}

				insqlda->sqld     = args->Length();
				insqlda->sqlvar   = new ifx_sqlvar_t[ args->Length() ];
				insqlda->desc_occ = 0;

				std::memset( insqlda->sqlvar, 0, ( sizeof( ifx_sqlvar_t ) * args->Length() ) );

				ifx_sqlvar_t * sqlvar = stmt->insqlda->sqlvar;
				for ( uint32_t i = 0; i < args->Length(); i++, sqlvar++ ) {
					Nan::Utf8String utf8arg( args->Get( Nan::New< v8::Integer >( i ) ) );
					size_t size = ( utf8arg.length() + 1 );
					arg = new char[ size ];

					std::strncpy( arg, *utf8arg, size );
					cursor->args.push_back( arg );

					if (sqlvar->sqltype == SQLTEXT) {
						ifx_loc_t  *temp_loc = new ifx_loc_t();
						std::memset( temp_loc, 0, sizeof( ifx_loc_t ) );

						temp_loc->loc_loctype = LOCMEMORY;
						temp_loc->loc_type = SQLTEXT;
						temp_loc->loc_bufsize = (1024 * 1024);
						temp_loc->loc_size = size;
						temp_loc->loc_buffer = arg;

						insqlda->sqlvar[i].sqltype = CLOCATORTYPE;
						insqlda->sqlvar[i].sqllen  = sizeof(ifx_loc_t);
						insqlda->sqlvar[i].sqldata = (char *) temp_loc;
					} else {
						insqlda->sqlvar[i].sqltype = CSTRINGTYPE;
						insqlda->sqlvar[i].sqllen  = size;
						insqlda->sqlvar[i].sqldata = arg;
					}

				}

			} else {

				Nan::Utf8String utf8arg( info[3] );
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
			return Nan::ThrowError( "Invalid number of arguments." );
		}

		if (! info[0]->IsString() ) {
			return Nan::ThrowTypeError( "Cursor ID must be a string." );
		}

		if (! info[1]->IsFunction() ) {
			return Nan::ThrowTypeError( "Callback must be a function." );
		}


		// unwrap ourself
		Ifx * self = ObjectWrap::Unwrap< Ifx >( info.Holder() );

		Nan::Utf8String utf8curid( info[0] );
		ifx::cursor_t * cursor = self->_cursors[ *utf8curid ];

		if (! cursor ) {
			return Nan::ThrowError( "Invalid cursor ID." );
		}


		if ( (! cursor->outsqlda ) && cursor->stmt->outsqlda ) {

			cursor->outsqlda = new ifx_sqlda_t();
			std::memcpy( cursor->outsqlda, cursor->stmt->outsqlda, sizeof( ifx_sqlda_t ) );

			// new output data buffer
			cursor->data = new char[ cursor->stmt->size ];

			// update sqlvar->sqldata refereces
			size_t size = 0;
			ifx_sqlvar_t * sqlvar = cursor->outsqlda->sqlvar;
			for ( size_t i = 0; i < static_cast< size_t >( cursor->outsqlda->sqld ); i++ ) {
				size = rtypalign( size, sqlvar->sqltype );

				if ( sqlvar->sqltype == SQLTEXT ) {
					ifx_loc_t *temp_loc = new ifx_loc_t();
					temp_loc->loc_type = SQLTEXT;
					temp_loc->loc_loctype = LOCMEMORY;
					temp_loc->loc_indicator = 0;
					temp_loc->loc_bufsize = -1;
					temp_loc->loc_oflags  = 0;
					temp_loc->loc_mflags  = 0;
					sqlvar->sqllen = sizeof( ifx_loc_t );
					sqlvar->sqldata = (char *) temp_loc;
				} else {
					sqlvar->sqldata = ( cursor->data + size );
				}

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
			return Nan::ThrowError( "Invalid number of arguments." );
		}

		if (! info[0]->IsString() ) {
			return Nan::ThrowTypeError( "Cursor ID must be a string." );
		}

		if (! info[1]->IsFunction() ) {
			return Nan::ThrowTypeError( "Callback must be a function." );
		}


		// unwrap ourself
		Ifx * self = ObjectWrap::Unwrap< Ifx >( info.Holder() );

		Nan::Utf8String utf8curid( info[0] );
		ifx::cursor_t * cursor = self->_cursors[ *utf8curid ];

		if (! cursor ) {
			return Nan::ThrowError( "Invalid cursor ID." );
		}


		// FIXME: Deleting this here means we can't recover from any failures within
		//        the async worker.
		// update internal references
		self->_cursors.erase( cursor->id );

		// schedule async worker
		Nan::Callback * cb = new Nan::Callback( info[1].As< v8::Function >() );
		Nan::AsyncQueueWorker( new ifx::workers::CursorClose( cursor, cb ) );


		// return undefined
		info.GetReturnValue().Set( Nan::Undefined() );

	}


	void Ifx::free( const Nan::FunctionCallbackInfo< v8::Value > &info ) {

		// basic validation
		if ( info.Length() != 3 ) {
			return Nan::ThrowError( "Invalid number of arguments." );
		}

		if (! info[0]->IsString() ) {
			return Nan::ThrowTypeError( "Connection ID must be a string." );
		}

		if (! info[1]->IsString() ) {
			return Nan::ThrowTypeError( "Statement ID must be a string." );
		}

		if (! info[2]->IsFunction() ) {
			return Nan::ThrowTypeError( "Callback must be a function." );
		}


		// unwrap ourself
		Ifx * self = ObjectWrap::Unwrap< Ifx >( info.Holder() );

		Nan::Utf8String utf8connid( info[0] );
		ifx::conn_t * conn = self->_conns[ *utf8connid ];
		if (! conn ) {
			return Nan::ThrowError( "Invalid connection ID." );
		}

		Nan::Utf8String utf8stmtid( info[1] );
		ifx::stmt_t * stmt = conn->stmts[ *utf8stmtid ];
		if (! stmt ) {
			return Nan::ThrowError( "Invalid statement ID." );
		}

		if ( stmt->cursors.size() ) {
			// try and cleanup any empty cursor references (issue #27)
			for ( cursors_t::iterator it = stmt->cursors.begin(); it != stmt->cursors.end(); ) {
				if (! it->second ) {
					self->_cursors.erase( it->first );
					stmt->cursors.erase( it++ );
				} else {
					// there's a cursor attached to this statement so can't be freed
					return Nan::ThrowError( "Cursors need to be closed." );
				}
			}
		}


		// schedule async worker
		Nan::Callback * cb = new Nan::Callback( info[2].As< v8::Function >() );
		Nan::AsyncQueueWorker( new ifx::workers::StmtFree( stmt, cb ) );


		// return undefined
		info.GetReturnValue().Set( Nan::Undefined() );

	}


	void Ifx::disconnect( const Nan::FunctionCallbackInfo< v8::Value > &info ) {

		// basic validation
		if ( info.Length() != 2 ) {
			return Nan::ThrowError( "Invalid number of arguments." );
		}

		if (! info[0]->IsString() ) {
			return Nan::ThrowTypeError( "Connection ID must be a string." );
		}

		if (! info[1]->IsFunction() ) {
			return Nan::ThrowTypeError( "Callback must be a function." );
		}

		// unwrap ourself
		Ifx * self = ObjectWrap::Unwrap< Ifx >( info.Holder() );

		Nan::Utf8String utf8connid( info[0] );
		ifx::conn_t * conn = self->_conns[ *utf8connid ];
		if (! conn ) {
			return Nan::ThrowError( "Invalid connection ID." );
		}

		if ( conn->stmts.size() ) {
			return Nan::ThrowError( "Statements must be freed." );
		}


		// FIXME: Deleting this here means we can't recover from any failures within
		//        the async worker.
		// update internal references
		self->_conns.erase( conn->id );

		// schedule async worker
		Nan::Callback * cb = new Nan::Callback( info[1].As< v8::Function >() );
		Nan::AsyncQueueWorker( new ifx::workers::Disconnect( conn, cb ) );


		// return undefined
		info.GetReturnValue().Set( Nan::Undefined() );

	}


	void Ifx::serial( const Nan::FunctionCallbackInfo< v8::Value > &info ) {

		// basic validation
		if ( info.Length() != 1 ) {
			return Nan::ThrowError( "Invalid number of arguments." );
		}

		if (! info[0]->IsString() ) {
			return Nan::ThrowTypeError( "Cursor ID must be a string." );
		}


		// unwrap ourself
		Ifx * self = ObjectWrap::Unwrap< Ifx >( info.Holder() );

		Nan::Utf8String utf8curid( info[0] );
		ifx::cursor_t * cursor = self->_cursors[ *utf8curid ];

		if (! cursor ) {
			return Nan::ThrowError( "Invalid cursor ID." );
		}


		// return serial
		info.GetReturnValue().Set( Nan::New< v8::Int32 >( cursor->serial ) );

	}

} /* end of namespace ifx */

