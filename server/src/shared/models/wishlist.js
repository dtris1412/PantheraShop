import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Wishlist extends Model {
    static associate(models) {
      // define association here
    }
  }
  Wishlist.init(
    {
      wishlist_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      created_at: DataTypes.DATE,
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
      },
    },

    {
      sequelize,
      modelName: "Wishlist",
      tableName: "wishlists",
      freezeTableName: true,
      timestamps: false,
    }
  );
  return Wishlist;
};
