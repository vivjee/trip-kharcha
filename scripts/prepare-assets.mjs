import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
for (const name of await readdir("public/images/trip-types")) {
  if (!name.endsWith(".jpg")) continue;
  const source = `public/images/trip-types/${name}`;
  const target = source.replace(".jpg", ".webp");
  const thumbnail = source.replace(".jpg", "-thumb.webp");
  const sourceTime = (await stat(source)).mtimeMs;
  const fresh = await Promise.all([stat(target), stat(thumbnail)])
    .then((files) => files.every((s) => s.mtimeMs >= sourceTime))
    .catch(() => false);
  if (fresh) continue;
  await sharp(source)
    .resize(1280, 720, { fit: "cover", withoutEnlargement: true })
    .webp({ quality: 76 })
    .toFile(target);
  await sharp(source)
    .resize(640, 360, { fit: "cover", withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(thumbnail);
}
