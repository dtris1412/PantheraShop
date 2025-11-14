import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Banner extends Model {
    static associate(models) {
      // define association here
    }
  }
  Banner.init(
    {
      banner_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      image_url: DataTypes.STRING,
    },

    {
      sequelize,
      modelName: "Banner",
      tableName: "banners",
      freezeTableName: true,
      timestamps: false, // Nếu bạn không dùng createdAt/updatedAt mặc định
    }
  );
  return Banner;
};
