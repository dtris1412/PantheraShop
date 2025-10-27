import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class OrderProductReview extends Model {
    static associate(models) {
      OrderProductReview.belongsTo(models.Order, {
        foreignKey: "order_id",
      });
      OrderProductReview.belongsTo(models.User, {
        foreignKey: "user_id",
      });
      OrderProductReview.belongsTo(models.Variant, {
        foreignKey: "variant_id",
      });
    }
  }
  OrderProductReview.init(
    {
      review_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.STRING,
        references: {
          model: "Order",
          key: "order_id",
        },
      },
      variant_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Variant",
          key: "variant_id",
        },
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "User",
          key: "user_id",
        },
      },
      rating: DataTypes.INTEGER,
      comment: DataTypes.TEXT,
      created_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "OrderProductReview",
      tableName: "order_product_reviews",
      freezeTableName: true,
      timestamps: false,
    }
  );
  return OrderProductReview;
};
