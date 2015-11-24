
#ifndef IFX_CONNECT_H
#define IFX_CONNECT_H

#include <nan.h>


namespace ifx {

	struct connection_t {
		std::string id;
		std::string database;
		std::string username;
		std::string password;
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

} /* end of namespace ifx */

#endif /* !IFX_CONNECT_H */

