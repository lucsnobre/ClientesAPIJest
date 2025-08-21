/**
 * Controller para Cliente - Inspirado na estrutura do ProjetoMusicaAPI
 * Responsável pela lógica de negócio e validações das requisições
 */

const Cliente = require('../models/Cliente');

class ClienteController {
    
    // Criar novo cliente
    static async criarCliente(dadosBody, contentType) {
        try {
            // Validar content-type
            if (contentType !== 'application/json') {
                return {
                    status_code: 415,
                    message: 'Content-Type deve ser application/json',
                    erro: true
                };
            }

            // Validar dados obrigatórios
            const errosValidacao = Cliente.validarDados(dadosBody);
            if (errosValidacao.length > 0) {
                return {
                    status_code: 400,
                    message: 'Dados inválidos',
                    erros: errosValidacao,
                    erro: true
                };
            }

            // Verificar se email já existe
            const clienteExistente = await Cliente.buscarPorEmail(dadosBody.email);
            if (clienteExistente) {
                return {
                    status_code: 409,
                    message: 'Email já está cadastrado',
                    erro: true
                };
            }

            // Criar cliente
            const novoCliente = await Cliente.criar(dadosBody);

            return {
                status_code: 201,
                message: 'Cliente criado com sucesso',
                cliente: novoCliente,
                erro: false
            };

        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            return {
                status_code: 500,
                message: 'Erro interno do servidor',
                erro: true
            };
        }
    }

    // Listar todos os clientes
    static async listarClientes() {
        try {
            const clientes = await Cliente.listarTodos();
            const total = await Cliente.contarTotal();

            return {
                status_code: 200,
                message: 'Clientes listados com sucesso',
                total: total,
                clientes: clientes,
                erro: false
            };

        } catch (error) {
            console.error('Erro ao listar clientes:', error);
            return {
                status_code: 500,
                message: 'Erro interno do servidor',
                erro: true
            };
        }
    }

    // Buscar cliente por ID
    static async buscarCliente(id) {
        try {
            // Validar se ID é um número válido
            if (!id || isNaN(id) || parseInt(id) <= 0) {
                return {
                    status_code: 400,
                    message: 'ID deve ser um número válido maior que zero',
                    erro: true
                };
            }

            const cliente = await Cliente.buscarPorId(parseInt(id));

            if (!cliente) {
                return {
                    status_code: 404,
                    message: 'Cliente não encontrado',
                    erro: true
                };
            }

            return {
                status_code: 200,
                message: 'Cliente encontrado com sucesso',
                cliente: cliente,
                erro: false
            };

        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            return {
                status_code: 500,
                message: 'Erro interno do servidor',
                erro: true
            };
        }
    }

    // Atualizar cliente
    static async atualizarCliente(dadosBody, id, contentType) {
        try {
            // Validar content-type
            if (contentType !== 'application/json') {
                return {
                    status_code: 415,
                    message: 'Content-Type deve ser application/json',
                    erro: true
                };
            }

            // Validar se ID é um número válido
            if (!id || isNaN(id) || parseInt(id) <= 0) {
                return {
                    status_code: 400,
                    message: 'ID deve ser um número válido maior que zero',
                    erro: true
                };
            }

            // Verificar se cliente existe
            const clienteExistente = await Cliente.buscarPorId(parseInt(id));
            if (!clienteExistente) {
                return {
                    status_code: 404,
                    message: 'Cliente não encontrado',
                    erro: true
                };
            }

            // Validar dados obrigatórios
            const errosValidacao = Cliente.validarDados(dadosBody);
            if (errosValidacao.length > 0) {
                return {
                    status_code: 400,
                    message: 'Dados inválidos',
                    erros: errosValidacao,
                    erro: true
                };
            }

            // Verificar se email já existe (exceto para o próprio cliente)
            const clienteComEmail = await Cliente.buscarPorEmail(dadosBody.email);
            if (clienteComEmail && clienteComEmail.id !== parseInt(id)) {
                return {
                    status_code: 409,
                    message: 'Email já está cadastrado por outro cliente',
                    erro: true
                };
            }

            // Atualizar cliente
            const sucesso = await Cliente.atualizar(parseInt(id), dadosBody);

            if (!sucesso) {
                return {
                    status_code: 404,
                    message: 'Cliente não encontrado para atualização',
                    erro: true
                };
            }

            // Buscar cliente atualizado
            const clienteAtualizado = await Cliente.buscarPorId(parseInt(id));

            return {
                status_code: 200,
                message: 'Cliente atualizado com sucesso',
                cliente: clienteAtualizado,
                erro: false
            };

        } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            return {
                status_code: 500,
                message: 'Erro interno do servidor',
                erro: true
            };
        }
    }

    // Deletar cliente
    static async deletarCliente(id) {
        try {
            // Validar se ID é um número válido
            if (!id || isNaN(id) || parseInt(id) <= 0) {
                return {
                    status_code: 400,
                    message: 'ID deve ser um número válido maior que zero',
                    erro: true
                };
            }

            // Verificar se cliente existe
            const clienteExistente = await Cliente.buscarPorId(parseInt(id));
            if (!clienteExistente) {
                return {
                    status_code: 404,
                    message: 'Cliente não encontrado',
                    erro: true
                };
            }

            // Deletar cliente
            const sucesso = await Cliente.deletar(parseInt(id));

            if (!sucesso) {
                return {
                    status_code: 404,
                    message: 'Cliente não encontrado para exclusão',
                    erro: true
                };
            }

            return {
                status_code: 200,
                message: 'Cliente deletado com sucesso',
                cliente_deletado: clienteExistente,
                erro: false
            };

        } catch (error) {
            console.error('Erro ao deletar cliente:', error);
            return {
                status_code: 500,
                message: 'Erro interno do servidor',
                erro: true
            };
        }
    }
}

module.exports = ClienteController;
