/*global require exports */
// Define your Model schemas here.

const dynamoose = require("dynamoose");
const { accountTypes } = require("./enums");

const schemaDefault = {
  saveUnknown: false,
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
};

exports.UsersSchema = new dynamoose.Schema(
  {
    user_id: { type: String, hashKey: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: [Number, dynamoose.NULL], default: null },
    account_type: { type: String, required: true, enum: accountTypes },
    connection_id: {
      type: [String, dynamoose.NULL],
      default: null,
      index: {
        name: "connectionIdIndex",
        global: true,
      },
    },
  },
  schemaDefault
);

exports.ChatsSchema = new dynamoose.Schema(
  {
    chat_id: { type: String, hashKey: true },
    user_id: { type: String, rangeKey: true },
    message: { type: [String, dynamoose.NULL], required: true },
    created_at: {
      type: Date,
      default: new Date().getTime(),
      index: { name: "createdAtIndex", global: true },
    },
  },
  schemaDefault
);

exports.dynamoose = dynamoose;
