
#ifndef IFX_WORKERS_STMTPREPARE_H
#define IFX_WORKERS_STMTPREPARE_H

#include <nan.h>

#include "../common.h"


namespace ifx {
namespace workers {

	class StmtPrepare : public Nan::AsyncWorker {
	public:

		StmtPrepare( esqlc::stmt_t * stmt, Nan::Callback * cb );
		virtual ~StmtPrepare();

		void Execute();


	protected:

		void HandleOKCallback();


	private:

		esqlc::stmt_t * _stmt;

	};

} /* end of namespace workers */
} /* end of namespace ifx */

#endif /* !IFX_WORKERS_STMTPREPARE_H */

