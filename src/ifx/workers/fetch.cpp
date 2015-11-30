
#include "fetch.h"
#include "../../esqlc.h"


namespace ifx {
namespace workers {

	Fetch::Fetch( ifx::cursor_t * cursor, Nan::Callback * cb ) : Nan::AsyncWorker( cb ), _cursor( cursor ) {
		// constructor
	}


	Fetch::~Fetch() {
		// destructor
	}


	void Fetch::Execute() {

		int32_t code = 0;

		// acquire the connection for this thread
		code = esqlc::acquire( _cursor->stmt->conn->id.c_str() );
		if ( code < 0 ) {
			return SetErrorMessage( esqlc::errmsg( code ).c_str() );
		}

		code = esqlc::fetch( _cursor->id.c_str(), _cursor->outsqlda );
		std::strncpy( _sqlstate, esqlc::sqlstate(), sizeof( _sqlstate ) );

		if ( code < 0 ) {
			SetErrorMessage( esqlc::errmsg( code ).c_str() );
		}

		// release the connection
		esqlc::release( _cursor->stmt->conn->id.c_str() );

	}


	void Fetch::HandleOKCallback() {

		// stack-allocated handle scope
		Nan::HandleScope scope;

		// check whether we have any results (i.e. rows returned)
		if ( std::strncmp( _sqlstate, "02", 2 ) == 0 ) {

			// no results, send back a null response
			v8::Local< v8::Value > argv[] = {
				Nan::Null(),
				Nan::Null()
			};

			callback->Call( 2, argv );
			return;

		}

		// we have results, return as a data array
		v8::Local< v8::Array > result = Nan::New< v8::Array >( _cursor->outsqlda->sqld );
		ifx_sqlvar_t * sqlvar = _cursor->outsqlda->sqlvar;
		for ( uint32_t i = 0; i < static_cast< size_t >( _cursor->outsqlda->sqld ); i++ ) {
			result->Set( Nan::New< v8::Integer >( i ), Nan::New< v8::String >( sqlvar->sqldata ).ToLocalChecked() );
			sqlvar++;
		}

		v8::Local< v8::Value > argv[] = {
			Nan::Null(),
			result
		};

		callback->Call( 2, argv );

	}


} /* end of namespace workers */
} /* end of namespace ifx */

