/**
 * Testes de integração para a API
 * Testa os endpoints da API usando supertest
 */

const request = require('supertest');
const app = require('../app');

// Mock do módulo de database
jest.mock('../config/database', () => ({
    testarConexao: jest.fn().mockResolvedValue(true),
    criarTabelaClientes: jest.fn().mockResolvedValue(true),
    pool: {
        execute: jest.fn()
    }
}));

// Mock do ClienteController
jest.mock('../controllers/ClienteController');
const ClienteController = require('../controllers/ClienteController');

describe('API Endpoints', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /', () => {
        test('deve retornar informações da API', async () => {
            const response = await request(app).get('/');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('API de Cadastro de Clientes - SENAI');
            expect(response.body.version).toBe('1.0.0');
            expect(response.body.endpoints).toBeDefined();
        });
    });

    describe('POST /clientes', () => {
        test('deve criar cliente com sucesso', async () => {
            const mockResponse = {
                status_code: 201,
                message: 'Cliente criado com sucesso',
                cliente: { id: 1, nome: 'João', email: 'joao@email.com', telefone: '11999999999' },
                erro: false
            };

            ClienteController.criarCliente.mockResolvedValue(mockResponse);

            const dadosCliente = {
                nome: 'João Silva',
                email: 'joao@email.com',
                telefone: '11999999999'
            };

            const response = await request(app)
                .post('/clientes')
                .send(dadosCliente)
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Cliente criado com sucesso');
            expect(ClienteController.criarCliente).toHaveBeenCalledWith(
                dadosCliente,
                'application/json'
            );
        });

        test('deve retornar erro 400 para dados inválidos', async () => {
            const mockResponse = {
                status_code: 400,
                message: 'Dados inválidos',
                erros: ['Nome é obrigatório'],
                erro: true
            };

            ClienteController.criarCliente.mockResolvedValue(mockResponse);

            const response = await request(app)
                .post('/clientes')
                .send({ nome: '', email: 'joao@email.com', telefone: '11999999999' })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Dados inválidos');
        });
    });

    describe('GET /clientes', () => {
        test('deve listar clientes com sucesso', async () => {
            const mockResponse = {
                status_code: 200,
                message: 'Clientes listados com sucesso',
                total: 2,
                clientes: [
                    { id: 1, nome: 'João', email: 'joao@email.com', telefone: '11999999999' },
                    { id: 2, nome: 'Maria', email: 'maria@email.com', telefone: '11888888888' }
                ],
                erro: false
            };

            ClienteController.listarClientes.mockResolvedValue(mockResponse);

            const response = await request(app).get('/clientes');

            expect(response.status).toBe(200);
            expect(response.body.total).toBe(2);
            expect(response.body.clientes).toHaveLength(2);
            expect(ClienteController.listarClientes).toHaveBeenCalled();
        });
    });

    describe('GET /clientes/:id', () => {
        test('deve buscar cliente por ID com sucesso', async () => {
            const mockResponse = {
                status_code: 200,
                message: 'Cliente encontrado com sucesso',
                cliente: { id: 1, nome: 'João', email: 'joao@email.com', telefone: '11999999999' },
                erro: false
            };

            ClienteController.buscarCliente.mockResolvedValue(mockResponse);

            const response = await request(app).get('/clientes/1');

            expect(response.status).toBe(200);
            expect(response.body.cliente.id).toBe(1);
            expect(ClienteController.buscarCliente).toHaveBeenCalledWith('1');
        });

        test('deve retornar erro 404 para cliente não encontrado', async () => {
            const mockResponse = {
                status_code: 404,
                message: 'Cliente não encontrado',
                erro: true
            };

            ClienteController.buscarCliente.mockResolvedValue(mockResponse);

            const response = await request(app).get('/clientes/999');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Cliente não encontrado');
        });
    });

    describe('PUT /clientes/:id', () => {
        test('deve atualizar cliente com sucesso', async () => {
            const mockResponse = {
                status_code: 200,
                message: 'Cliente atualizado com sucesso',
                cliente: { id: 1, nome: 'João Atualizado', email: 'joao.novo@email.com', telefone: '11888888888' },
                erro: false
            };

            ClienteController.atualizarCliente.mockResolvedValue(mockResponse);

            const dadosAtualizacao = {
                nome: 'João Atualizado',
                email: 'joao.novo@email.com',
                telefone: '11888888888'
            };

            const response = await request(app)
                .put('/clientes/1')
                .send(dadosAtualizacao)
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Cliente atualizado com sucesso');
            expect(ClienteController.atualizarCliente).toHaveBeenCalledWith(
                dadosAtualizacao,
                '1',
                'application/json'
            );
        });
    });

    describe('DELETE /clientes/:id', () => {
        test('deve deletar cliente com sucesso', async () => {
            const mockResponse = {
                status_code: 200,
                message: 'Cliente deletado com sucesso',
                cliente_deletado: { id: 1, nome: 'João', email: 'joao@email.com', telefone: '11999999999' },
                erro: false
            };

            ClienteController.deletarCliente.mockResolvedValue(mockResponse);

            const response = await request(app).delete('/clientes/1');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Cliente deletado com sucesso');
            expect(ClienteController.deletarCliente).toHaveBeenCalledWith('1');
        });

        test('deve retornar erro 404 para cliente não encontrado', async () => {
            const mockResponse = {
                status_code: 404,
                message: 'Cliente não encontrado',
                erro: true
            };

            ClienteController.deletarCliente.mockResolvedValue(mockResponse);

            const response = await request(app).delete('/clientes/999');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Cliente não encontrado');
        });
    });

    describe('Rotas não encontradas', () => {
        test('deve retornar erro 404 para rota inexistente', async () => {
            const response = await request(app).get('/rota-inexistente');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Endpoint não encontrado');
            expect(response.body.erro).toBe(true);
        });
    });
});
