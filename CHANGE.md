# Changelog
All notable changes to this project will be documented in this file.  More specifically, breaking API changes will be noted here

## NEXT Version

- Improved performance by reducing objects created, making equality checks cheaper, and unsubscribing the render loop when nothing
  has changed. This caused a 0.08kb increase in gzipped size.
- Added onScroll event handler.

## [2.2.7] - 2018-02-16
### Fixed

- fixed detection of inline elements.

## [2.2.6] - 2018-02-16
### Fixed

- resize event for iOS. In iOS, when the navbar comes down it counts as a resize, this was causing unexpected behavior for the "once" option because resize was erroneously reindexing the page instead of just calling an update to targets.

## [2.2.5] - 2018-02-08
### Added

- added index to ctx for JavaScript callbacks: onChange, onHidden, and onShown.

## [2.1.0] - 2018-06-28
### Added 

- added ```--intersect-x``` and ```--intersect-y``` CSS variables to signify whether the element is intersecting the start or end of the viewport.


## [2.0.0] - 2018-06-25
### Added

- added "scrollingElement" option to target specific non-window scroll containers
- add compatibility guard for CSS variables
- add css vars for direction of scroll on scroll container (--scroll-dir-x, --scroll-dir-y) 
- add css vars for percent visible to elements (--visible-x, --visible-y)
- add css vars for dimensions to elements (--element-width, --element-height)

### Optimizations

- all DOM writes happen on rAF, all DOM reads happen in update all at once
- onChange, onHidden, onShown are deferred until animation frame directly after setting all attributes/css vars
- The update and index method are now throttled as well

### Breaking API Changes

- remove inClass/outClass option
- remove delay option
- onChange passes a context object rather than just a boolean for visibility
