import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // define association here
      Product.belongsTo(models.Team, { foreignKey: "team_id" });
      Product.belongsTo(models.Category, { foreignKey: "category_id" });
      Product.hasMany(models.Variant, { foreignKey: "product_id" });
      Product.hasMany(models.Product_Image, { foreignKey: "product_id" });
    }
  }
  Product.init(
    {
      product_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      product_name: DataTypes.STRING,
      product_price: DataTypes.DOUBLE,

      product_description: DataTypes.STRING,
      product_quantity: DataTypes.INTEGER,
      release_date: DataTypes.DATE,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      product_image: DataTypes.STRING,
      team_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: {
          model: "Team",
          key: "team_id",
        },
      },
      category_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: {
          model: "Category",
          key: "category_id",
        },
      },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "Products",
      freezeTableName: true,
      timestamps: false, // Nếu bạn không dùng createdAt/updatedAt mặc định
    }
  );
  return Product;
};
