// models/archivo_digital.model.js
module.exports = (sequelize, DataTypes) => {
  const ArchivoDigital = sequelize.define('ArchivoDigital', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    documento_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nombre_archivo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ruta_almacenamiento: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ruta_preservacion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ruta_acceso: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ruta_texto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mime_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tamano_bytes: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dimensiones: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resolucion_dpi: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pagina_numero: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    total_paginas: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    checksum_md5: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    checksum_sha256: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    calidad_escaneo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    estado_ocr: {
      type: DataTypes.STRING,
      defaultValue: 'pendiente'
    },
    texto_ocr: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadatos_tecnicos: {
      type: DataTypes.JSON,
      allowNull: true
    },
    fecha_digitalizacion: {
      type: DataTypes.DATE,
      allowNull: false
    },
    digitalizado_por: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    revisado_por: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fecha_revision: {
      type: DataTypes.DATE,
      allowNull: true
    },
    version_archivo: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
    tableName: 'archivos_digitales',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  return ArchivoDigital;
};