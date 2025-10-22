import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class OrderProduct extends Model {
    static associate(models) {
      // define association here
      OrderProduct.belongsTo(models.Variant, { foreignKey: "product_id" });
    }
  }
  OrderProduct.init(
    {
      order_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        autoIncrement: true,
      },

      user_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: {
          model: "User",
          key: "user_id",
        },
      },
      variant_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: {
          model: "Variant",
          key: "variant_id",
        },
      },
      quantity: DataTypes.INTEGER,
      price_at_time: DataTypes.DOUBLE,
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
      modelName: "OrderProduct",
      tableName: "OrderProducts",
      freezeTableName: true,
      timestamps: false,
    }
  );
  return OrderProduct;
};
