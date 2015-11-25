
#include "stmtrun.h"


namespace ifx {
namespace workers {

	StmtRun::StmtRun( ifx::cursor_t * cursor, Nan::Callback * cb ) : Nan::AsyncWorker( cb ), _cursor( cursor ) {
		// constructor
	}


	StmtRun::~StmtRun() {
		// destructor
	}


	void StmtRun::Execute() {

		// TODO:
		// create an ifx_sqlda_t data structure with input args (if needed)
		// use esqlc::run() to execute the prepared statement and get a cursor back

	}


	void StmtRun::HandleOKCallback() {

		// stack-allocated handle scope
		Nan::HandleScope scope;

		v8::Local< v8::Value > argv[] = {
			Nan::Null(),
			Nan::New< v8::String >( _cursor->id ).ToLocalChecked()
		};

		callback->Call( 2, argv );

	}

} /* end of namespace workers */
} /* end of namespace ifx */

