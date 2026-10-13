const express = require('express');
const pool = require('../bd');
const router = express.Router();

// Rota de CADASTRO de status
router.post('/status', async (req, res) => {
    const {cod_status, nome, cap, loc } = req.body;
    try {
        const client = await pool.connect();
        await client.query('BEGIN');

        // insere na tabela status
        const querystatus = `
            INSERT INTO status (cod_status, nome, cap, loc) 
            VALUES ($1, $2, $3, $4)
        `;
        await client.query(querystatus, [cod_status, nome, cap, loc]);

        await client.query('COMMIT'); 
        res.status(201).json({ mensagem: 'status cadastrada com sucesso!'});

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao verificar status' });
    }
});

router.get('/status', async (req, res)=>{ 
    try {
        const client = await pool.connect();
        const status = await client.query('SELECT cod_status, nome, cap, loc  FROM status');
        res.json(status.rows)// rows só tras os objetos 
    }catch(erro){
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao verificar status'});
    }
})

router.get('/status/:cod_status', async (req,res)=>{
    try {
        const client = await pool.connect();
        const status = await client.query('SELECT cod_status,nome,cap,loc  FROM status WHERE cod_status=$1',[req.params.cod_status]);
        if(!status){
            return res.status(404) .json({erro: 'status não encontrada!'})

        } 
       
    }catch(erro){
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao acessar status'});

    }
res.json(statuss.rows)
})

router.put('/status/:cod_status', async (req,res)=>{
    try {
        const client = await pool.connect();
        const {nome,cap,loc} = req.body;
        const status = await client.query(`UPDATE status SET nome=$2,cap=$3,loc=$4  WHERE cod_status=$1`, [nome,cap,loc,req.params.cod_status]);
        if(!status){
            return res.status(404) .json({erro: 'status não encontrada!'})
        }
        res.json({mensagem: 'status atualizado com sucesso!'})
        
    }catch(erro){
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao acessar status'});
    }

})

module.exports = router
