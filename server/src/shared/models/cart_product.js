import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class CartProduct extends Model {
    static associate(models) {
      CartProduct.belongsTo(models.Variant, { foreignKey: "variant_id" });
      CartProduct.belongsTo(models.Cart, { foreignKey: "cart_id" });
    }
  }
  CartProduct.init(
    {
      cart_product_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cart_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Cart", key: "cart_id" },
      },
      variant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Variant", key: "variant_id" },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "CartProduct",
      tableName: "cart_products",
      freezeTableName: true,
      timestamps: false,
    }
  );
  return CartProduct;
};
