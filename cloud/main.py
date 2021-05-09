#!/usr/bin/env python

import sys
from datetime import datetime

from flask import Flask, Response
import requests
import requests_cache
from requests_cache.backends import base
from lxml import etree

TOOLS = "https://api.beautifulrising.org/api/v1/modules"
SITEMAP = "https://beautifultrouble.org/sitemap.xml"


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

        for t in tools:
            url = etree.SubElement(root, "url")

            etree.SubElement(
                url, "loc"
            ).text = f"https://www.beautifultrouble.org/toolbox/#/tool/{t['slug']}"
            etree.SubElement(url, "changefreq").text = "daily"
            etree.SubElement(url, "priority").text = "0.5"
            etree.SubElement(url, "lastmod").text = datetime.fromtimestamp(
                t["timestamp"] // 1000
            ).strftime("%F")

            if t.get("image"):
                image = addsub(url, "image:image")
                addsub(
                    image, "image:loc"
                ).text = f"https://beautifulrising.org/{t['image']}"
                addsub(image, "image:title").text = t["title"]

            # Disable alternates until google crawls these
            #for lang in t.get("langs-available", []):
            #    link = addsub(url, "xhtml:link")
            #    link.attrib.update(
            #        {
            #            "hreflang": lang,
            #            "rel": "alternate",
            #            "href": f"https://www.beautifultrouble.org/toolbox/#/{lang}/tool/{t['slug']}",
            #        }
            #    )

            sitemap = etree.tostring(
                root,
                pretty_print=True,
                doctype="""<?xml version="1.0" encoding="UTF-8"?>""",
            )
    except Exception as e:
        print(e)

    return Response(sitemap, mimetype="text/xml")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug="--no-debug" not in sys.argv)
