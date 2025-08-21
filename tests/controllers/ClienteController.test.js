/**
 * Testes unitários para ClienteController
 * Cobertura de casos de sucesso e falha
 */

const ClienteController = require('../../controllers/ClienteController');
const Cliente = require('../../models/Cliente');

// Mock do modelo Cliente
jest.mock('../../models/Cliente');

describe('ClienteController', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('criarCliente', () => {
        const dadosValidos = {
            nome: 'João Silva',
            email: 'joao@email.com',
            telefone: '11999999999'
        };

        test('deve criar cliente com sucesso', async () => {
            Cliente.validarDados.mockReturnValue([]);
            Cliente.buscarPorEmail.mockResolvedValue(null);
            Cliente.criar.mockResolvedValue({ id: 1, ...dadosValidos });

            const resultado = await ClienteController.criarCliente(dadosValidos, 'application/json');

            expect(resultado.status_code).toBe(201);
            expect(resultado.message).toBe('Cliente criado com sucesso');
            expect(resultado.cliente).toEqual({ id: 1, ...dadosValidos });
            expect(resultado.erro).toBe(false);
        });

        test('deve retornar erro 415 para content-type inválido', async () => {
            const resultado = await ClienteController.criarCliente(dadosValidos, 'text/plain');

            expect(resultado.status_code).toBe(415);
            expect(resultado.message).toBe('Content-Type deve ser application/json');
            expect(resultado.erro).toBe(true);
        });

        test('deve retornar erro 400 para dados inválidos', async () => {
            const dadosInvalidos = { nome: '', email: 'email-invalido', telefone: '123' };
            Cliente.validarDados.mockReturnValue(['Nome inválido', 'Email inválido']);

            const resultado = await ClienteController.criarCliente(dadosInvalidos, 'application/json');

            expect(resultado.status_code).toBe(400);
            expect(resultado.message).toBe('Dados inválidos');
            expect(resultado.erros).toEqual(['Nome inválido', 'Email inválido']);
            expect(resultado.erro).toBe(true);
        });

        test('deve retornar erro 409 para email já existente', async () => {
            Cliente.validarDados.mockReturnValue([]);
            Cliente.buscarPorEmail.mockResolvedValue({ id: 1, email: 'joao@email.com' });

            const resultado = await ClienteController.criarCliente(dadosValidos, 'application/json');

            expect(resultado.status_code).toBe(409);
            expect(resultado.message).toBe('Email já está cadastrado');
            expect(resultado.erro).toBe(true);
        });

        test('deve retornar erro 500 para erro interno', async () => {
            Cliente.validarDados.mockReturnValue([]);
            Cliente.buscarPorEmail.mockRejectedValue(new Error('Database error'));

            const resultado = await ClienteController.criarCliente(dadosValidos, 'application/json');

            expect(resultado.status_code).toBe(500);
            expect(resultado.message).toBe('Erro interno do servidor');
            expect(resultado.erro).toBe(true);
        });
    });

    describe('listarClientes', () => {
        test('deve listar clientes com sucesso', async () => {
            const mockClientes = [
                { id: 1, nome: 'João', email: 'joao@email.com', telefone: '11999999999' }
            ];
            Cliente.listarTodos.mockResolvedValue(mockClientes);
            Cliente.contarTotal.mockResolvedValue(1);

            const resultado = await ClienteController.listarClientes();

            expect(resultado.status_code).toBe(200);
            expect(resultado.message).toBe('Clientes listados com sucesso');
            expect(resultado.total).toBe(1);
            expect(resultado.clientes).toEqual(mockClientes);
            expect(resultado.erro).toBe(false);
        });

        test('deve retornar erro 500 para erro interno', async () => {
            Cliente.listarTodos.mockRejectedValue(new Error('Database error'));

            const resultado = await ClienteController.listarClientes();

            expect(resultado.status_code).toBe(500);
            expect(resultado.message).toBe('Erro interno do servidor');
            expect(resultado.erro).toBe(true);
        });
    });

    describe('buscarCliente', () => {
        test('deve buscar cliente com sucesso', async () => {
            const mockCliente = { id: 1, nome: 'João', email: 'joao@email.com', telefone: '11999999999' };
            Cliente.buscarPorId.mockResolvedValue(mockCliente);

            const resultado = await ClienteController.buscarCliente('1');

            expect(resultado.status_code).toBe(200);
            expect(resultado.message).toBe('Cliente encontrado com sucesso');
            expect(resultado.cliente).toEqual(mockCliente);
            expect(resultado.erro).toBe(false);
        });

        test('deve retornar erro 400 para ID inválido', async () => {
            const resultado = await ClienteController.buscarCliente('abc');

            expect(resultado.status_code).toBe(400);
            expect(resultado.message).toBe('ID deve ser um número válido maior que zero');
            expect(resultado.erro).toBe(true);
        });

        test('deve retornar erro 404 para cliente não encontrado', async () => {
            Cliente.buscarPorId.mockResolvedValue(null);

            const resultado = await ClienteController.buscarCliente('999');

            expect(resultado.status_code).toBe(404);
            expect(resultado.message).toBe('Cliente não encontrado');
            expect(resultado.erro).toBe(true);
        });
    });

    describe('atualizarCliente', () => {
        const dadosValidos = {
            nome: 'João Silva Atualizado',
            email: 'joao.novo@email.com',
            telefone: '11888888888'
        };

        test('deve atualizar cliente com sucesso', async () => {
            const clienteExistente = { id: 1, nome: 'João', email: 'joao@email.com' };
            const clienteAtualizado = { id: 1, ...dadosValidos };

            Cliente.buscarPorId.mockResolvedValueOnce(clienteExistente);
            Cliente.validarDados.mockReturnValue([]);
            Cliente.buscarPorEmail.mockResolvedValue(null);
            Cliente.atualizar.mockResolvedValue(true);
            Cliente.buscarPorId.mockResolvedValueOnce(clienteAtualizado);

            const resultado = await ClienteController.atualizarCliente(dadosValidos, '1', 'application/json');

            expect(resultado.status_code).toBe(200);
            expect(resultado.message).toBe('Cliente atualizado com sucesso');
            expect(resultado.cliente).toEqual(clienteAtualizado);
            expect(resultado.erro).toBe(false);
        });

        test('deve retornar erro 404 para cliente não encontrado', async () => {
            Cliente.buscarPorId.mockResolvedValue(null);

            const resultado = await ClienteController.atualizarCliente(dadosValidos, '999', 'application/json');

            expect(resultado.status_code).toBe(404);
            expect(resultado.message).toBe('Cliente não encontrado');
            expect(resultado.erro).toBe(true);
        });
    });

    describe('deletarCliente', () => {
        test('deve deletar cliente com sucesso', async () => {
            const clienteExistente = { id: 1, nome: 'João', email: 'joao@email.com' };
            Cliente.buscarPorId.mockResolvedValue(clienteExistente);
            Cliente.deletar.mockResolvedValue(true);

            const resultado = await ClienteController.deletarCliente('1');

            expect(resultado.status_code).toBe(200);
            expect(resultado.message).toBe('Cliente deletado com sucesso');
            expect(resultado.cliente_deletado).toEqual(clienteExistente);
            expect(resultado.erro).toBe(false);
        });

        test('deve retornar erro 400 para ID inválido', async () => {
            const resultado = await ClienteController.deletarCliente('abc');

            expect(resultado.status_code).toBe(400);
            expect(resultado.message).toBe('ID deve ser um número válido maior que zero');
            expect(resultado.erro).toBe(true);
        });

        test('deve retornar erro 404 para cliente não encontrado', async () => {
            Cliente.buscarPorId.mockResolvedValue(null);

            const resultado = await ClienteController.deletarCliente('999');

            expect(resultado.status_code).toBe(404);
            expect(resultado.message).toBe('Cliente não encontrado');
            expect(resultado.erro).toBe(true);
        });
    });
});
