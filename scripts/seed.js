const { seedStore } = require("../server/seed-store");

seedStore();
console.log("Seeded data/store.json from dataset CSV files.");
