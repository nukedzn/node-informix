
#ifndef IFX_WORKERS_STMTEXEC_H
#define IFX_WORKERS_STMTEXEC_H

#include <nan.h>

#include "../types.h"


namespace ifx {
namespace workers {

	class StmtExec : public Nan::AsyncWorker {
	public:

		StmtExec( ifx::cursor_t * cursor, Nan::Callback * cb );
		virtual ~StmtExec();

		void Execute();


	protected:

		void HandleErrorCallback();
		void HandleOKCallback();


	private:

		ifx::cursor_t * _cursor;

	};

} /* end of namespace workers */
} /* end of namespace ifx */

#endif /* !IFX_WORKERS_STMTEXEC_H */

