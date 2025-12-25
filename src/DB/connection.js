import mongoose from "mongoose";

const connectDB = async() => {

    return await mongoose.connect(process.env.DB_URI)
    .then(res=>{ console.log("DB connected successfully") })
    .catch(err => { console.error("DB connection failed", err) });
}

export default connectDB;