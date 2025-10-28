import { Sequelize } from "sequelize";

const sequelize = new Sequelize("PantheraShop", "root", null, {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("connect has been established successfully");
  } catch (err) {
    console.error("unable to connect to the database: ", err);
  }
};
export default connectDB;
