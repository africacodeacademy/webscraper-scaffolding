import { JSDOM } from "jsdom";
import fetch from "node-fetch";

// collect URL command-line argument
// making this global to avoid having to pass it around as a parameter
/** @global */
const siteUrl = process.argv[2];

/**
 * @function fetchHTML
 * Return processed HTML from global `siteUrl`
 * *
 * @returns {Promise} - Promise resolving to an HTML document
 */
async function fetchHTML(url) {
  try {
    const response = await fetch(siteUrl);
    const body = await response.text();
    return new JSDOM(body).window.document;
  } catch (error) {
    console.error(`failed to retrieve HTML for ${url}`);
    console.error(error);
    console.error("\nExiting.");
    process.exit(-1);
  }
}

/**
 * @function processHtml
 * Search html for tag and print results
 *
 * @param {Document} dom - HTML Document
 * @param {string} tag - Tag for which to scrape HTML
 * @param {string} attribute - The attribute to collect for `tag` elements
 *                             (for example, href from `a` tags, or src from `img` tags)
 *
 * @returns {undefined} - No return; simply print results
 */
function processHtml(dom, tag, attribute) {
  // get `tag` elements from `html`
  const tagElements = [...dom.querySelectorAll(tag)];

  // collect the `attribute` property for each
  const attributes = tagElements.map((element) => {
    let attr = element[attribute];
    // if the attribute starts with '/', add global siteUrl to the front for an "absolute" url
    if (attr.startsWith("/")) attr = siteUrl + attr;
    return attr;
  });

  // sort the attributes
  const sortedAttributes = attributes.sort();

  // print the attributes, de-duplicating as we go
  // track what the last printed attribute was
  let lastPrinted = null;
  for (let i = 0; i < sortedAttributes.length; i++) {
    // if this is the same as the last, don't print
    if (sortedAttributes[i] === lastPrinted) continue;

    // otherwise, print and update lastPrinted
    console.log(sortedAttributes[i]);
    lastPrinted = sortedAttributes[i];
  }
}

// wrapper function to run processHtml for links
function printLinks(html) {
  console.log("\n-------> Links");
  processHtml(html, "a", "href");
}

// wrapper function to run processHtml for images
function printImages(html) {
  console.log("\n-------> Images");
  processHtml(html, "img", "src");
}

// ----------- main program ------- //
// needs to be a separate function so we can use async/await
async function main() {
  // fetch and parse HTML from URL
  const siteHtml = await fetchHTML(siteUrl);

  printLinks(siteHtml);
  printImages(siteHtml);
}

// run main function
main();
