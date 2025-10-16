const { DataTypes } = require("sequelize");
const sequelize = require("../db/sequelize");

const Staff = sequelize.define(
  "Staff",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId: { type: DataTypes.STRING(50), allowNull: false },

    // 🔹 Personal Info
    firstName: { type: DataTypes.STRING(100), allowNull: false },
    middleName: { type: DataTypes.STRING(100), allowNull: true },
    lastName: { type: DataTypes.STRING(100), allowNull: false },
    staffId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: { type: DataTypes.STRING(191), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(30), allowNull: true },
    dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true },
    gender: { type: DataTypes.STRING(10), allowNull: true },

    // 🔹 Employment Info
    category: {
      type: DataTypes.ENUM("Academic", "Non Academic"),
      allowNull: false,
      defaultValue: "Academic",
    },
    role: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    dateEmployed: { type: DataTypes.DATEONLY, allowNull: true },

    // 🔹 Origin Info
    stateOfOrigin: { type: DataTypes.STRING(100), allowNull: true },
    localGovernmentArea: { type: DataTypes.STRING(100), allowNull: true },
    homeAddress: { type: DataTypes.TEXT, allowNull: true },

    // 🔹 Next of Kin
    nextOfKinFirstName: { type: DataTypes.STRING(100), allowNull: true },
    nextOfKinMiddleName: { type: DataTypes.STRING(100), allowNull: true },
    nextOfKinLastName: { type: DataTypes.STRING(100), allowNull: true },
    nextOfKinPhone: { type: DataTypes.STRING(30), allowNull: true },
    nextOfKinOccupation: { type: DataTypes.STRING(100), allowNull: true },
    nextOfKinRelationship: { type: DataTypes.STRING(100), allowNull: true },
    nextOfKinAddress: { type: DataTypes.TEXT, allowNull: true },

    // 🔹 Educational Info
    institution: { type: DataTypes.STRING(191), allowNull: true },
    courseOfStudy: { type: DataTypes.STRING(191), allowNull: true },
    yearAdmitted: { type: DataTypes.STRING(10), allowNull: true },
    yearGraduated: { type: DataTypes.STRING(10), allowNull: true },
    certificate: { type: DataTypes.STRING(191), allowNull: true },

    // 🔹 System Metadata
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
  },
  {
    tableName: "staff",
    timestamps: true,
    indexes: [{ fields: ["tenantId"] }, { fields: ["email"] }],
  }
);

module.exports = Staff;
