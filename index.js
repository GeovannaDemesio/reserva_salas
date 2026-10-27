const express = require('express');
const app= express();
app.use(express.json())

//login
const rotaLogin = require('./APIs/login');
app.use('/post', rotaLogin)

//usuários
const rotaUsuario = require('./APIs/usuarios');
app.use('/post', rotaUsuario)
app.use('/get', rotaUsuario)
app.use('/get/id', rotaUsuario)
app.use('/put/id', rotaUsuario)
app.use('/delete/id', rotaUsuario)

//salas
const rotaSala = require('./APIs/salas');
app.use('/post', rotaSala)
app.use('/get', rotaSala)
app.use('/get/id', rotaSala)
app.use('/put/id', rotaSala)
app.use('/delete/id', rotaSala)

//laboratórios
const rotaLaboratorios = require('./APIs/laboratorios');
app.use('/post', rotaLaboratorios)
app.use('/get', rotaLaboratorios)
app.use('/get/id', rotaLaboratorios)
app.use('/put/id', rotaLaboratorios)
app.use('/delete/id', rotaLaboratorios)

//reservas
const rotaReserva = require('./APIs/reservas');
app.use('/post', rotaReserva)
app.use('/get', rotaReserva)
app.use('/delete/id', rotaReserva)

app.listen(3001, ()=>{
    console.log('Rodando');
    
});