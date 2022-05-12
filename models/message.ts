"use strict";
import { Model } from "sequelize";
module.exports = (sequelize, DataTypes) => {
  class message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  message.init(
    {
      conversationId: DataTypes.STRING,
      messages: DataTypes.ARRAY(DataTypes.STRING),
      isDeleted: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "messages",
    }
  );
  return message;
};
