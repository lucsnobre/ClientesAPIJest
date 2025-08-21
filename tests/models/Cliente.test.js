/**
 * Testes unitários para o modelo Cliente
 * Cobertura de casos de sucesso e falha
 */

const Cliente = require('../../models/Cliente');

// Mock do pool de conexões
const mockPool = global.mockPool;

describe('Cliente Model', () => {
    
    beforeEach(() => {
        // Limpar mocks antes de cada teste
        jest.clearAllMocks();
    });

    describe('validarDados', () => {
        test('deve retornar array vazio para dados válidos', () => {
            const dados = {
                nome: 'João Silva',
                email: 'joao@email.com',
                telefone: '11999999999'
            };

            const erros = Cliente.validarDados(dados);
            expect(erros).toEqual([]);
        });

        test('deve retornar erro para nome inválido', () => {
            const dados = {
                nome: 'A',
                email: 'joao@email.com',
                telefone: '11999999999'
            };

            const erros = Cliente.validarDados(dados);
            expect(erros).toContain('Nome é obrigatório e deve ter pelo menos 2 caracteres');
        });

        test('deve retornar erro para email inválido', () => {
            const dados = {
                nome: 'João Silva',
                email: 'email-invalido',
                telefone: '11999999999'
            };

            const erros = Cliente.validarDados(dados);
            expect(erros).toContain('Email é obrigatório e deve ter formato válido');
        });

        test('deve retornar erro para telefone inválido', () => {
            const dados = {
                nome: 'João Silva',
                email: 'joao@email.com',
                telefone: '123'
            };

            const erros = Cliente.validarDados(dados);
            expect(erros).toContain('Telefone é obrigatório e deve ter pelo menos 10 caracteres');
        });
    });

    describe('validarEmail', () => {
        test('deve validar email correto', () => {
            expect(Cliente.validarEmail('teste@email.com')).toBe(true);
            expect(Cliente.validarEmail('usuario.teste@dominio.com.br')).toBe(true);
        });

        test('deve invalidar email incorreto', () => {
            expect(Cliente.validarEmail('email-sem-arroba')).toBe(false);
            expect(Cliente.validarEmail('email@')).toBe(false);
            expect(Cliente.validarEmail('@dominio.com')).toBe(false);
        });
    });

    describe('criar', () => {
        test('deve criar cliente com sucesso', async () => {
            const dados = {
                nome: 'João Silva',
                email: 'joao@email.com',
                telefone: '11999999999'
            };

            const mockResult = [{ insertId: 1 }];
            mockPool.execute.mockResolvedValue(mockResult);

            const resultado = await Cliente.criar(dados);

            expect(mockPool.execute).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO clientes'),
                ['João Silva', 'joao@email.com', '11999999999']
            );

            expect(resultado).toEqual({
                id: 1,
                nome: 'João Silva',
                email: 'joao@email.com',
                telefone: '11999999999'
            });
        });

        test('deve lançar erro para email duplicado', async () => {
            const dados = {
                nome: 'João Silva',
                email: 'joao@email.com',
                telefone: '11999999999'
            };

            const mockError = new Error('Duplicate entry');
            mockError.code = 'ER_DUP_ENTRY';
            mockPool.execute.mockRejectedValue(mockError);

            await expect(Cliente.criar(dados)).rejects.toThrow('Email já está cadastrado');
        });
    });

    describe('listarTodos', () => {
        test('deve retornar lista de clientes', async () => {
            const mockClientes = [
                { id: 1, nome: 'João', email: 'joao@email.com', telefone: '11999999999' }
            ];

            mockPool.execute.mockResolvedValue([mockClientes]);

            const resultado = await Cliente.listarTodos();
            expect(resultado).toEqual(mockClientes);
        });
    });

    describe('buscarPorId', () => {
        test('deve retornar cliente encontrado', async () => {
            const mockCliente = { id: 1, nome: 'João', email: 'joao@email.com', telefone: '11999999999' };
            mockPool.execute.mockResolvedValue([[mockCliente]]);

            const resultado = await Cliente.buscarPorId(1);
            expect(resultado).toEqual(mockCliente);
        });

        test('deve retornar null quando cliente não encontrado', async () => {
            mockPool.execute.mockResolvedValue([[]]);

            const resultado = await Cliente.buscarPorId(999);
            expect(resultado).toBeNull();
        });
    });

    describe('atualizar', () => {
        test('deve atualizar cliente com sucesso', async () => {
            const dados = {
                nome: 'João Silva Atualizado',
                email: 'joao.novo@email.com',
                telefone: '11888888888'
            };

            mockPool.execute.mockResolvedValue([{ affectedRows: 1 }]);

            const resultado = await Cliente.atualizar(1, dados);
            expect(resultado).toBe(true);
        });

        test('deve retornar false quando cliente não encontrado', async () => {
            const dados = {
                nome: 'João Silva',
                email: 'joao@email.com',
                telefone: '11999999999'
            };

            mockPool.execute.mockResolvedValue([{ affectedRows: 0 }]);

            const resultado = await Cliente.atualizar(999, dados);
            expect(resultado).toBe(false);
        });
    });

    describe('deletar', () => {
        test('deve deletar cliente com sucesso', async () => {
            mockPool.execute.mockResolvedValue([{ affectedRows: 1 }]);

            const resultado = await Cliente.deletar(1);
            expect(resultado).toBe(true);
        });

        test('deve retornar false quando cliente não encontrado', async () => {
            mockPool.execute.mockResolvedValue([{ affectedRows: 0 }]);

            const resultado = await Cliente.deletar(999);
            expect(resultado).toBe(false);
        });
    });

    describe('contarTotal', () => {
        test('deve retornar total de clientes', async () => {
            mockPool.execute.mockResolvedValue([[{ total: 5 }]]);

            const resultado = await Cliente.contarTotal();
            expect(resultado).toBe(5);
        });
    });
});
