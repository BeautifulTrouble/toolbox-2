#!/usr/bin/env python
'''
Corners are being cut to keep the site fast.
'''

# Output tag translations

import json 
import requests

TAGS = 'https://api.beautifulrising.org/api/v1/text/tags'

base = requests.get(TAGS).json()
tags_by_lang = {
    **{base['lang']: base['all']}, 
    **{lang: requests.get(f'{TAGS}?lang={lang}').json()['all'] 
        for lang in base['langs-available'] if lang != base['lang']}
}

with open('tags.json', 'w') as f:
    json.dump(tags_by_lang, f)
