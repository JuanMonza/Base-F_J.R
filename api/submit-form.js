import { createClient } from '@supabase/supabase-js';

// Inicializa el cliente de Supabase usando las variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
    // Logs de debug
    console.log('🚀 Function called');
    console.log('📄 Method:', req.method);
    console.log('🔑 SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing');
    console.log('🔑 SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Found' : 'Missing');
    
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Manejar preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const data = req.body; // En Vercel, el body ya viene parseado

        console.log("Datos recibidos:", data);

        // Validar que los datos necesarios estén presentes
        if (!data || typeof data !== 'object') {
            return res.status(400).json({ message: "Datos inválidos" });
        }

        // Preparar los datos para insertar (solo los campos que existen en tu tabla)
        const dataToInsert = {
            nombre: data.nombre || null,
            tipo_documento: data.tipo_documento || null,
            numero_documento: data.numero_documento || null,
            fecha_expedicion: data.fecha_expedicion || null,
            fecha_nacimiento: data.fecha_nacimiento || null,
            departamento: data.departamento || null,
            ciudad: data.ciudad || null,
            direccion: data.direccion || null,
            telefono_principal: data.telefono_principal || null,
            telefono_familiar: data.telefono_familiar || null,
            tiene_correo: data.tiene_correo || null,
            correo: data.correo || null,
            estado_civil: data.estado_civil || null,
            ocupacion: data.ocupacion || null,
            recibe_pension: data.recibe_pension || null,
            fondo_pension: data.fondo_pension || null,
            familia_extranjero: data.familia_extranjero || null,
            mascota: data.mascota || null,
            privacidad: data.privacidad || false
        };

        // --- Insertar datos en Supabase ---
        const { data: insertedData, error } = await supabase
            .from('registros_formulario')
            .insert([dataToInsert]); // Inserta los datos del formulario

        if (error) {
            console.error("Error al insertar en Supabase:", error);
            return res.status(500).json({ 
                message: "Error al guardar los datos en la base de datos.",
                error: error.message 
            });
        }

        console.log("Datos guardados en Supabase:", insertedData);

        return res.status(200).json({ 
            message: "Datos recibidos y guardados correctamente. ¡Gracias!" 
        });

    } catch (error) {
        console.error("Error general al procesar el formulario:", error);
        return res.status(500).json({ 
            message: "Error interno del servidor.",
            error: error.message 
        });
    }
};