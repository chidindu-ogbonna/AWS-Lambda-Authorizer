/*global require exports */
// Define your models here.

const { dynamoose, ChatsSchema, UsersSchema } = require("./schemas");

exports.ChatsModel = dynamoose.model("chats", ChatsSchema);
exports.UsersModel = dynamoose.model("users", UsersSchema);
