import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      // define association here
      Payment.belongsTo(models.Order, { foreignKey: "order_id" });
      Payment.belongsTo(models.User, { foreignKey: "user_id" });
      Payment.belongsTo(models.Voucher, { foreignKey: "voucher_id" });
    }
  }
  Payment.init(
    {
      payment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      payment_method: DataTypes.STRING,
      payment_status: DataTypes.STRING,
      paid_at: DataTypes.DATE,
      payment_info: DataTypes.TEXT,
      order_id: {
        type: DataTypes.STRING,
        foreignKey: true,
        references: {
          model: "Order",
          key: "order_id",
        },
      },

      user_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: {
          model: "User",
          key: "user_id",
        },
      },
      voucher_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: {
          model: "Voucher",
          key: "voucher_id",
        },
      },
    },
    {
      sequelize,
      modelName: "Payment",
      tableName: "payments",
      freezeTableName: true,
      timestamps: false,
    }
  );
  return Payment;
};
