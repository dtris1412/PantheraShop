import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      // define association here
    }
  }
  Cart.init(
    {
      cart_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      created_at: DataTypes.DATE,
      user_id: {
        type: DataTypes.INTEGER,
        foreginkey: true,
        references: {
          model: "User",
          key: "user_id",
        },
      },
    },

    {
      sequelize,
      modelName: "Cart",
      tableName: "carts",
      freezeTableName: true,
      timestamps: false, // Nếu bạn không dùng createdAt/updatedAt mặc định
    }
  );
  return Cart;
};
