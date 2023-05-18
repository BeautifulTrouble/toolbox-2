#!/usr/bin/env python

import sys
import traceback
from datetime import datetime

from flask import Flask, Response
import requests
import requests_cache
from requests_cache.backends import base
from lxml import etree

TOOLS = "https://api.beautifultrouble.org/v2/en/toolbox.json"
SITEMAP = "https://beautifultrouble.squarespace.com/sitemap.xml"


app = Flask(__name__)
requests_cache.install_cache("sitemap", backend="memory")


def addns(root, alias, uri):
    new_root = etree.Element(
        root.tag, attrib=root.attrib, nsmap={alias: uri, **root.nsmap}
    )
    new_root[:] = root[:]
    return new_root.getroottree()


def addsub(el, tag):
    if ":" in tag:
        alias, tag = tag.split(":", maxsplit=1)
        tag = "{%s}%s" % (el.getroottree().getroot().nsmap[alias], tag)
    return etree.SubElement(el, tag)


@app.route("/")
@app.route("/sitemap.xml")
def sitemap():
    """
    Provide an updated sitemap which includes tool pages
    """
    tools = requests.get(TOOLS).json()
    sitemap = requests.get(SITEMAP).text

    try:
        # Removing whitespace in the source allows the output pretty-printer to work
        orig = etree.fromstring(
            sitemap.encode(), etree.XMLParser(remove_blank_text=True)
        )
        tree = addns(orig, "xhtml", "http://www.w3.org/1999/xhtml")
        root = tree.getroot()

        for i, (slug, tool) in enumerate(tools["tools"].items()):
            url_el = etree.SubElement(root, "url")

            url = f"https://beautifultrouble.org/toolbox/tool/{tool['slug']}"
            etree.SubElement(url_el, "loc").text = url

            date = datetime.fromtimestamp(tool["lastmod"]).strftime("%F")
            etree.SubElement(url_el, "lastmod").text = date

            if image := tool.get("image"):
                image_el = addsub(url_el, "image:image")
                image_url = f"https://assets.beautifultrouble.org/{image}"
                addsub(image_el, "image:loc").text = image_url

            # Disable alternates until google crawls these
            # for lang in tool.get("langs-available", []):
            #    link = addsub(url_el, "xhtml:link")
            #    link.attrib.update(
            #        {
            #            "hreflang": lang,
            #            "rel": "alternate",
            #            "href": f"https://beautifultrouble.org/toolbox/{lang}/tool/{tool['slug']}",
            #        }
            #    )

        sitemap = etree.tostring(
            root,
            pretty_print=True,
            doctype="""<?xml version="1.0" encoding="UTF-8"?>""",
        )
    except Exception as e:
        traceback.print_tb(e)

    return Response(sitemap, mimetype="text/xml")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug="--no-debug" not in sys.argv)
