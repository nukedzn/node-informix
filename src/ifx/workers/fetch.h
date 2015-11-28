
#ifndef IFX_WORKERS_FETCH_H
#define IFX_WORKERS_FETCH_H

#include <nan.h>

#include "../types.h"


namespace ifx {
namespace workers {

	class Fetch : public Nan::AsyncWorker {
	public:

		Fetch( ifx::cursor_t * cursor, Nan::Callback * cb );
		virtual ~Fetch();

		void Execute();


	protected:

		void HandleOKCallback();


	private:

		ifx::cursor_t * _cursor;
		char _sqlstate[6];

	};

} /* end of namespace ifx::workers */
} /* end of namespace ifx */

#endif /* !IFX_WORKERS_FETCH_H  */

