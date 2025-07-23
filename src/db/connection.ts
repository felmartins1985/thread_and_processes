import { Sequelize } from "sequelize";
import ValidatedUser from "./validated-users.model";

const sequelize = new Sequelize("postgres", "postgres", "postgres", {
  host: "localhost",
  port: 5433,
  dialect: "postgres",
  define: {
    schema: "public",
  },
  logging: false,
});

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    await sequelize.sync({ alter: true });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
}

async function closeDB() {
  try {
    await sequelize.close();
    console.log("Database connection closed successfully.");
  } catch (error) {
    console.error("Error closing the database connection:", error);
  }
}

//@ts-ignore
async function validateOrCreateTable(sequelize, ValidatedUser) {
  console.log("Preparing database...");

  await sequelize.authenticate();
  const tableExists = await sequelize.query(
    "SELECT to_regclass('public.validatedUsers');"
  );

  //@ts-ignore
  if (!tableExists[0][0].to_regclass) {
    await ValidatedUser.sync();
    console.log("ValidatedUser table created.");
  } else {
    console.log("ValidatedUser table already exists.");
  }
}

export { sequelize, connectDB, closeDB, validateOrCreateTable };
