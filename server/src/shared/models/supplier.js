import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Supplier extends Model {
    static associate(models) {
      Supplier.hasMany(models.Product, { foreignKey: "supplier_id" });
      // define association here
    }
  }
  Supplier.init(
    {
      supplier_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      supplier_name: DataTypes.STRING,
      supplier_email: DataTypes.STRING,
      supplier_phone: DataTypes.STRING,
      supplier_address: DataTypes.STRING,
      supplier_type: DataTypes.STRING,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      is_connected: DataTypes.BOOLEAN,
    },

    {
      sequelize,
      modelName: "Supplier",
      tableName: "Suppliers",
      freezeTableName: true,
      timestamps: false,
    }
  );
  return Supplier;
};
