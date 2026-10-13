const express = require('express');
const pool = require('../bd');
const router = express.Router();

// Rota de CADASTRO de laboratorio
router.post('/laboratorio', async (req, res) => {
    const {cod_lab, nome, cap, loc } = req.body;
    try {
        const client = await pool.connect();
        await client.query('BEGIN');

        // insere na tabela laboratorio
        const querylaboratorio = `
            INSERT INTO laboratorios (cod_lab, nome, cap, loc) 
            VALUES ($1, $2, $3, $4)
        `;
        await client.query(querylaboratorio, [cod_lab, nome, cap, loc]);

        await client.query('COMMIT'); 
        res.status(201).json({ mensagem: 'Laboratório cadastrado com sucesso!'});

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao verificar laboratório' });
    }
});

router.get('/laboratorio', async (req, res)=>{ 
    try {
        const client = await pool.connect();
        const laboratorio = await client.query('SELECT cod_lab, nome, cap, loc  FROM laboratorios');
        res.json(laboratorio.rows)// rows só tras os objetos 
    }catch(erro){
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao verificar laboratório'});
    }
})

router.get('/laboratorio/:cod_lab', async (req,res)=>{
    try {
        const client = await pool.connect();
        const laboratorio = await client.query('SELECT cod_lab,nome,cap,loc  FROM laboratorios WHERE cod_lab=$1',[req.params.cod_lab]);
        if(!laboratorio){
            return res.status(404) .json({erro: 'Laboratório não encontrado!'})
        } 
        res.json(laboratorio.rows)
    }catch(erro){
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao acessar laboratório'});

    }

})

router.put('/laboratorio/:cod_lab', async (req,res)=>{
    try {
        const client = await pool.connect();
        const {nome,cap,loc} = req.body;
        const laboratorio = await client.query(`UPDATE laboratorios SET nome=$2,cap=$3,loc=$4  WHERE cod_lab=$1`, [nome,cap,loc,req.params.cod_lab]);
        if(!laboratorio){
            return res.status(404) .json({erro: 'Laboratório não encontrado!'})
        }
        res.json({mensagem: 'Laboratório atualizado com sucesso!'})
        
    }catch(erro){
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao acessar laboratório'});
    }

})

router.delete('/laboratorio/:cod_lab', async (req,res)=>{
    try {
        const client = await pool.connect();
        const laboratorio = await client.query('SELECT cod_lab,nome,cap,loc FROM laboratorios WHERE cod_lab = $1',[req.params.cod_lab]);
        if(!laboratorio){
            return res.status(404) .json({erro: 'Laboratório não encontrado!'})

        } 
    
        await client.query('DELETE FROM laboratorios WHERE cod_lab=$1', [req.params.cod_lab]);
        res.json({mensagem: 'Laboratório deletado com sucesso!'})
    
    }catch(erro){
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao verificar laboratório'});

    }
})

module.exports = router
