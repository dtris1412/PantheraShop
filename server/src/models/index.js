import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import Sequelize from "sequelize";
dotenv.config();

const basename = path.basename(new URL(import.meta.url).pathname);
const env = process.env.NODE_ENV || "development";
const config = JSON.parse(
  fs.readFileSync(new URL("../config/config.json", import.meta.url))
)[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

const modelsDir = path.resolve(
  path
    .dirname(new URL(import.meta.url).pathname)
    .replace(/^\/([A-Za-z]:)/, "$1")
);
const files = fs
  .readdirSync(modelsDir)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  );

for (const file of files) {
  const { default: modelFunc } = await import(new URL(file, import.meta.url));
  const model = modelFunc(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
