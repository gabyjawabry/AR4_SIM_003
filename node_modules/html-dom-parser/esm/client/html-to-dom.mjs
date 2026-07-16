import domparser from './domparser.mjs';
import { formatDOM } from './utilities.mjs';

var DIRECTIVE_REGEX = /<(![a-zA-Z\s]+)>/; // e.g., <!doctype html>
/**
 * Parses HTML string to DOM nodes in browser.
 *
 * @param html - HTML markup.
 * @param options - Parser options.
 * @returns - DOM elements.
 */
function HTMLDOMParser(html, options) {
    if (typeof html !== 'string') {
        throw new TypeError('First argument must be a string');
    }
    if (!html) {
        return [];
    }
    // match directive
    var match = DIRECTIVE_REGEX.exec(html);
    var directive = match ? match[1] : undefined;
    return formatDOM(domparser(html, options === null || options === void 0 ? void 0 : options.trustedTypePolicy), null, directive);
}

export { HTMLDOMParser as default };
//# sourceMappingURL=html-to-dom.mjs.map
