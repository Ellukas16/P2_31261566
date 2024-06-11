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
    this.db.run('CREATE TABLE IF NOT EXISTS contactos(nombre VARCHAR(255), correo VARCHAR(255), comentario TEXT,ip TEXT,fecha TEXT,pais TEXT)');
    this.db.run('CREATE TABLE IF NOT EXISTS usuarios(username VARCHAR(255), password VARCHAR(255))');
  }

  guardar(nombre, correo, comentario, ip, fecha, pais) {
    this.db.run("INSERT INTO contactos VALUES (?, ?, ?, ?, ?, ?)", [nombre, correo, comentario, ip, fecha, pais]);
  }

  contactosRead() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM contactos;",[],(err,rows) =>{
        if(err){
          reject(err)
        }else{
          resolve(rows)
        }
      })
    })

  }

  loginRead(username, password) {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM usuarios where username ='" + username + "' and password ='" + password + "';", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

  }

}

module.exports = ContactosModel