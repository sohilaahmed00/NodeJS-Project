import dns from "dns";
import chalk from 'chalk';

dns.setServers(["8.8.8.8", "8.8.4.4"]);

import "./config/config.js";

import mongoose from "mongoose";
import { app } from "./app.js";

let server;
try {
  await mongoose.connect(
    process.env.DB_URI.replace("<db_user>", process.env.DB_USER).replace(
      "<db_password>",
      process.env.DB_PASSWORD,
    ),
  );
  console.log("DB connected!");

  const PORT = process.env.PORT || 3000;
  server = app.listen(PORT, () =>
    console.log(`Server listening on port ${PORT}!`),
  );
  console.log(
  `open url ${chalk.blue('http://localhost:3000/api-docs/')} to get endpoints`
);
} catch (error) {
  console.log(error);
}
