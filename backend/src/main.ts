import app from './app';
import {connectDB} from "./config/db.config";

import { configDotenv } from "dotenv";
configDotenv();

const PORT = process.env.PORT || process.env.PORT;

connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});