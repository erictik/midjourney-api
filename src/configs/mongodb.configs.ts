import mongoose from "mongoose";
import configs from "../configs/env.configs";

const mongoConn = mongoose
    .connect(configs.mongo.mongodbUri,)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err: any) => {
        console.error("Error connecting to MongoDB", err);
    });


export default mongoConn;