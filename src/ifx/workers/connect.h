
#ifndef IFX_WORKERS_CONNECT_H
#define IFX_WORKERS_CONNECT_H

#include <nan.h>

#include "../types.h"


namespace ifx {
namespace workers {

	class Connect : public Nan::AsyncWorker {
	public:

		Connect( ifx::conn_t * conn, Nan::Callback * cb );
		virtual ~Connect();

		void Execute();


	protected:

		void HandleOKCallback();


	private:

		ifx::conn_t * _conn;

	};

} /* end of namespace ifx::workers */
} /* end of namespace ifx */

#endif /* !IFX_WORKERS_CONNECT_H */

