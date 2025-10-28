import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class WishlistVariant extends Model {
    static associate(models) {
      WishlistVariant.belongsTo(models.Wishlist, { foreignKey: "wishlist_id" });
      WishlistVariant.belongsTo(models.Variant, { foreignKey: "variant_id" });

      // define association here
    }
  }
  WishlistVariant.init(
    {
      wishlist_variant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      wishlist_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Wishlist",
          key: "wishlist_id",
        },
      },
      variant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Variant",
          key: "variant_id",
        },
      },
      added_at: DataTypes.DATE,
    },

    {
      sequelize,
      modelName: "WishlistVariant",
      tableName: "wishlist_variants",
      freezeTableName: true,
      timestamps: false,
    }
  );
  return WishlistVariant;
};
