/**
 * API de Cadastro de Clientes (CRUD)
 * Projeto SENAI - Testes de Software
 * Inspirado na estrutura do ProjetoMusicaAPI
 * 
 * Tecnologias utilizadas:
 * - Node.js
 * - Express.js
 * - MySQL
 * - Jest (para testes)
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { testarConexao, criarTabelaClientes } = require('./config/database');
const ClienteController = require('./controllers/ClienteController');

// Configuração do Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para CORS personalizado (inspirado no ProjetoMusicaAPI)
app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Middleware para log de requisições
app.use((request, response, next) => {
    console.log(`${new Date().toISOString()} - ${request.method} ${request.url}`);
    next();
});

// Rota de teste da API
app.get('/', (request, response) => {
    response.json({
        message: 'API de Cadastro de Clientes - SENAI',
        version: '1.0.0',
        endpoints: {
            'GET /clientes': 'Listar todos os clientes',
            'GET /clientes/:id': 'Buscar cliente por ID',
            'POST /clientes': 'Criar novo cliente',
            'PUT /clientes/:id': 'Atualizar cliente',
            'DELETE /clientes/:id': 'Deletar cliente'
        }
    });
});

// ROTAS CRUD PARA CLIENTES

// POST /clientes - Criar novo cliente
app.post('/clientes', cors(), async (request, response) => {
    const contentType = request.headers['content-type'];
    const dadosBody = request.body;

    const result = await ClienteController.criarCliente(dadosBody, contentType);

    response.status(result.status_code);
    response.json(result);
});

// GET /clientes - Listar todos os clientes
app.get('/clientes', cors(), async (request, response) => {
    const result = await ClienteController.listarClientes();

    response.status(result.status_code);
    response.json(result);
});

// GET /clientes/:id - Buscar cliente por ID
app.get('/clientes/:id', cors(), async (request, response) => {
    const id = request.params.id;

    const result = await ClienteController.buscarCliente(id);

    response.status(result.status_code);
    response.json(result);
});

// PUT /clientes/:id - Atualizar cliente
app.put('/clientes/:id', cors(), async (request, response) => {
    const contentType = request.headers['content-type'];
    const id = request.params.id;
    const dadosBody = request.body;

    const result = await ClienteController.atualizarCliente(dadosBody, id, contentType);

    response.status(result.status_code);
    response.json(result);
});

// DELETE /clientes/:id - Deletar cliente
app.delete('/clientes/:id', cors(), async (request, response) => {
    const id = request.params.id;

    const result = await ClienteController.deletarCliente(id);

    response.status(result.status_code);
    response.json(result);
});

// Middleware para capturar rotas não encontradas
app.use('*', (request, response) => {
    response.status(404).json({
        status_code: 404,
        message: 'Endpoint não encontrado',
        erro: true
    });
});

// Middleware para tratamento de erros
app.use((error, request, response, next) => {
    console.error('Erro não tratado:', error);
    response.status(500).json({
        status_code: 500,
        message: 'Erro interno do servidor',
        erro: true
    });
});

// Função para inicializar o servidor
const iniciarServidor = async () => {
    try {
        // Testar conexão com o banco
        const conexaoOk = await testarConexao();
        if (!conexaoOk) {
            console.error('❌ Falha na conexão com o banco de dados');
            process.exit(1);
        }

        // Criar tabela se não existir
        await criarTabelaClientes();

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📋 Documentação: http://localhost:${PORT}`);
            console.log(`🔗 Endpoints disponíveis:`);
            console.log(`   GET    http://localhost:${PORT}/clientes`);
            console.log(`   GET    http://localhost:${PORT}/clientes/:id`);
            console.log(`   POST   http://localhost:${PORT}/clientes`);
            console.log(`   PUT    http://localhost:${PORT}/clientes/:id`);
            console.log(`   DELETE http://localhost:${PORT}/clientes/:id`);
        });

    } catch (error) {
        console.error('❌ Erro ao inicializar servidor:', error);
        process.exit(1);
    }
};

// Inicializar servidor apenas se não estiver em modo de teste
if (process.env.NODE_ENV !== 'test') {
    iniciarServidor();
}

module.exports = app;
