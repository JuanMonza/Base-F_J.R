const { createClient } = require('@supabase/supabase-js');

// Inicializa el cliente de Supabase usando las variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: "Method Not Allowed"
        };
    }

    try {
        const data = JSON.parse(event.body); // Datos del formulario enviados como JSON

        // --- Insertar datos en Supabase ---
        const { data: insertedData, error } = await supabase
            .from('registros_formulario')  // Nombre de la tabla en Supabase
            .insert([data]); // Inserta los datos del formulario

        if (error) {
            console.error("Error al insertar en Supabase:", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Error al guardar los datos." })
            };
        }

        console.log("Datos guardados en Supabase:", insertedData);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Datos recibidos y guardados correctamente. ¡Gracias!" })
        };

    } catch (error) {
        console.error("Error general al procesar el formulario:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error interno del servidor." })
        };
    }
};