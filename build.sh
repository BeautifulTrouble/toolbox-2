#!/bin/bash

FILE=toolbox.js
[[ "${!#}" =~ "dev" ]] && FILE=toolbox-develop.js

cd "$(dirname "$(realpath "$0")")"
#cd src && ./mise-en-place.py && cd ..

if yarn build; then
    rsync -zvcP bt/toolbox.js "develop.beautifultrouble.org:develop.beautifultrouble.org/${FILE}"
fi
