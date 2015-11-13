
#ifndef IFX_CONNECTION_H
#define IFX_CONNECTION_H

#include <nan.h>


namespace ifx {

	class Connection : public Nan::AsyncWorker {
	public:

		Connection( std::string id, Nan::Callback * cb );
		virtual ~Connection();

		void Execute();


	protected:

		void HandleOKCallback();


	private:

		std::string _id;

	};

}


#endif /* !IFX_CONNECTION_H */

