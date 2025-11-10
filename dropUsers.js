const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/simple_user_api")
  .then(async () => {
    console.log("MongoDB connected");

    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (collectionNames.includes("users")) {
      await mongoose.connection.dropCollection("users");
      console.log("Dropped users collection");
    } else {
      console.log("No users collection to drop");
    }

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
