
#ifndef IFX_WORKERS_STMTPREPARE_H
#define IFX_WORKERS_STMTPREPARE_H

#include <nan.h>

#include "../types.h"


namespace ifx {
namespace workers {

	class StmtPrepare : public Nan::AsyncWorker {
	public:

		StmtPrepare( ifx::stmt_t * stmt, Nan::Callback * cb );
		virtual ~StmtPrepare();

		void Execute();


	protected:

		void HandleOKCallback();


	private:

		ifx::stmt_t * _stmt;

	};

} /* end of namespace workers */
} /* end of namespace ifx */

#endif /* !IFX_WORKERS_STMTPREPARE_H */

