const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/simple_user_api")
  .then(async () => {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const names = collections.map(c => c.name);

    if (names.includes("users")) {
      await mongoose.connection.dropCollection("users");
      console.log("Dropped users collection");
    } else {
      console.log("No users collection found");
    }

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
