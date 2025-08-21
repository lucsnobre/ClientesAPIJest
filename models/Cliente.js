/**
 * Model para Cliente - Inspirado na estrutura do ProjetoMusicaAPI
 * Responsável pelas operações de banco de dados relacionadas aos clientes
 */

const { pool } = require('../config/database');

class Cliente {
    constructor(nome, email, telefone, id = null) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.telefone = telefone;
    }

    // Validar dados do cliente
    static validarDados(dados) {
        const erros = [];

        if (!dados.nome || dados.nome.trim().length < 2) {
            erros.push('Nome é obrigatório e deve ter pelo menos 2 caracteres');
        }

        if (!dados.email || !this.validarEmail(dados.email)) {
            erros.push('Email é obrigatório e deve ter formato válido');
        }

        if (!dados.telefone || dados.telefone.trim().length < 10) {
            erros.push('Telefone é obrigatório e deve ter pelo menos 10 caracteres');
        }

        return erros;
    }

    // Validar formato do email
    static validarEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Criar novo cliente
    static async criar(dados) {
        try {
            const query = `
                INSERT INTO clientes (nome, email, telefone) 
                VALUES (?, ?, ?)
            `;
            
            const [result] = await pool.execute(query, [
                dados.nome.trim(),
                dados.email.trim().toLowerCase(),
                dados.telefone.trim()
            ]);

            return {
                id: result.insertId,
                nome: dados.nome.trim(),
                email: dados.email.trim().toLowerCase(),
                telefone: dados.telefone.trim()
            };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Email já está cadastrado');
            }
            throw error;
        }
    }

    // Listar todos os clientes
    static async listarTodos() {
        try {
            const query = `
                SELECT id, nome, email, telefone, criado_em, atualizado_em 
                FROM clientes 
                ORDER BY nome ASC
            `;
            
            const [rows] = await pool.execute(query);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Buscar cliente por ID
    static async buscarPorId(id) {
        try {
            const query = `
                SELECT id, nome, email, telefone, criado_em, atualizado_em 
                FROM clientes 
                WHERE id = ?
            `;
            
            const [rows] = await pool.execute(query, [id]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Buscar cliente por email
    static async buscarPorEmail(email) {
        try {
            const query = `
                SELECT id, nome, email, telefone, criado_em, atualizado_em 
                FROM clientes 
                WHERE email = ?
            `;
            
            const [rows] = await pool.execute(query, [email.toLowerCase()]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Atualizar cliente
    static async atualizar(id, dados) {
        try {
            const query = `
                UPDATE clientes 
                SET nome = ?, email = ?, telefone = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            
            const [result] = await pool.execute(query, [
                dados.nome.trim(),
                dados.email.trim().toLowerCase(),
                dados.telefone.trim(),
                id
            ]);

            return result.affectedRows > 0;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Email já está cadastrado');
            }
            throw error;
        }
    }

    // Deletar cliente
    static async deletar(id) {
        try {
            const query = `DELETE FROM clientes WHERE id = ?`;
            const [result] = await pool.execute(query, [id]);
            
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Contar total de clientes
    static async contarTotal() {
        try {
            const query = `SELECT COUNT(*) as total FROM clientes`;
            const [rows] = await pool.execute(query);
            return rows[0].total;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Cliente;
