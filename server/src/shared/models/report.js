import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Report extends Model {
    static associate(models) {
      // define association here
    }
  }
  Report.init(
    {
      report_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      report_type: DataTypes.STRING,
      created_at: DataTypes.DATE,
      from_date: DataTypes.DATE,
      to_date: DataTypes.DATE,
      filters: DataTypes.JSON,
      total_value: DataTypes.DOUBLE,
      details: DataTypes.JSON,
      description: DataTypes.STRING,
      created_by: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Report",
      tableName: "reports",
      freezeTableName: true,
      timestamps: false, // Nếu bạn không dùng createdAt/updatedAt mặc định
    }
  );
  return Report;
};
