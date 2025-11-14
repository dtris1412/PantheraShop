import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Tournament extends Model {
    static associate(models) {
      // define association here
      Tournament.belongsTo(models.Sport, { foreignKey: "sport_id" });
      Tournament.hasMany(models.Team, { foreignKey: "tournament_id" });
    }
  }
  Tournament.init(
    {
      tournament_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      tournament_name: DataTypes.STRING,
      tournament_icon: DataTypes.STRING,
      tournament_description: DataTypes.STRING,

      sport_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: {
          model: "Sport",
          key: "sport_id",
        },
      },
    },
    {
      sequelize,
      modelName: "Tournament",
      tableName: "tournaments",
      freezeTableName: true,
      timestamps: false, // Nếu bạn không dùng createdAt/updatedAt mặc định
    }
  );
  return Tournament;
};
