
#ifndef IFX_WORKERS_STMTRUN_H
#define IFX_WORKERS_STMTRUN_H

#include <nan.h>


namespace ifx {
namespace workers {

	class StmtRun : public Nan::AsyncWorker {
	public:

		StmtRun( Nan::Callback * cb );
		virtual ~StmtRun();


	protected:

		void HandleOKCallback();

	};

} /* end of namespace workers */
} /* end of namespace ifx */

#endif /* !IFX_WORKERS_STMTRUN_H */

