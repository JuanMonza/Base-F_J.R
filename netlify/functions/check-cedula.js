const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    try {
        const { numero_documento } = JSON.parse(event.body);

        if (!numero_documento) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Numero de documento es requerido.' }),
            };
        }

        // Initialize Supabase client
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('Supabase URL or Anon Key not set in environment variables.');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Configuración de Supabase incompleta.' }),
            };
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Query Supabase to check if numero_documento exists
        const { data, error } = await supabase
            .from('registros_formulario') // Updated table name
            .select('numero_documento')
            .eq('numero_documento', numero_documento)
            .single(); // Use .single() to expect one or zero rows

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
            console.error('Error querying Supabase:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Error al consultar la base de datos.' }),
            };
        }

        const exists = !!data; // If data is not null, it means a record was found

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ exists }),
        };
    } catch (error) {
        console.error('Error en la función check-cedula:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error interno del servidor.' }),
        };
    }
};