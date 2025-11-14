import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Sport extends Model {
    static associate(models) {
      // define association here
      Sport.hasMany(models.Tournament, { foreignKey: "sport_id" });
      Sport.hasMany(models.Blog, { foreignKey: "sport_id" });
    }
  }
  Sport.init(
    {
      sport_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      sport_name: DataTypes.STRING,
      has_teams: DataTypes.INTEGER,
      sport_icon: DataTypes.STRING,
      has_tournament: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Sport",
      tableName: "sports",
      freezeTableName: true,
      timestamps: false, // Nếu bạn không dùng createdAt/updatedAt mặc định
    }
  );
  return Sport;
};
