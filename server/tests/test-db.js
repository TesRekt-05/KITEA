import { connectDB } from '../db.js';

console.log("Testing database connection...");

connectDB()
  .then(() => {
    console.log("Happy Happy Happyyy!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("helll nawwwwwww:", error);
    process.exit(1);
  });
