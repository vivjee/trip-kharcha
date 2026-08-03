import {
  APPEARANCE_STORAGE_KEY,
  DEFAULT_APPEARANCE,
  FONT_OPTIONS,
  PATTERN_OPTIONS,
  SURFACE_OPTIONS,
  THEME_PRESET_BASE,
  THEME_PRESET_VARS,
} from '@/lib/appearance';

export default function AppearanceBootstrap() {
  const script = `(function(){try{
var K=${JSON.stringify(APPEARANCE_STORAGE_KEY)},D=${JSON.stringify(DEFAULT_APPEARANCE)},V=${JSON.stringify(THEME_PRESET_VARS)},B=${JSON.stringify(THEME_PRESET_BASE)};
var S=${JSON.stringify(SURFACE_OPTIONS.map((item) => item.id))},P=${JSON.stringify(PATTERN_OPTIONS.map((item) => item.id))},F=${JSON.stringify(FONT_OPTIONS.map((item) => item.id))};
var x={};try{x=JSON.parse(localStorage.getItem(K)||'{}')||{}}catch(e){}
var id=V[x.presetId]?x.presetId:D.presetId,s=S.indexOf(x.surfaceStyle)>-1?x.surfaceStyle:D.surfaceStyle,p=P.indexOf(x.pattern)>-1?x.pattern:D.pattern,f=F.indexOf(x.fontStyle)>-1?x.fontStyle:D.fontStyle;
var r=document.documentElement,v=V[id];for(var k in v){if(Object.prototype.hasOwnProperty.call(v,k))r.style.setProperty(k,v[k])}
r.setAttribute('data-theme',B[id]||'dark');r.setAttribute('data-theme-preset',id);r.setAttribute('data-surface',s);r.setAttribute('data-pattern',p);r.setAttribute('data-font-style',f);if(x.reducedMotion===true)r.classList.add('reduce-motion');
}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
