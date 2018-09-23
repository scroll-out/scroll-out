var ScrollOut=function(){"use strict"
function w(){}var E,t=[],S=[]
function y(){S.slice().forEach(function(e){return e()})
var e=t
t=[],e.forEach(function(e){return e.f.apply(0,e.a)}),E=S.length?requestAnimationFrame(y):0}function D(e){return e=e||w,function(){e.apply(0,arguments)}}function L(e,t,n){return e<t?t:n<e?n:e}function P(e){return(0<e)-(e<0)}var n={}
function b(e){return n[e]||(n[e]=e.replace(/([A-Z])/g,r))}function r(e){return"-"+e[0].toLowerCase()}var A=window,H=document.documentElement
function O(e,t){return e&&0!=e.length?e.nodeName?[e]:[].slice.call(e[0].nodeName?e:(t||H).querySelectorAll(e)):[]}var x=D(function(e,t){for(var n in t)e.setAttribute("data-"+b(n),t[n])}),W="scroll",N="resize",T="addEventListener",$="removeEventListener",_=0
return function(h){var o,i,c,l,d,p,t,s=D((h=h||{}).onChange),f=D(h.onHidden),u=D(h.onShown),a=h.cssProps?(o=h.cssProps,D(function(e,t){for(var n in t)(1==o||o[n])&&e.style.setProperty("--"+b(n),(r=t[n],Math.round(1e4*r)/1e4))
var r})):w,e=h.scrollingElement,g=e?O(e)[0]:A,m=e?O(e)[0]:H,r=++_,v=function(e,t,n){return e[t+r]!=(e[t+r]=JSON.stringify(n))},n=function(){l=!0},X=function(){var a=m.clientWidth,v=m.clientHeight,e=P(-d+(d=m.scrollLeft||A.pageXOffset)),t=P(-p+(p=m.scrollTop||A.pageYOffset)),n=m.scrollLeft/(m.scrollWidth-a||1),r=m.scrollTop/(m.scrollHeight-v||1)
i={scrollDirX:e,scrollDirY:t,scrollPercentX:n,scrollPercentY:r},l&&(l=!1,c=O(h.targets||"[data-scroll]",O(h.scope||m)[0]).map(function(e){return{$:e,ctx:{}}})),c.forEach(function(e){for(var t=e.$,n=t,r=0,o=0;r+=n.offsetLeft,o+=n.offsetTop,(n=n.offsetParent)&&n!=g;);var i=t.clientWidth,c=t.clientHeight,l=(L(r+i,d,d+a)-L(r,d,d+a))/i,s=(L(o+c,p,p+v)-L(o,p,p+v))/c,f=L((d-(i/2+r-a/2))/(a/2),-1,1),u=L((p-(c/2+o-v/2))/(v/2),-1,1)
e.ctx={elementHeight:c,elementWidth:i,intersectX:1==l?0:P(r-d),intersectY:1==s?0:P(o-p),offsetX:r,offsetY:o,viewportX:f,viewportY:u,visibleX:l,visibleY:s,visible:+(h.offset?h.offset<=p:(h.threshold||0)<l*s)}})},Y=(t=function(){if(c){v(m,"_S",i)&&(x(m,{scrollDirX:i.scrollDirX,scrollDirY:i.scrollDirY}),a(m,i))
for(var e=c.length-1;-1<e;e--){var t=c[e],n=t.$,r=t.ctx,o=r.visible
v(n,"_SO",r)&&a(n,r),v(n,"_SV",o)&&(x(n,{scroll:o?"in":"out"}),s(n,r,m),(o?u:f)(n,r,m)),o&&h.once&&c.splice(e,1)}}},S.push(t),E||y(),function(){!(S=S.filter(function(e){return e!=t})).length&&E&&cancelAnimationFrame(E)})
return n(),X(),A[T](N,n),g[T](W,X),{index:n,update:X,teardown:function(){Y(),A[$](N,n),g[$](W,X)}}}}()
