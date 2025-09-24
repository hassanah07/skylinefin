const mongoose = require("mongoose");
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/myapp";
const connectToMongoDB = async () => {
  try {
    const connect = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${connect.connection.host}`);
    if (!connect) {
      console.log("problem connecting to Mongoose");
    } else {
      console.log("Database Connection Successful");
      errorStatus = false;
    }
  } catch (error) {
    console.log("retrying in 2 Second");
    setTimeout(connectToMongoose, 2000);
  }
};
module.exports = connectToMongoDB;
