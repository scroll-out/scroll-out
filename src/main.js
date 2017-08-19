var _ = undefined;
var win = window;
var resize = "resize";
var scroll = "scroll";
var defaultInClass = "scroll-in";
var defaultOutClass = "scroll-out";

function map(items, fn) {
  var results = [];
  for (var i = 0, ilen = items.length; i < ilen; i++) {
    var result = fn(items[i], i, ilen);
    if (result !== _) {
      results.push(result);
    }
  }
  return results;
}

function toggleClass(el, className, enabled, forceReflow) {
  if (el.classList.contains(className) !== enabled) {
    // set new state of class
    el.classList.toggle(className, enabled);

    if (forceReflow) {
      // temporarily unset all classes
      var classValue = el.className;
      el.className = "";

      // trigger reflow.  this is a workaround for partially defined animations
      void el.offsetWidth;

      // add classes back to element
      el.className = classValue;
    }
  }
}

function on(el, event, fn) {
  el.addEventListener(event, fn);
}

function off(el, event, fn) {
  el.removeEventListener(event, fn);
}

export default function(opts) {
  // set default options
  var opts = opts || {};
  var once = opts.once !== false;
  var delay = opts.delay || 40;
  var forceReflow = opts.forceReflow;
  var inClass = opts.inClass || defaultInClass;
  var outClass = opts.outClass || defaultOutClass;
  var selector = "." + inClass + ",." + outClass;
  var element =
    (typeof opts.element === "string"
      ? document.querySelector(element)
      : opts.element) || document;

  // Percentage offset of viewport before triggering
  var lastCheck = _;
  var lastScroll = _;
  var timeout = _;
  var offset = 0;
  var scrollTop = 0;
  var rects = [];

  var index = function() {
    return (rects = map(element.querySelectorAll(selector), function(el) {
      var rect = el.getBoundingClientRect();
      rect.L = el;
      return rect;
    }));
  };

  var update = function() {
    timeout = _;
    var height = win.innerHeight;

    rects = map(rects, function(rect, i) {
      var show =
        rect.bottom > scrollTop &&
        rect.top < scrollTop + height - height * offset;

      if (rect.show !== show) {
        toggleClass(rect.L, inClass, show, forceReflow);
        toggleClass(rect.L, outClass, !show, forceReflow);
      }

      rect.show = show;

      return once && show ? _ : rect;
    });

    lastScroll = scrollTop;
  };

  var check = function() {
    if (timeout === _ && rects.length && lastScroll !== scrollTop) {
      timeout = setTimeout(update, delay);
    }
  };

  var onScroll = function() {
    scrollTop = win.pageYOffset;
    check();
  };

  // run initialize index and check
  index();
  check();

  // hook up document listeners to automatically detect changes
  on(win, resize, index);
  on(win, resize, onScroll);
  on(win, scroll, onScroll);

  return {
    teardown: function() {
      off(win, resize, index);
      off(win, resize, onScroll);
      off(win, scroll, onScroll);
    }
  };
}
