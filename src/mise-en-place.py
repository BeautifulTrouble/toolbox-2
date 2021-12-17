#!/usr/bin/env python
"""
1. Output site text from a spreadsheet of the following form:

    key     | en        | es
    --------+-----------+-----------
    spam    | SPAM      | El SPAM
    --------+-----------+-----------
    eggs    | Eggs      | Huevos

2. Output tool set lists
"""

import csv
import json
import re
import sys

import requests


# Replace /edit#gid=0 with /export?format=csv&gid=0
SHEET = "https://docs.google.com/spreadsheets/d/1nixfyP9qTVHKuaZY4uFDGDwUuCL8s3-O1KiypdkuJwM/export?format=csv"


JSON = "text.json"
with open(JSON, "w") as j:
    print(f"Writing {JSON}...")

    text = requests.get(SHEET).content.decode("utf-8-sig")
    text_by_lang = {}

    for row in csv.DictReader(text.splitlines()):
        key = row.pop("key")
        if key:
            for lang, text in row.items():
                # Organize into top-level per-language dicts with English fallback
                text_by_lang.setdefault(lang, {})[key] = text or row.get("en", "")

    json.dump(text_by_lang, j, indent=2)


# To generate slug lists, insert the exact titles here, then copy output back in here
try:
    import unidecode

    def slugify(s, allow=""):
        s = unidecode.unidecode(s).lower().replace("'", "")
        return re.sub(rf"[^\w{allow}]+", "-", s)

    tools = """
If you’re not uncomfortable, your coalition is too small
Baraza
Beware the tyranny of structurelessness
Pillars of power
Power mapping
Spectrum of allies
Delegate
SWOT
Use organizing strategies that scale
Build strength through repetition
Would you like some structure with your momentum?
Escalate strategically
Al Faza’a (a surge of solidarity)
Use your radical fringe to shift the overton window
Breakfast is persuasive
Political identity paradox
Story of self, us, and now
Follow the lead of the most impacted
Build people power then negotiate
Dunbar’s number
Make new folks welcome
Be careful with each other so we can be dangerous together
Foster safer spaces
    """
    print(repr([slugify(t.strip()) for t in tools.splitlines() if t.strip()]))
except ImportError:
    ...


JSON = "sets.json"
with open(JSON, "w") as f:
    print(f"Writing {JSON}...")

    sets = {
        "organizing-101": 
['if-youre-not-uncomfortable-your-coalition-is-too-small', 'baraza', 'beware-the-tyranny-of-structurelessness', 'pillars-of-power', 'power-mapping', 'spectrum-of-allies', 'delegate', 'swot', 'use-organizing-strategies-that-scale', 'build-strength-through-repetition', 'would-you-like-some-structure-with-your-momentum-', 'escalate-strategically', 'al-fazaa-a-surge-of-solidarity-', 'use-your-radical-fringe-to-shift-the-overton-window', 'breakfast-is-persuasive', 'political-identity-paradox', 'story-of-self-us-and-now', 'follow-the-lead-of-the-most-impacted', 'build-people-power-then-negotiate', 'dunbars-number', 'make-new-folks-welcome', 'be-careful-with-each-other-so-we-can-be-dangerous-together', 'foster-safer-spaces'],
        "digital-activism": [
            "hacking-apartheid",
            "cryptorally-in-mexico-city",
            "-gambiahasdecided",
            "-thisflag",
            "flower-speech-campaign",
            "bring-back-our-girls",
            "app-flooding",
            "autonomous-servers",
            "distributed-denial-of-service-ddos-",
            "encryption",
            "hashtag-campaign",
            "hashtag-hijack",
            "spoof-website",
            "practice-digital-self-defence",
            "seek-safety-in-support-networks",
            "glitch-feminism",
            "hacking",
        ],
        "palestine-solidarity": [
            "birthright-unplugged-replugged",
            "welcome-to-palestine",
            "stolen-beauty",
            "dump-veolia-campaign",
            "conflict-kitchen",
            "stop-prawer-plan",
            "general-strike",
            "currency-hacking",
            "consumer-boycott",
            "divestment",
            "civil-disobedience",
            "culture-jamming",
            "distributed-action",
            "artistic-vigil",
            "flash-mob",
            "flotilla",
            "guerrilla-projection",
            "hashtag-campaign",
            "mass-street-action",
            "subversive-travel",
            "follow-the-lead-of-the-most-impacted",
            "activate-international-mechanisms",
            "bring-the-issue-home",
            "choose-your-target-wisely",
            "consider-your-audience",
            "dont-expect-a-concrete-outcome-from-a-symbolic-action",
            "if-protest-is-made-illegal-make-daily-life-a-protest",
            "if-youre-not-uncomfortable-your-coalition-is-too-small",
            "make-the-invisible-visible",
            "use-your-cultural-assets",
            "strategic-nonviolence",
            "al-fazaa-a-surge-of-solidarity-",
            "decolonization",
            "framing",
            "human-rights",
            "intersectionality",
            "non-cooperation",
            "pillars-of-power",
            "spectrum-of-allies",
            "baraza",
        ],
        "new-pan-afrikanism": [
            "citizens-arrest",
            "cultural-disobedience",
            "hunger-strike",
            "lamentation",
            "escalate-strategically",
            "expose-inequality-with-a-viral-gesture",
            "give-voice-to-those-that-cant-speak",
            "solidarity-not-aid",
            "the-threat-is-usually-more-terrifying-than-the-thing-itself",
            "use-organizing-strategies-that-scale",
            "gerontocracy",
            "palace-coup",
            "new-pan-afrikanism",
            "kisangani-demands-electric-power",
            "angola-15-2",
            "bring-back-our-girls",
            "fees-must-fall",
            "gambia-has-decided",
            "ghana-thinktank",
            "manich-msamah",
            "street-graduation",
            "this-flag",
            "baraza",
        ],
        "covid-19": [
            "make-the-invisible-visible",
            "simple-rules-can-have-grand-results",
            "al-fazaa",
            "guerilla-projection",
            "divestment",
            "take-risks-but-take-care",
            "prefigurative-politics",
            "peoples-shock-doctrine-",
            "breakfast-is-persuasive",
        ],
        "blacklivesmatter": [
            "direct-action",
            "peoples-shock-doctrine-",
            "the-real-action-is-your-targets-reaction",
            "anger-works-best-when-you-have-the-moral-high-ground",
            "use-the-power-of-ritual",
            "hunger-strike",
            "countering-homophobic-policing",
            "take-risks-but-take-care",
            "make-the-invisible-visible",
            "do-the-medias-work-for-them",
            "power-mapping",
            "take-leadership-from-the-most-impacted",
        ],
        # "election-protection": [
        #    "recapture-the-flag",
        #    "pillars-of-power",
        #    "general-strike",
        #    "put-your-target-in-a-decision-dilemma",
        #    "use-the-power-of-ritual",
        #    "training-for-the-win",
        #    "gambia-has-decided",
        # ],
        "myanmar-coup-response": [
            "-gambiahasdecided",
            "-thisflag",
            "battle-of-the-camel",
            "burmese-students-long-march",
            "disrupting-obamas-town-hall-in-myanmar",
            "flower-speech-campaign",
            "honk-at-parliament",
            "panty-power",
            "standing-man",
            "the-salt-march",
            "who-would-accept-",
            "cacerolazo-noise-making-protest-",
            "clandestine-leafleting",
            "civil-disobedience",
            "distributed-action",
            "general-strike",
            "hashtag-campaign",
            "jail-solidarity",
            "mass-street-action",
            "activate-international-mechanisms",
            "dont-dress-like-a-protester",
            "focus-on-basic-needs",
            "if-protest-is-made-illegal-make-daily-life-a-protest",
            "put-your-target-in-a-decision-dilemma",
            "seek-safety-in-support-networks",
            "simple-rules-can-have-grand-results",
            "the-real-action-is-your-targets-reaction",
            "-democracy-promotion-",
            "al-fazaa-a-surge-of-solidarity-",
            "direct-action",
            "framing",
            "pillars-of-power",
            "power-mapping",
            "spectrum-of-allies",
        ],
    }

    json.dump(sets, f, indent=2)
