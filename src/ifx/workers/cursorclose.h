
#ifndef IFX_CURSORCLOSE_H
#define IFX_CURSORCLOSE_H

#include <nan.h>

#include "../types.h"


namespace ifx {
namespace workers {

	class CursorClose : public Nan::AsyncWorker {
	public:

		CursorClose( ifx::cursor_t * cursor, Nan::Callback * cb );
		virtual ~CursorClose();

		void Execute();


	protected:

		void HandleOKCallback();


	private:

		ifx::cursor_t * _cursor;

	};

} /* end of namespace ifx::workers */
} /* end of namespace ifx */

#endif /* !IFX_CURSORCLOSE_H */

