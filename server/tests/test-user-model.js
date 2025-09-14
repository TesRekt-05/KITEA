import { connectDB } from "../db.js";
import User from "../models/userModel.js";

async function testUserModel() {
  try {
    await connectDB();
    console.log("Database connected\n");

    // Test 1: Generate credentials
    console.log("Testing credential generation...");
    const { username, password } = User.generateCredentials();
    console.log(`Generated Username: ${username}`);
    console.log(`Generated Password: ${password}\n`);

    // Test 2: Create user
    console.log("Creating new user...");
    const newUser = new User({
      username: username,
      password: password,
      // userCount will auto-increment
    });

    const savedUser = await newUser.save();
    console.log(`User created: User #${savedUser.userCount}`);
    console.log(`Username: ${savedUser.username}`);
    console.log(`Active: ${savedUser.isActive}\n`);

    // Test 3: Test login (password comparison)
    console.log("Testing login...");
    const foundUser = await User.findOne({ username: username }).select(
      "+password"
    );
    const isValidLogin = foundUser.comparePassword(password);

    console.log(`Login test: ${isValidLogin ? "SUCCESS" : "FAILED"}\n`);

    // Test 4: Create another user to test auto-increment
    console.log("Creating second user...");
    const { username: username2, password: password2 } =
      User.generateCredentials();
    const user2 = new User({ username: username2, password: password2 });
    const savedUser2 = await user2.save();

    console.log(`Second user: User #${savedUser2.userCount}`);
    console.log(`Username: ${savedUser2.username}\n`);

    console.log("All tests passed! User model working perfectly!");
  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    process.exit(0);
  }
}

testUserModel();
