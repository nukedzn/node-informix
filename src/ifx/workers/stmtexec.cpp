
#include "stmtexec.h"
#include "../../esqlc.h"


namespace ifx {
namespace workers {

	StmtExec::StmtExec( ifx::cursor_t * cursor, Nan::Callback * cb ) : Nan::AsyncWorker( cb ), _cursor( cursor ) {
		// constructor
	}


	StmtExec::~StmtExec() {
		// destructor
	}


	void StmtExec::Execute() {

		int32_t code = 0;

		// acquire the connection for this thread
		code = esqlc::acquire( _cursor->stmt->conn->id.c_str() );
		if ( code < 0 ) {
			return SetErrorMessage( esqlc::errmsg( code ).c_str() );
		}

		// execute the statement (i.e. open a new cursor)
		code = esqlc::exec(
				_cursor->stmt->id.c_str(),
				_cursor->id.c_str(),
				_cursor->insqlda );

		if ( code < 0 ) {
			SetErrorMessage( esqlc::errmsg( code ).c_str() );
		}

		// release the connection
		esqlc::release( _cursor->stmt->conn->id.c_str() );

	}


	void StmtExec::HandleOKCallback() {

		// stack-allocated handle scope
		Nan::HandleScope scope;

		// add cursor reference to the statement
		_cursor->stmt->cursors[ _cursor->id ] = _cursor;

		// return value
		v8::Local< v8::Value > argv[] = {
			Nan::Null(),
			Nan::New< v8::String >( _cursor->id ).ToLocalChecked()
		};

		callback->Call( 2, argv );

	}

} /* end of namespace workers */
} /* end of namespace ifx */

