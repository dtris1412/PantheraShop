import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Voucher extends Model {
    static associate(models) {
      // define association here
    }
  }
  Voucher.init(
    {
      voucher_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      voucher_code: DataTypes.STRING,
      discount_type: DataTypes.STRING,
      discount_value: DataTypes.DECIMAL,
      min_order_value: DataTypes.DECIMAL,
      start_date: DataTypes.DATE,
      end_date: DataTypes.DATE,
      usage_limit: DataTypes.INTEGER,
      used_count: DataTypes.INTEGER,
      voucher_status: DataTypes.STRING,
      created_at: DataTypes.DATE,
    },

    {
      sequelize,
      modelName: "Voucher",
      tableName: "Vouchers",
      freezeTableName: true,
      timestamps: false,
    }
  );
  return Voucher;
};
