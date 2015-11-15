
#ifndef IFX_CONNECT_H
#define IFX_CONNECT_H

#include <nan.h>


namespace ifx {

	class Connect : public Nan::AsyncWorker {
	public:

		Connect( std::string id, Nan::Callback * cb );
		virtual ~Connect();

		void Execute();


	protected:

		void HandleOKCallback();


	private:

		std::string _id;

	};

}


#endif /* !IFX_CONNECT_H */

