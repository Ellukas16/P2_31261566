var express = require('express');
var router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const path = require('path');


class ContactosModel{
  constructor(){
    this.db = new sqlite3.Database(path.join(__dirname, "/db", "db.db"), (err) => {
      if(err){
        console.log('Error en la base de datos')
      }
      console.log('Base de datos creada')
    });
  }

  conectar(){
    this.db.run('CREATE TABLE IF NOT EXISTS contactos(nombre VARCHAR(255), correo VARCHAR(255), comentario TEXT,ip TEXT,fecha TEXT)');
}
  
  guardar(nombre,correo,comentario,ip,fecha){
    this.db.run("INSERT INTO contactos VALUES (?, ?, ?, ?, ?)", [nombre, correo, comentario, ip, fecha]);
  }

}


class ContactosController{
  constructor(){
    this.model = new ContactosModel();
    this.model.conectar();
  }

  guardarC(req,res){
    const { nombre, correo, comentario} = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
    let hoy = new Date();
	  let horas = hoy.getHours();
	  let minutos = hoy.getMinutes();
	  let hora = horas + ':' + minutos;
	  let fecha = hoy.getDate() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getFullYear() + '' + '/' + '' + hora;
    this.model.guardar(nombre,correo,comentario,ip,fecha);
    res.send('Guardado exitosamente')
  }
}

const controllerContact = new ContactosController();


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/enviar',(req,res) => 
  controllerContact.guardarC(req,res)
)




module.exports = router;
