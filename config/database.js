/**
 * Configuração da conexão com o banco de dados MySQL
 * Inspirado na estrutura do ProjetoMusicaAPI
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuração da conexão
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'bcd127',
    database: process.env.DB_NAME || 'clientesapi',
    port: process.env.DB_PORT || 3306
};

// Pool de conexões para melhor performance
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Função para testar conexão
const testarConexao = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexão com MySQL estabelecida com sucesso!');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar com MySQL:', error.message);
        return false;
    }
};

// Função para criar tabela de clientes se não existir
const criarTabelaClientes = async () => {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS clientes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                telefone VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        
        await pool.execute(createTableQuery);
        console.log('✅ Tabela clientes criada/verificada com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao criar tabela clientes:', error.message);
        throw error;
    }
};

module.exports = {
    pool,
    testarConexao,
    criarTabelaClientes
};
