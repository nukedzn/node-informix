
#include "stmtprepare.h"


namespace ifx {
namespace workers {

	StmtPrepare::StmtPrepare( ifx::stmt_t * stmt, Nan::Callback * cb ) : Nan::AsyncWorker( cb ), _stmt( stmt ) {
		// constructor
	}


	StmtPrepare::~StmtPrepare() {
		// destructor
	}


	void StmtPrepare::Execute() {

		// FIXME: Better to not to access _stmt->sqlda directly here since we are
		// out of the main event loop. Although it is unlikely we'll have two threads
		// with the same statement ID coming here due to the uniqueue checks we have
		// in the main event loop code.
		int32_t code = esqlc::prepare(
				_stmt->conn.c_str(),
				_stmt->id.c_str(),
				_stmt->stmt.c_str(),
				_stmt->insqlda,
				_stmt->outsqlda );

		if ( code < 0 ) {
			SetErrorMessage( esqlc::errmsg( code ).c_str() );
		}

	}

	void StmtPrepare::HandleOKCallback() {

		// stack-allocated handle scope
		Nan::HandleScope scope;

		v8::Local< v8::Value > argv[] = {
			Nan::Null(),
			Nan::New< v8::String >( _stmt->id ).ToLocalChecked()
		};

		callback->Call( 2, argv );

	}

} /* end of namespace workers */
} /* end of namespace ifx */

