
#ifndef IFX_WORKERS_STMTRUN_H
#define IFX_WORKERS_STMTRUN_H

#include <nan.h>

#include "../common.h"


namespace ifx {
namespace workers {

	class StmtRun : public Nan::AsyncWorker {
	public:

		StmtRun( ifx::cursor_t * cursor, Nan::Callback * cb );
		virtual ~StmtRun();

		void Execute();


	protected:

		void HandleOKCallback();


	private:

		ifx::cursor_t * _cursor;

	};

} /* end of namespace workers */
} /* end of namespace ifx */

#endif /* !IFX_WORKERS_STMTRUN_H */

