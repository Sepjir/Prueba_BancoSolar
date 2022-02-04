//almacenando modulos de NodeJS y funciones para consultas en base de datos postgreSQL
const http = require("http")
const url = require("url")
const fs = require("fs")
const { insertar, consultarUsuarios, modificarUsuarios, eliminarUsuarios, transferir, consultarTransferencias } = require("./consultas")


//Creando servidor con sus rutas para consulta, inserción, modificación y borrado de datos en base de datos
http
  .createServer(async (req, res) => {

    // preparando ruta raíz para lectura de HTML
    if (req.url == "/" && req.method === "GET") {
      try {
        res.setHeader("Content-Type", "text/html");
        const html = fs.readFileSync("index.html", "utf-8");
        res.statusCode = 200
        res.end(html)
        
      } catch (error) {
        console.log("Error en la lectura del HTML", error.code)
        res.statusCode = 404
        res.end(`<img src="https://http.cat/404" alt="">`)
        
      }
    }

    // preparando ruta /usuarios para lectura de usuarios en base de dato
    if (req.url == "/usuarios" && req.method === "GET") {
      try {
        const respuesta = await consultarUsuarios()
        res.statusCode = 200
        res.end(JSON.stringify(respuesta.rows))
        
      } catch (error) {
        console.log("Hay un error con la ruta de los usuarios en la BD: ", error.code)
        res.statusCode = 404
        res.end(`<img src="https://http.cat/404" alt="">`)
      }
    }


    // preparando ruta /usuario para la inserción de datos en la base de datos
    if (req.url == "/usuario" && req.method === "POST") {
      try {
        let body = ""
        req.on("data", (chunk) => {
          body += chunk
        })
        req.on("end", async () => {
          const datos = Object.values(JSON.parse(body))
          const respuesta = await insertar(datos)
          res.statusCode = 201
          res.end(JSON.stringify(respuesta))
        });
        
      } catch (error) {
        console.log("Ha habido un error en la creación de los usuarios: ", error.code)
        res.statusCode = 400
        res.end(`<img src="https://http.cat/400" alt="">`)
        
      }
    }


    // preparando ruta /usuario con metodo PUT para la modificación de usuarios
    if (req.url.startsWith("/usuario") && req.method === "PUT") {
      const { id } = url.parse(req.url, true).query;

      try {
        let body = ""
        req.on("data", (chunk) => {
          body += chunk
        })
  
        req.on("end", async () => {
          const datos = Object.values(JSON.parse(body))
          const respuesta = await modificarUsuarios(datos, id)
          res.statusCode = 201
          res.end(JSON.stringify(respuesta))
        })
        
      } catch (error) {
        console.log("Ha habido un error al tratar de modificar un usuario: ", error.code)
        res.statusCode = 400
        res.end(`<img src="https://http.cat/400" alt="">`)
      }
    }

    // preparando ruta /usuario para borrar usuarios de base de datos
    if (req.url.startsWith("/usuario") && req.method === "DELETE") {
      const { id } = url.parse(req.url, true).query;
      try {
        const respuesta = await eliminarUsuarios(id)
        res.statusCode = 202
        res.end(JSON.stringify(respuesta))
        
      } catch (error) {
        console.log("Ha habido un error al eliminar a un usuario: ", error.code)
        res.statusCode = 400
        res.end(`<img src="https://http.cat/400" alt="">`)
      }
    }

    // preparando ruta /transferencia con metodo POST para la realización de transferencias en la base de datos
    if (req.url == "/transferencia" && req.method === "POST") {
      try {
        let body = ""
        req.on("data", (chunk) => {
          body += chunk
        })
  
        req.on("end", async () => {
          const datos = Object.values(JSON.parse(body))
          const respuesta = await transferir(datos)
          res.statusCode = 201
          res.end(JSON.stringify(respuesta))
        })
        
      } catch (error) {
        console.log("Ha habido un error en las transferencias: ", error.code)
        res.statusCode = 400
        res.end(`<img src="https://http.cat/400" alt="">`)
      }
    }


    // preparando la ruta /transferencias con metodo GET para el registro de las transferencias realizadas
    if (req.url == "/transferencias" && req.method === "GET") {
      try {
        const respuesta = await consultarTransferencias()
        res.statusCode = 200
        res.end(JSON.stringify(respuesta.rows))
        
      } catch (error) {
        console.log("Ha habido un error al consultar las transacciones realizadas: ", error.code)
        res.statusCode = 404
        res.end(`<img src="https://http.cat/404" alt="">`)
        
      }
    }

  })
  .listen(3000, () => console.log("Servidor levantado en puerto 3000"));