#!/bin/bash
#

IFX_PRODUCT=$1

#
# A Mac OSX build will need DYLD_LIBRARY_PATH to be set correctly
# (e.g. DYLD_LIBRARY_PATH="${INFORMIXDIR}/lib:${INFORMIXDIR}/lib/esql")
# or
# the following to fix the shared library install names. Without either of those
# the "ifx" module won't load throwing "image not found" errors.
#

install_name_tool -change iasft09b.dylib ${INFORMIXDIR}/lib/iasft09b.dylib ${IFX_PRODUCT}
install_name_tool -change isqlt09b.dylib ${INFORMIXDIR}/lib/esql/isqlt09b.dylib ${IFX_PRODUCT}
install_name_tool -change igent09a.dylib ${INFORMIXDIR}/lib/esql/igent09a.dylib ${IFX_PRODUCT}
install_name_tool -change ioslt09a.dylib ${INFORMIXDIR}/lib/esql/ioslt09a.dylib ${IFX_PRODUCT}
install_name_tool -change sobj4/igl4a304.dylib ${INFORMIXDIR}/lib/esql/igl4a304.dylib ${IFX_PRODUCT}
install_name_tool -change sobj4/iglxa304.dylib ${INFORMIXDIR}/lib/esql/iglxa304.dylib ${IFX_PRODUCT}


# Log final result
otool -L ${IFX_PRODUCT}

