import { DataTypes } from "sequelize";
import { sequelize } from "./connection";

const ValidatedUser = sequelize.define("validatedUser", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateBirth: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  lastPasswordUpdateAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  needsPasswordChange: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});

export default ValidatedUser;
