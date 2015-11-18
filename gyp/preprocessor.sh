#¡/bin/bash

set -e

cd src
THREADLIB=POSIX esql -e -thread *.ecpp


[[ -d $1 ]] || mkdir -p $1

for f in *.C
do
	mv $f "$1/$(basename $f .C).cpp"
done

