
#include "cursorclose.h"
#include "../../esqlc.h"


namespace ifx {
namespace workers {

	CursorClose::CursorClose( ifx::cursor_t * cursor, Nan::Callback * cb ) : Nan::AsyncWorker( cb ), _cursor( cursor ) {
		// constructor
	}


	CursorClose::~CursorClose() {
		// destructor
	}


	void CursorClose::Execute() {

		int32_t code = 0;

		// acquire the connection for this thread
		code = esqlc::acquire( _cursor->stmt->conn->id.c_str() );
		if ( code < 0 ) {
			return SetErrorMessage( esqlc::errmsg( code ).c_str() );
		}

		code = esqlc::close( _cursor->id.c_str() );
		if ( code < 0 ) {
			SetErrorMessage( esqlc::errmsg( code ).c_str() );
		}

		// release the connection
		esqlc::release( _cursor->stmt->conn->id.c_str() );

	}


	void CursorClose::HandleOKCallback() {

		// stack-allocated handle scope
		Nan::HandleScope scope;

		// copy cursor ID
		Nan::MaybeLocal< v8::String > v8curid = Nan::New< v8::String >( _cursor->id );

		// update internal references
		_cursor->stmt->cursors.erase( _cursor->id );

		// delete cursor
		delete _cursor;

		v8::Local< v8::Value > argv[] = {
			Nan::Null(),
			v8curid.ToLocalChecked()
		};

		callback->Call( 2, argv, async_resource );

	}

} /* end of namespace workers */
} /* end of namespace ifx */

