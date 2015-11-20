#!/bin/bash
#

sql=$1
status=-1
attempt=0

while [[ $status -ne 0 ]] && [[ $attempt -le 5 ]] ; do
	echo "attempt [${attempt}] using $sql"
	let attempt+=1

	INFORMIXSERVER=ol_informix1210 dbaccess - $sql
	status=$?

	echo "dbaccess returned [${status}]"
	if [[ $status -ne 0 ]] && [[ $attempt -le 5 ]] ; then
		echo "sleeping..."
		sleep 5
	fi
done

echo "attempts: ${attempt}"
echo "status: ${status}"

exit $status

