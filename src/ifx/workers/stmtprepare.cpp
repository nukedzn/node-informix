
#include "stmtprepare.h"


namespace ifx {
namespace workers {

	StmtPrepare::StmtPrepare( Nan::Callback * cb ) : Nan::AsyncWorker( cb ) {
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

