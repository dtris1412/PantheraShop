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

// Ưu tiên đọc từ environment variables
if (process.env.DB_NAME) {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD || null,
    {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      dialect: process.env.DB_DIALECT || "mysql",
      logging: process.env.NODE_ENV === "development" ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      dialectOptions:
        process.env.NODE_ENV === "production" && process.env.DB_SSL === "true"
          ? {
              ssl: {
                require: true,
                rejectUnauthorized: false,
              },
            }
          : {},
    }
  );
} else if (config.use_env_variable) {
  // Fallback: DATABASE_URL
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // Fallback: config.json
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
