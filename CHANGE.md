# Changelog
All notable changes to this project will be documented in this file.  More specifically, breaking API changes will be noted here

## [2.0.0] - 2018-06-??
### Added

- added "scrollingElement" option to target specific non-window scroll containers
- add compatibility guard for CSS variables
- add css vars for direction of scroll on scroll container (--scroll-dir-x, --scroll-dir-y)
- add css vars for scroll-container average direction  (--scroll-avg-x, --scroll-avg-y)
- add css vars for percent visible to elements (--percent-visible-x, --percent-visible-y)

### Optimizations

- all DOM writes happen on rAF, all DOM reads happen in update all at once
- onChange, onHidden, onShown are deferred until animation frame directly after setting all attributes/css vars
- The update and index method are now throttled as well

### Breaking API Changes

- remove inClass/outClass option
- remove delay option
- onChange passes a context object rather than just a boolean for visibility
