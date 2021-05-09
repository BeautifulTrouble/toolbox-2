#!/usr/bin/env python

import re
import os
import time
import traceback
import unidecode
from selenium import webdriver
from selenium.webdriver.common.keys import Keys


def slugify(s, allow=""):
    """
    Reproduce these steps for consistent slugs!
    """
    s = unidecode.unidecode(s).lower().replace("'", "")
    return re.sub(rf"[^\w{allow}]+", "-", s)


os.makedirs("tiles", exist_ok=True)

options = webdriver.ChromeOptions()
# options.add_argument(f"--force-device-scale-factor=1.5")

driver = webdriver.Chrome(options=options)
driver.get("https://beautifultrouble.org/toolbox-experimental")
driver.execute_cdp_cmd(
    "Emulation.setDefaultBackgroundColorOverride",
    {"color": {"r": 255, "g": 255, "b": 255, "a": 0}},
)
driver.set_window_size(1600, 1100)
time.sleep(3)

for i, el in enumerate(driver.find_elements_by_css_selector(".tool-tile")):
    try:
        el.location_once_scrolled_into_view
        time.sleep(0.01 if i else 1)
        slug = slugify(el.find_element_by_css_selector(".title").text)
        print(slug)
        el.screenshot(f"tiles/{slug}.png")
    except Exception as e:
        print(traceback.format_exc())
