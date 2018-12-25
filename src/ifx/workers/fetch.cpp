
#include <sqltypes.h>
#include <decimal.h>
#include <sqlhdr.h>

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

			callback->Call( 2, argv, async_resource );
			return;

		}

		// we have results, return as a data array
		v8::Local< v8::Array > result = Nan::New< v8::Array >( _cursor->outsqlda->sqld );
		ifx_sqlvar_t * sqlvar = _cursor->outsqlda->sqlvar;
		for ( uint32_t i = 0; i < static_cast< size_t >( _cursor->outsqlda->sqld ); i++, sqlvar++ ) {
			switch ( sqlvar->sqltype ) {
				case SQLSMINT:
					result->Set( Nan::New< v8::Integer >( i ), Nan::New< v8::Int32 >(* reinterpret_cast<int16_t *>( sqlvar->sqldata ) ) );
					break;

				case SQLINT:
				case SQLSERIAL:
					result->Set( Nan::New< v8::Integer >( i ), Nan::New< v8::Int32 >(* reinterpret_cast<int32_t *>( sqlvar->sqldata ) ) );
					break;

				case SQLINFXBIGINT:
				case SQLBIGSERIAL:
					result->Set( Nan::New< v8::Integer >( i ), Nan::New< v8::Number >(* reinterpret_cast<int64_t *>( sqlvar->sqldata ) ) );
					break;

				case SQLFLOAT:
				case SQLSMFLOAT:
					result->Set( Nan::New< v8::Integer >( i ), Nan::New< v8::Number >( *sqlvar->sqldata ) );
					break;

				case SQLMONEY:
				case SQLDECIMAL:
					{
						double n = 0;
						if ( dectodbl( reinterpret_cast< dec_t * >( sqlvar->sqldata ), &n ) == 0 ) {
							result->Set( Nan::New< v8::Integer >( i ), Nan::New< v8::Number >( n ) );
						} else {
							char buffer[40];
							std::memset( buffer, 0, sizeof( buffer ) );
							dectoasc( reinterpret_cast< dec_t * >( sqlvar->sqldata ), buffer, ( sizeof( buffer ) - 1 ), -1 );
							result->Set( Nan::New< v8::Integer >( i ), Nan::New< v8::String >( buffer ).ToLocalChecked() );
						}
					}
					break;

				case SQLNULL:
					result->Set( Nan::New< v8::Integer >( i ), Nan::Null() );
					break;

				case SQLDATE:
					{
						char buffer[25];
						char format[] = "yyyy-mm-ddT00:00:00.000Z";
						rfmtdate( *reinterpret_cast<int4 *>( sqlvar->sqldata ), format, buffer );
						result->Set( Nan::New< v8::Integer >( i ), Nan::New< v8::String >( buffer ).ToLocalChecked() );
					}
					break;

				case SQLDTIME:
					{
						char buffer[25];
						char format[] = "%Y-%m-%dT%H:%M:%S.%F3Z";
						dttofmtasc( reinterpret_cast< dtime * >( sqlvar->sqldata ), buffer, sizeof( buffer ), format );
						result->Set( Nan::New< v8::Integer >( i ), Nan::New< v8::String >( buffer ).ToLocalChecked() );
					}
					break;

				case SQLINTERVAL:
					{
						char buffer[40];
						char format[] = "%d, %H:%M:%S.%F3";
						intofmtasc( reinterpret_cast< intrvl * >( sqlvar->sqldata ), buffer, sizeof( buffer ), format );
						result->Set( Nan::New< v8::Integer >( i ), Nan::New< v8::String >( buffer ).ToLocalChecked() );
					}
					break;

				case SQLTEXT:
					{
						ifx_loc_t *loc = (ifx_loc_t *) sqlvar->sqldata;
						if (loc->loc_size > 0) {
							int size = loc->loc_size + 1;
							char *buffer = new char[size];
							memcpy( buffer, loc->loc_buffer, loc->loc_size );
							result->Set( Nan::New< v8::Integer >( i ), Nan::New< v8::String >( buffer ).ToLocalChecked() );
							delete []buffer;
						} else {
							result->Set( Nan::New< v8::Integer >( i ), Nan::Undefined() );
						}
					}
					break;
				case SQLBYTES:
					// TODO
					result->Set( Nan::New< v8::Integer >( i ), Nan::Undefined() );
					break;

				case SQLINT8:
				case SQLSERIAL8:
					{
						int4 n = 0;
						if ( ifx_int8tolong( reinterpret_cast<ifx_int8_t *>( sqlvar->sqldata ), &n ) == 0 ) {
							result->Set( Nan::New< v8::Integer >( i ), Nan::New< v8::Int32 >( n ) );
						} else {
							char buffer[32];
							std::memset( buffer, 0, sizeof( buffer ) );
							ifx_int8toasc( reinterpret_cast< ifx_int8_t * >( sqlvar->sqldata ), buffer, sizeof( buffer ) );
							result->Set( Nan::New< v8::Integer >( i ), Nan::New< v8::String >( buffer ).ToLocalChecked() );
						}
					}
					break;

				default:
					result->Set( Nan::New< v8::Integer >( i ), Nan::New< v8::String >( sqlvar->sqldata ).ToLocalChecked() );
					break;
			}
		}

		v8::Local< v8::Value > argv[] = {
			Nan::Null(),
			result
		};

		callback->Call( 2, argv, async_resource );

	}


} /* end of namespace workers */
} /* end of namespace ifx */

