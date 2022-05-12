"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class conversation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      conversation.belongsTo(models.users, {
        as: "sender",
        foreignKey: "senderId",
      });
      conversation.belongsTo(models.users, {
        as: "reciever",
        foreignKey: "recieverId",
      });
      // define association here
    }
  }
  conversation.init(
    {
      senderId: DataTypes.INTEGER,
      recieverId: DataTypes.INTEGER,
      isAccepted: DataTypes.BOOLEAN,
      isRejected: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "conversation",
    }
  );
  return conversation;
};
