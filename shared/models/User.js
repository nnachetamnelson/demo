const { DataTypes, Model } = require("sequelize");
const argon2 = require("argon2");
const sequelize = require('../db/sequelize');

class User extends Model {
  // Compare plain password with hashed password
  async comparePassword(candidatePassword) {
    return argon2.verify(this.password, candidatePassword);
  }

  // Hide sensitive fields in JSON output
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

User.init(
  {
    tenantId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Manually assigned school/organization identifier",
    },

    schoolName: {
      type: DataTypes.STRING(191),
      allowNull: true,
      comment: "Name of the school or organization",
    },

    username: {
      type: DataTypes.STRING(191),
      allowNull: false,
      set(value) {
        this.setDataValue("username", value.trim());
      },
    },

    schoolPrefix: {
      type: DataTypes.STRING(10),
      defaultValue: "GEN",
    },

    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "admin", // fallback role
    },

    email: {
      type: DataTypes.STRING(191),
      allowNull: false,
      validate: { isEmail: true },
      set(value) {
        this.setDataValue("email", value.toLowerCase());
      },
    },

    password: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },

    // ===================== New Fields =====================

    phoneNo: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Primary contact number of the school or admin",
      validate: {
        is: /^[0-9+\-\s]*$/i,
      },
    },

    phoneNo2: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Secondary contact number",
      validate: {
        is: /^[0-9+\-\s]*$/i,
      },
    },

    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Physical address of the school",
    },

    website: {
      type: DataTypes.STRING(191),
      allowNull: true,
      comment: "Official website of the school",
      validate: {
        isUrl: true,
      },
    },

    schoolLogo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "URL or file path to the school logo",
    },

    schoolSignature: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "URL or file path to the school signature or stamp",
    },

    principalSignature: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "URL or file path to the principal's signature",
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["tenantId", "email"],
        using: "BTREE",
      },
      {
        unique: true,
        fields: ["tenantId", "username"],
        using: "BTREE",
      },
    ],
  }
);

// ===================== Hooks =====================

// Hash password before create
User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await argon2.hash(user.password);
  }
});

// Hash password before update if changed
User.beforeUpdate(async (user) => {
  if (user.changed("password")) {
    user.password = await argon2.hash(user.password);
  }
});

module.exports = User;
