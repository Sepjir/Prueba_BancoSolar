//Llamando al objeto Pool desde el paquete "pg" de NPM
const { Pool } = require("pg");

// objeto de configuración para conectar a base de datos PostgreSQL
const config = {
    user: "postgres",
    host: "localhost",
    password: "nemesis",
    port: 5432,
    database: "bancosolar"
}

// instanciando Pool con el objeto de configuración
const pool = new Pool(config)

//Función insertar datos en BD de Banco Solar tomando los datos de Payload desde la aplicación cliente
const insertar = async (datos) => {
    const consulta = {
        text: "INSERT INTO usuarios(nombre, balance) VALUES ($1, $2)",
        values: datos
    }

    try {
        const result = await pool.query(consulta)
        return result
    } catch (error) {
        console.log("El código del error es el siguiente: " + error.code)
        return error
        
    }
}

// Función para consultar usuarios agregados en la BD que se muestran en el HTML
const consultarUsuarios = async () => {
    const consulta = {
        text: "SELECT * FROM usuarios ORDER BY id",
    }

    try {
        const result = await pool.query(consulta)
        return result
    } catch (error) {
        console.log("Ha habido un error en consultar los usuarios: " + error.code)
        return error
    }
}

//Función que modifica usuarios de la BD
const modificarUsuarios = async (datos, id) => {
    const consulta = {
        text: `UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = ${id} RETURNING*`,
        values: datos
    }
    try {
        const result = await pool.query(consulta)
        console.log(`El usuario de con id ${id} ha sido modificado`)
        return result
    } catch (error) {
        console.log("Ha habido un error al modificar el usuario " + error.code)
    }
}

// función que elimina usuarios de la BD
const eliminarUsuarios = async (id) =>{
    const consulta1 = {
        text: `DELETE FROM transferencias WHERE emisor = ${id}`
    }
    const consulta2 = {
        text: `DELETE FROM transferencias WHERE receptor = ${id}`
    }

    const consulta3 = {
        text: `DELETE FROM usuarios WHERE id = ${id}`
    }

    try {
        const result = await pool.query(consulta1)
        const result2 = await pool.query(consulta2)
        const result3 = await pool.query(consulta3)
        console.log(`El usuario de id "${id}" ha sido exitosamente eliminado con todas sus referencias y transferencias`)
        return result
    } catch (error) {
        console.log(`Ha habido un error al eliminar el usuario de id "${id}" con código: ${error.code}`)
    }
}

//Función que ejecuta la transferencia entre usuarios en la BD
const transferir = async (datos) => {
    try {
        await pool.query("BEGIN")
        const descontar = {
            text: `UPDATE usuarios SET balance = balance - ${datos[2]} WHERE nombre = '${datos[0]}' RETURNING*`
        }
        const descontando = await pool.query(descontar)
        const acreditar = {
            text: `UPDATE usuarios SET balance = balance + ${datos[2]} WHERE nombre = '${datos[1]}' RETURNING*`
        }
        const acreditacion = await pool.query(acreditar)
        console.log(`El usuario "${datos[0]}" ha transferido un monto de "$${datos[2]}" al usuario "${datos[1]}"`)
    
        const registrarTabla = {
            text: "INSERT INTO transferencias(emisor, receptor, monto, fecha) VALUES($1, $2, $3, $4)",
            values: [descontando.rows[0].id, acreditacion.rows[0].id, datos[2],new Date]
        }
        await pool.query(registrarTabla)
        await pool.query("COMMIT")
        const data = [descontando.rows[0].nombre, acreditacion.rows[0].nombre, datos[2],new Date]
        return data
        
    } catch (error) {
        await pool.query("ROLLBACK")
        console.log("Ha habido un error con la transferencia: ", error.code)
        return error
    }

}
//Función que hace una consulta con subquery para traer los datos de fecha, emisor, receptor y monto
const consultarTransferencias = async () => {
    const consulta = {
      rowMode: "array",
      text: "SELECT transferencias.fecha, (SELECT usuarios.nombre FROM usuarios WHERE transferencias.emisor = usuarios.id) as emisor, usuarios.nombre as receptor, transferencias.monto FROM usuarios INNER JOIN transferencias ON transferencias.receptor = usuarios.id ORDER BY transferencias.id;",
    };

    try {
        const result = await pool.query(consulta)
        return result
        
    } catch (error) {
        console.log("Ha habido un error en consultar las transferencias: " + error.code)
        return error
    }
}

//Exportando las funciones para ser utilizadas en index.js
module.exports = { insertar, consultarUsuarios, modificarUsuarios, eliminarUsuarios, transferir, consultarTransferencias}