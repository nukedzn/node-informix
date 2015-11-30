
#ifndef IFX_IFX_H
#define IFX_IFX_H

#include <nan.h>

#include "types.h"


namespace ifx {

	class Ifx : public node::ObjectWrap {
	public:

		static void init( v8::Local< v8::Object > exports );

		static void construct( const Nan::FunctionCallbackInfo< v8::Value > &info );
		static void connect( const Nan::FunctionCallbackInfo< v8::Value > &info );
		static void prepare( const Nan::FunctionCallbackInfo< v8::Value > &info );
		static void exec( const Nan::FunctionCallbackInfo< v8::Value > &info );
		static void fetch( const Nan::FunctionCallbackInfo< v8::Value > &info );
		static void close( const Nan::FunctionCallbackInfo< v8::Value > &info );
		static void free( const Nan::FunctionCallbackInfo< v8::Value > &info );


	private:

		explicit Ifx();
		~Ifx();

		static Nan::Persistent< v8::Function > constructor;

		ifx::stmts_t      _stmts;
		ifx::cursors_t    _cursors;

	};

} /* end of namespace ifx */

#endif /* !IFX_IFX_H */

