#¡/bin/bash

set -e

cd src
THREADLIB=POSIX esql -e -thread *.ec


[[ -d $1 ]] || mkdir -p $1

for f in *.c
do
	mv $f "$1/$(basename $f)"
done

