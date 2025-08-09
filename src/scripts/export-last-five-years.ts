import { createWriteStream, mkdirSync, existsSync } from "node:fs";
import User from "../db/user.model";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { closeDB, connectDB } from "../db/connection";
const dataDir = "./data";
if (!existsSync(dataDir)) {
  mkdirSync(dataDir);
}
async function* selectEntireDB() {
  const defaultLimit = 100;
  let skip = 0;
  while (true) {
    const data = await User.findAll({
      limit: defaultLimit,
      offset: skip,
      raw: true,
    });
    skip += defaultLimit;
    if (!data.length) break;
    for (const row of data) yield row;
  }
}
let processedItems = 0;

const stream = Readable.from(selectEntireDB())
  .filter(
    ({ createdAt }) =>
      new Date(createdAt) > new Date(new Date().getFullYear() - 5, 0, 1)
  )
  .map((item) => {
    processedItems++;
    return JSON.stringify(item).concat("\n");
  });
(async () => {
  await connectDB();
  console.time("sql-to-json");
  await pipeline(stream, createWriteStream(`${dataDir}/users.ndjson`));
  console.timeEnd("sql-to-json");
  console.log(`Registros Processados: ${processedItems}`);
  await closeDB();
})();

// npx ts-node-dev src/scripts/export-last-five-years.ts