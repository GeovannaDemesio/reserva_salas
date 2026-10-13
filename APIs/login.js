const express = require('express');
const pool = require('../bd');
const router = express.Router();

// Rota de LOGIN valida o cpf e a senha na tabela login, dps devolve os dados do usuário
router.post('/login', async (req, res) => {
    const { cpf, senha } = req.body;
    try {
        const login = await pool.query('SELECT cpf FROM login WHERE cpf = $1 AND senha = $2', [cpf, senha]);
        if (login.rows.length === 0) {
            return res.status(401).json({ erro: 'CPF ou senha inválidos' });
        }
        await pool.query('UPDATE login SET dt_acesso = CURRENT_TIMESTAMP WHERE cpf = $1', [cpf]);
        const usuario = await pool.query('SELECT nome, cpf, email FROM usuarios WHERE cpf = $1', [cpf]);
        res.json(usuario.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao realizar login' });
    }
});

module.exports = router;
