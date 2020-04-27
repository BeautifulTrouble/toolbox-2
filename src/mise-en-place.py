#!/usr/bin/env python
'''
Corners are being cut to keep the site fast.
'''

import json 
import requests

LANGS = 'en es pt ar'.split()


print("Generating tags translations: tags.json")
TAGS = 'https://api.beautifulrising.org/api/v1/text/tags'

tags_by_lang = {lang: requests.get(f'{TAGS}?lang={lang}').json()['all'] for lang in LANGS}

with open('tags.json', 'w') as f:
    json.dump(tags_by_lang, f, indent=2)



print("Generating types translations: types.json")
UI = 'https://api.beautifulrising.org/api/v1/text/ui'

types_by_lang = {}
for lang in LANGS:
    text = requests.get(f'{UI}?lang={lang}').json()
    types_by_lang[lang] = {}
    for one, many in [
        ('story', 'stories'),
        ('tactic', 'tactics'),
        ('principle', 'principles'),
        ('theory', 'theories'),
        ('methodology', 'methodologies'),
        ]:
        types_by_lang[lang][one] = [text['types'][one], text['types'][many]]

with open('types.json', 'w') as f:
    json.dump(types_by_lang, f, indent=2)
    