
#ifndef IFX_WORKERS_DISCONNECT_H
#define IFX_WORKERS_DISCONNECT_H

#include <nan.h>

#include "../types.h"


namespace ifx {
namespace workers {

	class Disconnect : public Nan::AsyncWorker {
	public:

		Disconnect( ifx::conn_t * conn, Nan::Callback * cb );
		virtual ~Disconnect();

		void Execute();


	protected:

		void HandleOKCallback();


	private:

		ifx::conn_t * _conn;

	};

} /* end of namespace ifx::workers */
} /* end of namespace ifx */

#endif /* !IFX_WORKERS_DISCONNECT_H */

