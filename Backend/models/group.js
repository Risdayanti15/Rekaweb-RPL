'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    static associate(models) {}
  }
  Group.init({
    taskId: DataTypes.INTEGER,
    memberId: DataTypes.INTEGER,
    nama: DataTypes.STRING,
    deskripsi: DataTypes.STRING,
    matkul: DataTypes.STRING,
    anggota: DataTypes.STRING,
    status: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};