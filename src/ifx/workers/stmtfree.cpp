
#include "stmtfree.h"
#include "../../esqlc.h"


namespace ifx {
namespace workers {

	StmtFree::StmtFree( ifx::stmt_t * stmt, Nan::Callback * cb ) : Nan::AsyncWorker( cb ), _stmt( stmt ) {
		// constructor
	}


	StmtFree::~StmtFree() {
		// destructor
	}


	void StmtFree::Execute() {

		int32_t code = 0;

		code = esqlc::acquire( _stmt->conn->id.c_str() );
		if ( code < 0 ) {
			return SetErrorMessage( esqlc::errmsg( code ).c_str() );
		}

		code = esqlc::free( _stmt->id.c_str() );
		if ( code < 0 ) {
			SetErrorMessage( esqlc::errmsg( code ).c_str() );
		}

		// release the connection
		esqlc::release( _stmt->conn->id.c_str() );

	}


	void StmtFree::HandleOKCallback() {

		// stack-allocated handle scope
		Nan::HandleScope scope;

		// copy cursor ID
		Nan::MaybeLocal< v8::String > v8stmtid = Nan::New< v8::String >( _stmt->id );

		// update internal references
		_stmt->conn->stmts.erase( _stmt->id );

		// delete statement
		delete _stmt;

		v8::Local< v8::Value > argv[] = {
			Nan::Null(),
			v8stmtid.ToLocalChecked()
		};

		callback->Call( 2, argv );

	}

} /* end of namespace workers */
} /* end of namespace ifx */

