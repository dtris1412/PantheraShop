import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Team extends Model {
    static associate(models) {
      // define association here
      Team.belongsTo(models.Tournament, { foreignKey: "tournament_id" });
      Team.hasMany(models.Product, { foreignKey: "team_id" });
    }
  }
  Team.init(
    {
      team_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      team_name: DataTypes.STRING,
      team_logo: DataTypes.STRING,
      team_description: DataTypes.STRING,

      tournament_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: {
          model: "Tournament",
          key: "tournament_id",
        },
      },
    },
    {
      sequelize,
      modelName: "Team",
      tableName: "Teams",
      freezeTableName: true,
      timestamps: false, // Nếu bạn không dùng createdAt/updatedAt mặc định
    }
  );
  return Team;
};
