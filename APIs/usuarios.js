const express = require('express');
const pool = require('../bd');
const router = express.Router();

// Rota de CADASTRO de Usuário
router.post('/usuario', async (req, res) => {
    const { nome, cpf, dt_nasc, email, celular, senha } = req.body;
    try {
        const client = await pool.connect();
        await client.query('BEGIN');

        // insere na tabela usuarios
        const queryUsuario = `
            INSERT INTO usuarios (nome, cpf, dt_nasc, email, celular, senha) 
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await client.query(queryUsuario, [nome, cpf, dt_nasc, email, celular, senha]);

        // insere na tabela login
        const queryLogin = `
            INSERT INTO login (cpf, senha, dt_acesso, dt_cad) 
            VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        await client.query(queryLogin, [cpf, senha]);

        await client.query('COMMIT'); 
        res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
    }
});

router.get('/usuarios', async (req, res)=>{ 
    try {
        const client = await pool.connect();
        const usuarios = await client.query('SELECT nome,cpf,dt_nasc,email,celular,senha FROM usuarios');
        res.json(usuarios.rows)// rows só tras os objetos 
    }catch(erro){
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao acessar usuários'});

    }
})
//fazer uma rota igual para
router.get('/usuario/:cpf', async (req,res)=>{
    try {
        const client = await pool.connect();
        const usuario = await client.query('SELECT nome,cpf,dt_nasc,email,celular FROM usuarios WHERE cpf = $1',[req.params.cpf]);
        if(!usuario){
            return res.status(404) .json({erro: 'Usuário não encontrado!'})

        }
        res.json(usuario.rows)
        
    }catch(erro){
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao acessar usuários'});

    }

})

router.put('/usuario/:cpf', async (req,res)=>{
    try {
        const client = await pool.connect();
        const {nome,dt_nasc,email,celular} = req.body;
        const usuario = await client.query(`UPDATE usuarios SET nome=$1,dt_nasc=$2,email=$3,celular=$4 WHERE cpf=$5`, [nome,dt_nasc,email,celular,req.params.cpf]);
        if(!usuario){
            return res.status(404) .json({erro: 'Usuário não encontrado!'})
        }
        res.json({mensagem: 'Usuário atualizado com sucesso!'})
        
    }catch(erro){
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao acessar usuários'});
    }

})

router.delete('/usuario/:cpf', async (req,res)=>{
    try {
        const client = await pool.connect();
        const usuario = await client.query('SELECT nome,cpf,dt_nasc,email,celular FROM usuarios WHERE cpf = $1',[req.params.cpf]);
        if(!usuario){
            return res.status(404) .json({erro: 'Usuário não encontrado!'})

        } 
        await client.query('DELETE FROM login WHERE cpf=$1', [req.params.cpf]);
        await client.query('DELETE FROM usuarios WHERE cpf=$1', [req.params.cpf]);
        res.json({mensagem: 'Usuário deletado com sucesso!'})
    
    }catch(erro){
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao acessar usuários'});

    }
})

module.exports = router
