
const nodemailer = require('nodemailer')
require('dotenv').config()
const ContactosModel = require('./models/ContactosModel');
const passport = require("passport");
const jwt = require("jsonwebtoken");



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

            const responseCountry = "http://ip-api.com/json/" + ip
            const pais = responseCountry.country

            const re = await fetch(options, { method: "post", });
            const json = await re.json();
            console.log(json)
            if (!json.success) {
                return res.send({ response: "Failed" });
            }

            let transporter = nodemailer.createTransport({
                host: "smtp.hostinger.com",
                secureConnection: false,
                port: 465,
                tls: {
                    ciphers: 'SSLv3'
                },
                auth: {
                    user: process.env.EMAILOUTLOOK,
                    pass: process.env.PASSWORDOUTLOOK
                },
                debug: true
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
                    this.model.guardar(nombre, correo, comentario, ip, fecha,pais);
                    res.send({ success: "Formulario enviado correctamente" });
                    console.log(info)
                }

            })

        } catch (error) {
            return res.send({ response: "Faileddd!" });
        }
    }

    async loginRead(req, res) {
        try {
            const { username, password } = req.body;
            const rows = await this.model.loginRead(username, password);
            if (rows.length > 0) {
                const id = process.env.ID;
                const token = jwt.sign({ id: id }, process.env.JWTSECRET);
                res.cookie('jwt', token)
                return res.redirect('/contactos');
            }
            else {
                return res.send({
                    request: 'Error in credentials'
                })
            }
        } catch (error) {
            console.log(error)
        }
    }


    async contactosRead(req,res) {
        const rows = await this.model.contactosRead();
        res.render('contactos',{
            get:rows
        })
    }
}





module.exports = ContactosController