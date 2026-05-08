require("dotenv").config();
const mongoose = require("mongoose");
const { User } = require("../db");

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node scripts/makeAdmin.js <email>");
    process.exit(1);
  }
  if (!process.env.MONGODB_URL) {
    console.error("MONGODB_URL is not set");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URL);
  try {
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: "admin" },
      { new: true, projection: "-passwordHash" }
    );
    if (!user) {
      console.error(`No user found with email: ${email}`);
      process.exit(2);
    }
    console.log(`Promoted ${user.email} to admin`);
  } finally {
    await mongoose.connection.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
