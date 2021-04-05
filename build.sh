#!/bin/bash

cd "$(dirname "$(realpath "$0")")"
#cd src && ./mise-en-place.py && cd ..

HOST=develop.beautifultrouble.org
SCRIPT=build

LDIR=bt
LFILE=toolbox.js

RDIR=develop.beautifultrouble.org
RFILE=toolbox.js


if [[ "${!#}" =~ "dev" ]]; then
    RFILE=toolbox-develop.js
    SCRIPT=build-develop
elif [[ "${!#}" =~ "exp" ]]; then
    RFILE=toolbox-experimental.js
    SCRIPT=build-develop
fi

if yarn ${SCRIPT}; then
    mv -v "${LDIR}/${LFILE}" "${LDIR}/${RFILE}"
    rsync -vzaP "${LDIR}/" "${HOST}:${RDIR}"
fi
