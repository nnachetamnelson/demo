const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

class RefreshToken extends Model {}

RefreshToken.init(
  {
    token: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER, // FK to User
      allowNull: false,
    },
    tenantId: {
      type: DataTypes.STRING(50), // tenant identifier
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "RefreshToken",
    tableName: "refresh_tokens",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["tenantId", "token"], // ensures token uniqueness per tenant
      },
      {
        fields: ["tenantId", "userId"], // allows efficient tenant-scoped queries
      },
    ],
  }
);

module.exports = RefreshToken;

