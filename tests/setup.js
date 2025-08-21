/**
 * Configuração inicial para os testes Jest
 * Configuração do ambiente de teste e mock do banco de dados
 */

// Configurar variáveis de ambiente para teste
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.DB_NAME = 'test_cadastro_clientes';
process.env.PORT = 3001;

// Mock do pool de conexões MySQL para testes
const mockPool = {
    execute: jest.fn(),
    getConnection: jest.fn(() => ({
        release: jest.fn()
    }))
};

// Mock do módulo mysql2/promise
jest.mock('mysql2/promise', () => ({
    createPool: jest.fn(() => mockPool)
}));

// Exportar mock para uso nos testes
global.mockPool = mockPool;

// Configurar timeout para testes
jest.setTimeout(30000);
