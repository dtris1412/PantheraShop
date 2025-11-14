import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Variant extends Model {
    static associate(models) {
      // define association here
      Variant.belongsTo(models.Product, { foreignKey: "product_id" });
    }
  }
  Variant.init(
    {
      variant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      variant_size: DataTypes.STRING,
      variant_color: DataTypes.STRING,
      variant_stock: DataTypes.INTEGER,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      product_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Product",
          key: "product_id",
        },
      },
    },
    {
      sequelize,

      modelName: "Variant",
      tableName: "variants",
      freezeTableName: true,
      timestamps: false,
    }
  );
  return Variant;
};
