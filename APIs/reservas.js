const express = require('express');
const pool = require('../bd');
const router = express.Router();

const selectReservas = `
    SELECT r.cod_reserva, r.tipo, r.cod_recurso,
        COALESCE(s.nome, l.nome) AS recurso_nome,
        r.cpf, u.nome AS usuario_nome,
        to_char(r.data, 'YYYY-MM-DD') AS data,
        to_char(r.hora_ini, 'HH24:MI') AS hora_ini,
        to_char(r.hora_fim, 'HH24:MI') AS hora_fim,
        CASE WHEN r.status = 'Reservado'
                AND LOCALTIMESTAMP >= r.data + r.hora_ini
                AND LOCALTIMESTAMP < r.data + r.hora_fim
            THEN 'Ocupado' ELSE r.status END AS status
    FROM reservas r
    JOIN usuarios u ON u.cpf = r.cpf
    LEFT JOIN salas s ON r.tipo = 'S' AND s.cod_sala = r.cod_recurso
    LEFT JOIN laboratorios l ON r.tipo = 'L' AND l.cod_lab = r.cod_recurso
`;

router.post('/reserva', async (req, res) => {
    const { tipo, cod_recurso, cpf, data, hora_ini, hora_fim, status } = req.body;
    try {
        const tabela = tipo === 'S' ? 'SELECT 1 FROM salas WHERE cod_sala = $1' : 'SELECT 1 FROM laboratorios WHERE cod_lab = $1';
        const recurso = await pool.query(tabela, [cod_recurso]);
        if (recurso.rows.length === 0) {
            return res.status(404).json({ erro: 'Recurso não encontrado!' });
        }

        const queryReserva = `
            INSERT INTO reservas (tipo, cod_recurso, cpf, data, hora_ini, hora_fim, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING cod_reserva
        `;
        const reserva = await pool.query(queryReserva, [tipo, cod_recurso, cpf, data, hora_ini, hora_fim, status || 'Reservado']);
        res.status(201).json({ mensagem: 'Reserva cadastrada com sucesso!', cod_reserva: reserva.rows[0].cod_reserva });

    } catch (erro) {
        if (erro.code === '23P01') {
            return res.status(409).json({ erro: 'Recurso já reservado ou bloqueado nesse horário!' });
        }
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao cadastrar reserva' });
    }
});

router.get('/reserva', async (req, res) => {
    try {
        const { data, usuario, tipo, cod, recurso } = req.query;
        const filtros = [];
        const valores = [];
        const adicionar = (condicao, valor) => {
            valores.push(valor);
            filtros.push(condicao.replaceAll('?', `$${valores.length}`));
        };

        if (data) adicionar('r.data = ?', data);
        if (usuario) adicionar("(u.nome ILIKE ? OR r.cpf LIKE ?)", `%${usuario}%`);
        if (tipo) adicionar('r.tipo = ?', tipo);
        if (cod) adicionar('r.cod_recurso = ?', cod);
        if (recurso) adicionar("(COALESCE(s.nome, l.nome) ILIKE ? OR r.cod_recurso ILIKE ?)", `%${recurso}%`);

        const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
        const reservas = await pool.query(`${selectReservas} ${where} ORDER BY r.data, r.hora_ini`, valores);
        res.json(reservas.rows)
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao verificar reservas' });
    }
})

router.get('/reserva/:cod_reserva', async (req, res) => {
    try {
        const reserva = await pool.query(`${selectReservas} WHERE r.cod_reserva = $1`, [req.params.cod_reserva]);
        if (reserva.rows.length === 0) {
            return res.status(404).json({ erro: 'Reserva não encontrada!' })
        }
        res.json(reserva.rows)
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao acessar reserva' });
    }
})

router.delete('/reserva/:cod_reserva', async (req, res) => {
    try {
        const reserva = await pool.query('DELETE FROM reservas WHERE cod_reserva = $1', [req.params.cod_reserva]);
        if (reserva.rowCount === 0) {
            return res.status(404).json({ erro: 'Reserva não encontrada!' })
        }
        res.json({ mensagem: 'Reserva cancelada com sucesso!' })
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao cancelar reserva' });
    }
})

module.exports = router
