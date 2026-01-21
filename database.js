const { Sequelize } = require('sequelize');
require('dotenv').config();

// Usamos la URL del Transaction Pooler que conseguiste (puerto 6543)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Necesario para Supabase
    }
  },
  logging: false, // Para que no llene la consola de códigos SQL
});

const conectarDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a Supabase (vía Transaction Pooler) exitosa.');
  } catch (error) {
    console.error('❌ Error conectando a la BD:', error);
  }
};

module.exports = { sequelize, conectarDB };