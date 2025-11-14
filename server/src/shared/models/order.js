import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // define association here
      // Order.belongsTo(models.Variant, { foreignKey: "product_id" });
      Order.belongsTo(models.User, { foreignKey: "user_id" });
      Order.belongsTo(models.Voucher, { foreignKey: "voucher_id" });
      Order.hasMany(models.OrderProduct, { foreignKey: "order_id" });
      Order.hasOne(models.Payment, { foreignKey: "order_id" });
    }
  }
  Order.init(
    {
      order_id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },

      order_date: DataTypes.DATE,
      order_status: DataTypes.STRING,
      total_amount: DataTypes.DOUBLE,
      recipient_name: DataTypes.STRING,
      recipient_address: DataTypes.STRING,
      recipient_phone: DataTypes.STRING,
      notes: DataTypes.STRING,
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
      modelName: "Order",
      tableName: "orders",
      freezeTableName: true,
      timestamps: false,
    }
  );
  return Order;
};
