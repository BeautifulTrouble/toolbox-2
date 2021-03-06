#!/usr/bin/env python
'''
1. Output site text from a spreadsheet of the following form:

    key     | en        | es
    --------+-----------+-----------
    spam    | SPAM      | El SPAM
    --------+-----------+-----------
    eggs    | Eggs      | Huevos

2. Output tool set lists
'''

import csv
import json
import re
import sys

import requests


# Replace /edit#gid=0 with /export?format=csv&gid=0
SHEET = 'https://docs.google.com/spreadsheets/d/1nixfyP9qTVHKuaZY4uFDGDwUuCL8s3-O1KiypdkuJwM/export?format=csv'


JSON = 'text.json'
with open(JSON, 'w') as j:
    print(f'Writing {JSON}...')

    text = requests.get(SHEET).content.decode('utf-8-sig')
    text_by_lang = {}

    for row in csv.DictReader(text.splitlines()):
        key = row.pop('key')
        if key:
            for lang, text in row.items():
                # Organize into top-level per-language dicts with English fallback
                text_by_lang.setdefault(lang, {})[key] = text or row.get('en', '')

    json.dump(text_by_lang, j, indent=2)


JSON = 'sets.json'
with open(JSON, 'w') as f:
    print(f'Writing {JSON}...')

    sets = {
        'new-pan-afrikanism': [
            'citizens-arrest', 'cultural-disobedience', 'hunger-strike', 'lamentation', 'escalate-strategically', 'expose-inequality-with-a-viral-gesture', 'give-voice-to-those-that-cant-speak', 'solidarity-not-aid', 'the-threat-is-usually-more-terrifying-than-the-thing-itself', 'use-organizing-strategies-that-scale', 'gerontocracy', 'palace-coup', 'new-pan-afrikanism', 'kisangani-demands-electric-power', 'angola-15-2', 'bring-back-our-girls', 'fees-must-fall', 'gambia-has-decided', 'ghana-thinktank', 'manich-msamah', 'street-graduation', 'this-flag', 'baraza'
        ],
        'covid-19': [
            'make-the-invisible-visible', 'simple-rules-can-have-grand-results', 'al-fazaa', 'guerilla-projection', 'divestment', 'take-risks-but-take-care', 'prefigurative-politics', 'peoples-shock-doctrine-', 'breakfast-is-persuasive'
        ],
        'blacklivesmatter': [
            'direct-action', 'peoples-shock-doctrine-', 'the-real-action-is-your-targets-reaction', 'anger-works-best-when-you-have-the-moral-high-ground', 'use-the-power-of-ritual', 'hunger-strike', 'countering-homophobic-policing', 'take-risks-but-take-care', 'make-the-invisible-visible', 'do-the-medias-work-for-them', 'power-mapping', 'take-leadership-from-the-most-impacted'
        ],
        'election-protection': [
            'recapture-the-flag', 'pillars-of-power', 'general-strike', 'put-your-target-in-a-decision-dilemma', 'use-the-power-of-ritual', 'training-for-the-win', 'gambia-has-decided'
        ],
        'myanmar-coup-response': [
            '-gambiahasdecided', '-thisflag', 'battle-of-the-camel', 'burmese-students-long-march', 'disrupting-obamas-town-hall-in-myanmar', 'flower-speech-campaign', 'honk-at-parliament', 'panty-power', 'standing-man', 'the-salt-march', 'who-would-accept-', 'cacerolazo-noise-making-protest-', 'clandestine-leafleting', 'civil-disobedience', 'distributed-action', 'general-strike', 'hashtag-campaign', 'jail-solidarity', 'mass-street-action', 'activate-international-mechanisms', 'dont-dress-like-a-protester', 'focus-on-basic-needs', 'if-protest-is-made-illegal-make-daily-life-a-protest', 'put-your-target-in-a-decision-dilemma', 'seek-safety-in-support-networks', 'simple-rules-can-have-grand-results', 'the-real-action-is-your-targets-reaction', '-democracy-promotion-', 'al-fazaa-a-surge-of-solidarity-', 'direct-action', 'framing', 'pillars-of-power', 'power-mapping', 'spectrum-of-allies'
        ],
    }

    json.dump(sets, f, indent=2)

