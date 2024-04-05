const express = require('express')
const app = express()
const port = 3000

app.get('/', function (request, response) {
    response.send(`
    <h1>Hola Mundo!</h1>
    <ul>
      <li>Nombre: Andres Eduardo</li>
      <li>Apellido: Flores Pedrique</li>
      <li>Cedula: 31.261.566</li>
      <li>Seccion: 2</li>
    </ul>
  `)
  })
app.listen(3000)