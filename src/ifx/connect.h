
#ifndef IFX_CONNECT_H
#define IFX_CONNECT_H

#include <nan.h>


namespace ifx {

	struct connection_t {
		std::string id;
		std::string db;
	};


	class Connect : public Nan::AsyncWorker {
	public:

		Connect( const connection_t &conn, Nan::Callback * cb );
		virtual ~Connect();

		void Execute();


	protected:

		void HandleOKCallback();


	private:

		connection_t _conn;

	};

}


#endif /* !IFX_CONNECT_H */

