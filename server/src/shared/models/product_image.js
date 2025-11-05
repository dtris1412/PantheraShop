import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Product_Images extends Model {
    static associate(models) {
      // define association here
      Product_Images.belongsTo(models.Variant, { foreignKey: "product_id" });
      Product_Images.belongsTo(models.Product, { foreignKey: "product_id" });
    }
  }
  Product_Images.init(
    {
      product_image_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      product_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: {
          model: "Product",
          key: "product_id",
        },
      },
      image_url: DataTypes.STRING,
      order: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Product_Image",
      tableName: "Product_Images",
      freezeTableName: true,
      timestamps: false,
    }
  );
  return Product_Images;
};
