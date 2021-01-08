#!/usr/bin/env python
'''
Corners are being cut to keep the site fast.
'''

import json 
import requests

LANGS = 'en es pt ar fr'.split()


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
    


print("Generating type description translations and 'key-module' strings: descriptions.json, keys.json")
UI = 'https://api.beautifulrising.org/api/v1/text/ui'

descs = {}
keys = {}
for lang in LANGS:
    text = requests.get(f'{UI}?lang={lang}').json()
    descs[lang] = {}
    for T in ['story', 'tactic', 'principle', 'theory', 'methodology']:
        descs[lang][T] = text['definitions'][f'{T}-short']

    keys[lang] = {k: text['module'][k] for k in ['key-principle', 'key-principles', 'key-theory', 'key-theories', 'key-tactic', 'key-tactics', 'key-methodology', 'key-methodologies']}

with open('descriptions.json', 'w') as f:
    json.dump(descs, f, indent=2)

with open('keys.json', 'w') as f:
    json.dump(keys, f, indent=2)

    

print('Generating sets.json')
sets = {
    'New Pan-Afrikanism Toolkit': [
        'citizens-arrest', 'cultural-disobedience', 'hunger-strike', 'lamentation', 'escalate-strategically', 'expose-inequality-with-a-viral-gesture', 'give-voice-to-those-that-cant-speak', 'solidarity-not-aid', 'the-threat-is-usually-more-terrifying-than-the-thing-itself', 'use-organizing-strategies-that-scale', 'gerontocracy', 'palace-coup', 'new-pan-afrikanism', 'kisangani-demands-electric-power', 'angola-15-2', 'bring-back-our-girls', 'fees-must-fall', 'gambia-has-decided', 'ghana-thinktank', 'manich-msamah', 'street-graduation', 'this-flag', 'baraza'
    ],
    'COVID-19': [
        'make-the-invisible-visible', 'simple-rules-can-have-grand-results', 'al-fazaa', 'guerilla-projection', 'divestment', 'take-risks-but-take-care', 'prefigurative-politics', 'peoples-shock-doctrine-', 'breakfast-is-persuasive'
    ],
    '#BlackLivesMatter': [
        'direct-action', 'peoples-shock-doctrine-', 'the-real-action-is-your-targets-reaction', 'anger-works-best-when-you-have-the-moral-high-ground', 'use-the-power-of-ritual', 'hunger-strike', 'countering-homophobic-policing', 'take-risks-but-take-care', 'make-the-invisible-visible', 'do-the-medias-work-for-them', 'power-mapping', 'take-leadership-from-the-most-impacted'
    ],
    'Election Protection': [
        'recapture-the-flag', 'pillars-of-power', 'general-strike', 'put-your-target-in-a-decision-dilemma', 'use-the-power-of-ritual', 'training-for-the-win', 'gambia-has-decided'
    ],
}
with open('sets.json', 'w') as f:
    json.dump(sets, f, indent=2)

