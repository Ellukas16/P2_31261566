var express = require('express');
var router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const path = require('path');
const nodemailer = require('nodemailer')
require('dotenv').config()

class ContactosModel {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, "/db", "db.db"), (err) => {
      if (err) {
        console.log('Error en la base de datos')
      }
      console.log('Base de datos creada')
    });
  }

  conectar() {
    this.db.run('CREATE TABLE IF NOT EXISTS contactos(nombre VARCHAR(255), correo VARCHAR(255), comentario TEXT,ip TEXT,fecha TEXT)');
  }

  guardar(nombre, correo, comentario, ip, fecha) {
    this.db.run("INSERT INTO contactos VALUES (?, ?, ?, ?, ?)", [nombre, correo, comentario, ip, fecha]);
  }

}


class ContactosController {
  constructor() {
    this.model = new ContactosModel();
    this.model.conectar();
  }

  async save(req, res) {
    const { nombre, correo, comentario } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
    let hoy = new Date();
    let horas = hoy.getHours();
    let minutos = hoy.getMinutes();
    let hora = horas + ':' + minutos;
    let fecha = hoy.getDate() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getFullYear() + '' + '/' + '' + hora;

    const response_key = req.body["g-recaptcha-response"];
    const secret_key = process.env.GKEYPRIVATE;
    const options = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`


    try {

      const pais = "http://ip-api.com/json/" + ip


      const re = await fetch(options, { method: "post", });
      const json = await re.json();
      console.log(json)
      if (!json.success) {
        return res.send({ response: "Failed" });
      }

      let transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        secureConnection: false,
        port: 587,
        tls: {
          ciphers: 'SSLv3'
        },
        auth: {
          user: process.env.EMAILOUTLOOK,
          pass: process.env.PASSWORDOUTLOOK
        }
      });

      const html = `
            <h1>Información del Cliente</h1>
            <p>¡Bienvenido!</p>
            <p>Email: ${correo}</p>
            <p>Nombre: ${nombre}</p>
            <p>Comentario: ${comentario}</p>
            <p>Fecha: ${fecha}</p>
            <p>IP: ${ip}</p>
            <pli>Pais: ${pais}</p>
            `;

      const receiver = {
        from: process.env.EMAILOUTLOOK,
        to: 'programacion2ais@dispostable.com',
        subject: 'Informacion del Contacto',
        html: html
      };


      transporter.sendMail(receiver, (err, info) => {
        if (err) {
          console.log(err)
        }

        else {
          this.model.guardar(nombre, correo, comentario, ip, fecha);
          res.send({ success: "Formulario enviado correctamente" });
          console.log(info)
        }

      })






    } catch (error) {
      return res.send({ response: "Faileddd!" });
    }








  }
}

const controllerContact = new ContactosController();


router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express',
    GKEYPUBLIC: process.env.GKEYPUBLIC
  });
});


router.post('/enviar', (req, res) =>
  controllerContact.save(req, res)
)




module.exports = router;
