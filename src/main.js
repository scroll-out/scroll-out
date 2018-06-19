/** @type import('../types').IScrollOutOptions */

var _ = void 0;
var win = window;
var doc = document.documentElement; 
var PREFIX = 'data-scroll';

function noop() {}

/**
 * 
 * @param {number} v 
 * @param {number} min 
 * @param {number} max 
 */
function clamp(v, min, max) {
    return min > v ? min : max < v ? max : v;
} 

/** 
 * find elements
 * @param {Node | Node[] | NodeList | string} e
 * @param {Node} param
 * @returns {HTMLElement[]}
 */
function $(e, parent) {
    return !e || e.length == 0
        ? // null or empty string returns empty array
          []
        : e.nodeName
            ? // a single element is wrapped in an array
              [e]
            : // selector and NodeList are converted to Element[]
              [].slice.call(e[0].nodeName ? e : (parent || doc).querySelectorAll(e));
}
/** 
 * Creates a new instance of ScrollOut that marks elements in the viewport with an "in" class
 * and marks elements outside of the viewport with an "out"
 * @param {IScrollOutOptions} opts
 */
export default function(opts) {
    // set default options 
    opts = opts || {};
    var inClass = opts.inClass || _;
    var outClass = opts.outClass || _;

    // define locals
    var timeout, current;

    /** @type {HTMLElement[]} */ 
    var elements;

    function isVisible(es, h) {
        return opts.offset 
            ? opts.offset <= viewStart 
            : (opts.threshold || 0) < (clamp(es + h, current.x0, current.x1) - clamp(es, current.x0, current.x1)) / h;   
    }

    function index() {
        elements = $(opts.targets || "[" + PREFIX + "]", $(opts.scope || doc)[0]);
        check();
    };

    function attr(el, name, value) {
        el.setAttribute(name, value);
    }

    function update() {
        timeout = _;
        // calculate new dimensions
        var next = {
            x0: win.pageYOffset || doc.scrollTop,
            x1: viewStart + doc.clientHeight
        } 

        var yDir = current && next.x0 < current.x0;

        // escape if nothing has changed
        if (!elements.length || (!current || (current.x0 === next.x0 && current.x1 === next.x1))) {
            return;
        }

        // save the current data for comparison
        current = next;

        // mark the browser with the current direction
        if (doc._SOYD_ !== yDir) {
            doc._SOYD_ = yDir;
            attr(doc, PREFIX + '-dir-y', yDir ? 1: -1);
        }

        elements = elements.filter(function(element) {
            // figure out if visible
            var show = isVisible(next, element);

            // if last state is not the same, flip the classes and state
            // we use a local property because the lookup is a lot faster than a class or data attribute lookup
            if (element._SO_ !== show) {
                // set the new state. we do this on the element, so re-queries pick up the correct state
                element._SO_ = show;
                attr(el, PREFIX, show ? "in" : "out");

                // set new state of class
                var clAdd = show ? inClass : outClass;
                clAdd && element.classList.add(clAdd);

                var clRemove = !show ? inClass : outClass;
                clRemove && element.classList.remove(clRemove);

                // handle callbacks
                (opts.onChange || noop)(element, show, isReversed);
                ((show ? opts.onShown : opts.onHidden) || noop)(element); 
            }

            // if this is shown multiple times, put it back in the list
            return !(show && opts.once);
        })
    };

    function check() {
        timeout || (timeout = setTimeout(update, opts.delay || 16));
    };

    // run initialize index and check
    index();

    // hook up document listeners to automatically detect changes 
    win.addEventListener('resize', index);
    doc.addEventListener('scroll', check);

    return {
        index: index,
        update: update,
        teardown: function() {
            win.removeEventListener('resize', index);
            doc.removeEventListener('scroll', check);
        }
    };
}
