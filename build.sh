#!/bin/bash

cd "$(dirname "$(realpath "$0")")"
#cd src && ./mise-en-place.py && cd ..

HOST=develop.beautifultrouble.org
LFILE=bt/toolbox.js
RFILE=develop.beautifultrouble.org/toolbox.js
SCRIPT=build

if [ "${!#}" = "develop" ]; then
    RFILE=develop.beautifultrouble.org/toolbox-develop.js
    SCRIPT=build-develop
fi

if yarn ${SCRIPT}; then
    rsync -vzaP "${LFILE}" "${HOST}:${RFILE}"
fi
