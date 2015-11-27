
#include <nan.h>

#include "ifx/ifx.h"


void init( v8::Local< v8::Object > exports ) {
	ifx::Ifx::init( exports );
}

NODE_MODULE( ifx, init )

