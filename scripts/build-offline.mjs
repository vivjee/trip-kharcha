import { readdir, readFile, writeFile, unlink, access } from "node:fs/promises";
import { createHash } from "node:crypto";
async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}
// Keep source photos in public, but ship only their generated responsive assets.
for (const type of ["day_hike", "night_camp", "short_trek", "long_trek"]) {
  await access(`out/images/trip-types/${type}.webp`);
  await access(`out/images/trip-types/${type}-thumb.webp`);
  await unlink(`out/images/trip-types/${type}.jpg`).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
}
const html = await readFile("out/index.html", "utf8");
const fonts = [...html.matchAll(/href="([^"]+\.woff2?)"[^>]*as="font"/g)].map(
  (m) => m[1],
);
const urls = (await walk("out"))
  .filter(
    (p) =>
      /\.(js|css|html|txt|webp|ico|json|webmanifest)$/.test(p) &&
      !p.endsWith("/sw.js"),
  )
  .map((p) => p.slice(3));
urls.push(...fonts);
const version = createHash("sha256")
  .update(urls.join("\n") + html)
  .digest("hex")
  .slice(0, 16);
const source = `const CACHE='tripkharcha-${version}';
const ASSETS=${JSON.stringify([...new Set(urls)])};
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(async cache=>{for(let i=0;i<ASSETS.length;i+=8)await cache.addAll(ASSETS.slice(i,i+8));}));});
// No skipWaiting or forced reload: an update cannot interrupt a form or active trip.
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith('tripkharcha-')||k.startsWith('trip-calculator-'))&&k!==CACHE).map(k=>caches.delete(k)))));});
self.addEventListener('fetch',event=>{
 const request=event.request;const url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  let path=url.pathname;
  if(request.mode==='navigate')path=(path.endsWith('/')?path:path+'/')+'index.html';
  const cached=await cache.match(path,{ignoreSearch:true});
  if(cached)return cached;
  try{const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response;}
  catch(error){const fallback=await cache.match(request,{ignoreSearch:true});if(fallback)return fallback;throw error;}
 })());
});
`;
await writeFile("out/sw.js", source);
console.log(
  `Offline cache ${version}: ${urls.length} exported assets, ${fonts.length} default font files.`,
);
