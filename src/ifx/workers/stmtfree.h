
#ifndef IFX_STMTFREE_H
#define IFX_STMTFREE_H

#include <nan.h>

#include "../types.h"


namespace ifx {
namespace workers {

	class StmtFree : public Nan::AsyncWorker {
	public:

		StmtFree( ifx::stmt_t * stmt, Nan::Callback * cb );
		virtual ~StmtFree();

		void Execute();


	protected:

		void HandleOKCallback();


	private:

		ifx::stmt_t * _stmt;

	};

} /* end of namespace ifx::workers */
} /* end of namespace ifx */

#endif /* !IFX_STMTFREE_H */

