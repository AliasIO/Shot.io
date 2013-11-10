#!/bin/bash

cd "$(dirname ${BASH_SOURCE[0]})/.."

chmod -R 777 db
chmod -R 777 log
chmod -R 777 public/photos

if [ -f db/db.sdb ]
then
	rm db/db.sdb
fi

find log -type f -name '*.log' -delete

find public/photos -type f \
	-name '*.jpg' -delete -o \
	-name "*.png" -delete -o \
	-name "*.gif" -delete -o \
	-name "*.bmp" -delete
