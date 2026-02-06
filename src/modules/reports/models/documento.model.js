// models/documento.model.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Documento extends Model {
    static associate(models) {
      // Relaciones básicas si las necesitas
      Documento.belongsTo(models.Autorizacion, {
        foreignKey: 'autorizacion_id',
        as: 'autorizacion'
      });
      
      Documento.belongsTo(models.Documento, {
        foreignKey: 'documento_padre_id',
        as: 'padre'
      });
    }
  }

  Documento.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      autorizacion_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      numero_documento: {
        type: DataTypes.STRING,
        allowNull: true
      },
      titulo: {
        type: DataTypes.STRING,
        allowNull: true
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      fecha_documento: {
        type: DataTypes.DATE,
        allowNull: true
      },
      fecha_recepcion: {
        type: DataTypes.DATE,
        allowNull: true
      },
      folio_inicio: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      folio_fin: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      paginas: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      confidencialidad: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'publico'
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true
      },
      estado_digitalizacion: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pendiente'
      },
      version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      version_actual: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      documento_padre_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      tipo_documento: {
        type: DataTypes.STRING,
        allowNull: true
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Documento',
      tableName: 'documentos',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      underscored: true
    }
  );

  return Documento;
};