const express = require('express');
const pool = require('../bd');
const router = express.Router();

// Rota de CADASTRO de laboratorio
router.post('/laboratorio', async (req, res) => {
    const {cod_lab, nome, cap, loc } = req.body;
    try {
        const client = pool;

        // insere na tabela laboratorio
        const querylaboratorio = `
            INSERT INTO laboratorios (cod_lab, nome, cap, loc) 
            VALUES ($1, $2, $3, $4)
        `;
        await client.query(querylaboratorio, [cod_lab, nome, cap, loc]);

        res.status(201).json({ mensagem: 'Laboratório cadastrado com sucesso!'});

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao verificar laboratório' });
    }
});

router.get('/laboratorio', async (req, res)=>{ 
    try {
        const client = pool; // pool.query libera a conexão sozinho
        const laboratorio = await client.query('SELECT cod_lab, nome, cap, loc  FROM laboratorios');
        res.json(laboratorio.rows)// rows só tras os objetos 
    }catch(erro){
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao verificar laboratório'});
    }
})

router.get('/laboratorio/:cod_lab', async (req,res)=>{
    try {
        const client = pool;
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
        const client = pool; 
        const {nome,cap,loc} = req.body;
        const laboratorio = await client.query(`UPDATE laboratorios SET nome=$2,cap=$3,loc=$4  WHERE cod_lab=$1`, [req.params.cod_lab,nome,cap,loc]);
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
        const client = pool; 
        const laboratorio = await client.query('SELECT cod_lab,nome,cap,loc FROM laboratorios WHERE cod_lab = $1',[req.params.cod_lab]);
        if(!laboratorio){
            return res.status(404) .json({erro: 'Laboratório não encontrado!'})

        } 
    
        await client.query("DELETE FROM reservas WHERE tipo='L' AND cod_recurso=$1", [req.params.cod_lab]);
        await client.query('DELETE FROM laboratorios WHERE cod_lab=$1', [req.params.cod_lab]);
        res.json({mensagem: 'Laboratório deletado com sucesso!'})
    
    }catch(erro){
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao verificar laboratório'});

    }
})

module.exports = router
