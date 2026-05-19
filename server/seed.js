import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
const stylesPath = path.join(dataDir, "styles.csv");
const imagesPath = path.join(dataDir, "images.csv");

const TARGET = 100;
const force = process.argv.includes("--force");

/** Minimal CSV line parser (handles quoted fields). */
function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function loadStyles(limit) {
  const text = fs.readFileSync(stylesPath, "utf8");
  const lines = text.split(/\r?\n/).filter((line) => line.length > 0);
  const header = parseCsvLine(lines[0]);
  const idIdx = header.indexOf("id");
  const nameIdx = header.indexOf("productDisplayName");
  const genderIdx = header.indexOf("gender");
  const articleIdx = header.indexOf("articleType");
  const colourIdx = header.indexOf("baseColour");
  const usageIdx = header.indexOf("usage");

  if (idIdx === -1 || nameIdx === -1) {
    throw new Error("styles.csv must include id and productDisplayName columns");
  }

  const styles = [];
  for (let i = 1; i < lines.length && styles.length < limit; i++) {
    const cols = parseCsvLine(lines[i]);
    const id = Number(cols[idIdx]);
    if (!Number.isFinite(id)) continue;

    const title = cols[nameIdx];
    const description = [
      cols[genderIdx],
      cols[articleIdx],
      cols[colourIdx],
      cols[usageIdx],
    ]
      .filter(Boolean)
      .join(" · ");

    styles.push({ id, title, description });
  }
  return styles;
}

function loadImageMap() {
  const text = fs.readFileSync(imagesPath, "utf8");
  const lines = text.split(/\r?\n/).filter((line) => line.length > 0);
  const map = new Map();

  for (let i = 1; i < lines.length; i++) {
    const [filename, link] = parseCsvLine(lines[i]);
    if (!filename || !link) continue;
    const id = Number(filename.replace(/\.jpg$/i, ""));
    if (Number.isFinite(id)) map.set(id, link);
  }
  return map;
}

const count = db.prepare("SELECT COUNT(*) AS count FROM items").get().count;

if (count >= TARGET && !force) {
  console.log(
    `Database already has ${count} items (>= ${TARGET}). Use --force to reseed.`
  );
  process.exit(0);
}

db.exec(`DELETE FROM votes; DELETE FROM items;`);
console.log("Cleared items and votes.");

const styles = loadStyles(TARGET);
const imageMap = loadImageMap();

const insert = db.prepare(
  `INSERT INTO items (id, title, description, image_url) VALUES (?, ?, ?, ?)`
);

const rows = [];
let skipped = 0;

for (const style of styles) {
  const imageUrl = imageMap.get(style.id);
  if (!imageUrl) {
    skipped++;
    console.warn(`No image for item id ${style.id}, skipping.`);
    continue;
  }
  rows.push([style.id, style.title, style.description, imageUrl]);
}

if (rows.length < TARGET) {
  console.warn(
    `Only ${rows.length} items ready (target ${TARGET}); ${skipped} skipped without images.`
  );
}

const seed = db.transaction((items) => {
  for (const item of items) insert.run(...item);
});

seed(rows);
console.log(`Seeded ${rows.length} clothing items from CSV.`);
