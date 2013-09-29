#!/bin/bash

cd "$(dirname ${BASH_SOURCE[0]})/.."

chmod -R 777 db
chmod -R 777 log
chmod -R 777 public/photos

if [ -f db/db.sdb ]
then
	rm db/db.sdb
fi

find log -name '*.log' -delete

find public/photos -name '*.jpg' -o -name "*.png" -o -name "*.gif" -o -name "*.bmp" -delete
