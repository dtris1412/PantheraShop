import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class OrderProduct extends Model {
    static associate(models) {
      // define association here
      // OrderProduct.belongsTo(models.Variant, { foreignKey: "product_id" });
      OrderProduct.belongsTo(models.Variant, { foreignKey: "variant_id" });
      OrderProduct.belongsTo(models.Order, { foreignKey: "order_id" });
    }
  }
  OrderProduct.init(
    {
      order_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        autoIncrement: true,
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
    },
    {
      sequelize,
      modelName: "OrderProduct",
      tableName: "order_products",
      freezeTableName: true,
      timestamps: false,
    }
  );
  return OrderProduct;
};
