"use strict";

require("dotenv").config({ path: "./backend/.env" });
const mongoose = require("mongoose");
const Log = require("./backend/src/models/Log");
const User = require("./backend/src/models/User");

const DATABASE_URL = process.env.DATABASE_URL;

async function seedLogs() {
  try {
    await mongoose.connect(DATABASE_URL);
    console.log("Connected to MongoDB");

    // Clear existing logs
    await Log.deleteMany({});
    
    // Get some users to associate logs with
    const users = await User.find().limit(5);
    const mockNames = users.length > 0 
        ? users.map(u => `${u.firstName} ${u.lastName}`)
        : ["John Doe", "Sarah M.", "Mike R.", "Emma W.", "David L."];

    const types = ["Gesture Translation", "Live Interpretation"];
    const statuses = ["Completed", "Pending", "Failed"];
    const durations = ["1m 12s", "4m 50s", "--", "12m 05s", "0m 45s", "2m 30s"];

    const logsToInsert = [];

    // Generate 15 random logs
    for (let i = 0; i < 15; i++) {
        const randomUser = mockNames[Math.floor(Math.random() * mockNames.length)];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        let randomDuration = durations[Math.floor(Math.random() * durations.length)];
        if (randomStatus === "Pending") randomDuration = "--";

        // Random date within the last 7 days
        const randomDate = new Date();
        randomDate.setHours(randomDate.getHours() - Math.floor(Math.random() * 168));

        logsToInsert.push({
            user: randomUser,
            type: randomType,
            status: randomStatus,
            duration: randomDuration,
            createdAt: randomDate,
        });
    }

    await Log.insertMany(logsToInsert);
    console.log(`Successfully seeded ${logsToInsert.length} logs!`);

  } catch (err) {
    console.error("Error seeding logs:", err);
  } finally {
    mongoose.disconnect();
  }
}

seedLogs();
