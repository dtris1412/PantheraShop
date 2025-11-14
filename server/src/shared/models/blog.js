import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Blog extends Model {
    static associate(models) {
      // define association here
      Blog.belongsTo(models.User, { foreignKey: "user_id" });
      Blog.belongsTo(models.Sport, { foreignKey: "sport_id" });
      Blog.belongsTo(models.Team, { foreignKey: "team_id" });
      Blog.belongsTo(models.Category, { foreignKey: "category_id" });
      Blog.belongsTo(models.Tournament, { foreignKey: "tournament_id" });
    }
  }
  Blog.init(
    {
      blog_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      blog_title: DataTypes.STRING,
      blog_content: DataTypes.TEXT,

      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      blog_thumbnail: DataTypes.STRING,

      user_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: {
          model: "User",
          key: "user_id",
        },
      },
      sport_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: {
          model: "Sport",
          key: "sport_id",
        },
      },
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
      modelName: "Blog",
      tableName: "blogs",
      freezeTableName: true,
      timestamps: false, // Nếu bạn không dùng createdAt/updatedAt mặc định
    }
  );
  return Blog;
};
