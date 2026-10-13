const express = require('express');
const pool = require('../bd');
const router = express.Router();

// Rota de CADASTRO de Sala
router.post('/sala', async (req, res) => {
    const {cod_sala, nome, cap, loc } = req.body;
    try {
        const client = await pool.connect();
        await client.query('BEGIN');

        // insere na tabela sala
        const querysala = `
            INSERT INTO salas (cod_sala, nome, cap, loc) 
            VALUES ($1, $2, $3, $4)
        `;
        await client.query(querysala, [cod_sala, nome, cap, loc]);

        await client.query('COMMIT'); 
        res.status(201).json({ mensagem: 'Sala cadastrada com sucesso!'});

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao verificar sala' });
    }
});

router.get('/sala', async (req, res)=>{ 
    try {
        const client = await pool.connect();
        const sala = await client.query('SELECT cod_sala, nome, cap, loc  FROM salas');
        res.json(sala.rows)// rows só tras os objetos 
    }catch(erro){
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao verificar sala'});
    }
})

router.get('/sala/:cod_sala', async (req,res)=>{
    try {
        const client = await pool.connect();
        const sala = await client.query('SELECT cod_sala,nome,cap,loc  FROM salas WHERE cod_sala=$1',[req.params.cod_sala]);
        if(!sala){
            return res.status(404) .json({erro: 'Sala não encontrada!'})
        } 
        res.json(sala.rows)
    }catch(erro){
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao acessar sala'});

    }
    
})

router.put('/sala/:cod_sala', async (req,res)=>{
    let client;
    try {
        const client = await pool.connect();
        const {nome,cap,loc} = req.body;
        const sala = await client.query('UPDATE salas SET nome=$1,cap=$2,loc=$3  WHERE cod_sala=$4', [nome,cap,loc,req.params.cod_sala]);
        if(!sala){
            return res.status(404) .json({erro: 'Sala não encontrada!'})
        }
        res.json({mensagem: 'Sala atualizado com sucesso!'})
        
    }catch(erro){
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao acessar sala'});
    }

})

router.delete('/sala/:cod_sala', async (req,res)=>{
    try {
        const client = await pool.connect();
        const sala = await client.query('SELECT cod_sala,nome,cap,loc FROM salas WHERE cod_sala = $1',[req.params.cod_sala]);
        if(!sala){
            return res.status(404) .json({erro: 'Sala não encontrada!'})

        } 
        
        await client.query('DELETE FROM salas WHERE cod_sala=$1', [req.params.cod_sala]);
        res.json({mensagem: 'Sala deletada com sucesso!'})
    
    }catch(erro){
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao verificar sala'});

    }
})

module.exports = router
