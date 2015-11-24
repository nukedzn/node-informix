
#include "stmtrun.h"


namespace ifx {
namespace workers {

	StmtRun::StmtRun( Nan::Callback * cb ) : Nan::AsyncWorker( cb ) {
		// constructor
	}


	StmtRun::~StmtRun() {
		// destructor
	}


	void StmtRun::HandleOKCallback() {

		// stack-allocated handle scope
		Nan::HandleScope scope;

		// TODO:

	}

} /* end of namespace workers */
} /* end of namespace ifx */

