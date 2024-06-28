import mongoose from "mongoose";

const connect = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("Connected to the database");
};

export default connect;
