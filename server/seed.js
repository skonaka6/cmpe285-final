import db from "./db.js";

const NAMES = [
  "Luna", "Cooper", "Bella", "Max", "Daisy", "Charlie", "Milo", "Lucy",
  "Buddy", "Sadie", "Rocky", "Molly", "Bear", "Sophie", "Duke", "Chloe",
  "Tucker", "Lily", "Oliver", "Zoey", "Jack", "Stella", "Toby", "Penny",
  "Leo", "Nala", "Winston", "Ruby", "Finn", "Rosie", "Archie", "Pepper",
  "Gus", "Willow", "Murphy", "Hazel", "Zeus", "Ginger", "Rex", "Coco",
  "Bruno", "Maggie", "Oscar", "Ellie", "Louie", "Abby", "Henry", "Roxy",
  "Sam", "Gracie", "Benny", "Ivy", "Jasper", "Maya", "Thor", "Piper",
  "Bandit", "Nova", "Scout", "Cleo", "Shadow", "Athena", "Blue", "Juno",
  "Ace", "Maple", "Ranger", "Sage", "Koda", "Pearl", "Otis", "Fern",
  "Marley", "Indie", "Casper", "Opal", "Rocco", "Wren", "Simba", "Fiona",
  "Clyde", "Harper", "Baxter", "Jade", "Chester", "Aurora", "Hugo", "Violet",
  "Rufus", "Iris", "Gizmo", "Ember", "Peanut", "Sky", "Mochi", "River",
  "Pickles", "Storm", "Nugget", "Sunny", "Pixel", "Ash", "Clover", "Onyx",
  "Pippin", "Echo", "Miso", "Blaze", "Honey", "Comet", "Maple", "Ziggy",
  "Nori", "Basil", "Tango", "Mochi", "Sable", "Quest",
];

const BREEDS = [
  "Tabby mix", "Golden Retriever", "Domestic Shorthair", "Beagle",
  "Labrador mix", "Siamese", "Border Collie", "Maine Coon", "Chihuahua",
  "Poodle mix", "Persian", "Australian Shepherd", "Ragdoll", "Pit Bull mix",
  "Corgi", "Bengal", "Husky mix", "Scottish Fold", "Dachshund", "Calico",
  "German Shepherd", "Russian Blue", "Shih Tzu", "Tuxedo cat", "Boxer mix",
  "American Shorthair", "Cocker Spaniel", "Bombay", "Maltese", "Orange tabby",
];

const TRAITS = [
  "Loves sunny windowsills", "Great with kids", "Playful and curious",
  "Calm cuddle buddy", "Loves fetch", "Indoor only", "Leash trained",
  "Talkative greeter", "Gentle senior", "Food motivated", "Lap cat energy",
  "High energy runner", "Shy but sweet", "Dog-friendly", "Cat-friendly",
];

const TARGET = 120;
const force = process.argv.includes("--force");

const count = db.prepare("SELECT COUNT(*) AS count FROM items").get().count;

if (count >= TARGET && !force) {
  console.log(`Database already has ${count} items (>= ${TARGET}). Use --force to reseed.`);
  process.exit(0);
}

if (force) {
  db.exec(`DELETE FROM votes; DELETE FROM items;`);
  console.log("Cleared items and votes.");
}

const insert = db.prepare(
  `INSERT INTO items (id, title, description, image_url) VALUES (?, ?, ?, ?)`
);

const rows = [];
for (let i = 1; i <= TARGET; i++) {
  const name = NAMES[(i - 1) % NAMES.length];
  const breed = BREEDS[(i * 7) % BREEDS.length];
  const trait = TRAITS[(i * 13) % TRAITS.length];
  const suffix = i > NAMES.length ? ` #${i}` : "";
  rows.push([
    i,
    `${name}${suffix}`,
    `${breed} · ${trait}`,
    `https://picsum.photos/seed/adopt-pet-${i}/400/500`,
  ]);
}

const seed = db.transaction((items) => {
  for (const item of items) insert.run(...item);
});

seed(rows);
console.log(`Seeded ${TARGET} adoptable pet items.`);
