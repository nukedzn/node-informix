
#include "stmtprepare.h"


namespace ifx {
namespace workers {

	StmtPrepare::StmtPrepare( esqlc::stmt_t * stmt, Nan::Callback * cb ) : Nan::AsyncWorker( cb ), _stmt( stmt ) {
		// constructor
	}


	StmtPrepare::~StmtPrepare() {
		// destructor
	}


	void StmtPrepare::Execute() {

		// TODO:

	}

	void StmtPrepare::HandleOKCallback() {

		// stack-allocated handle scope
		Nan::HandleScope scope;

		// TODO:

	}

} /* end of namespace workers */
} /* end of namespace ifx */

