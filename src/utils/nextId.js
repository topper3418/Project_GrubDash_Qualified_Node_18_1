const crypto = require("crypto");

const nextId = () => {
  return crypto.randomBytes(16).toString("hex");
}

module.exports = nextId;
