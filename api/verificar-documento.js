import { createClient } from '@supabase/supabase-js';

// Cache para evitar consultas duplicadas
const verificacionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function limpiarCacheExpirado() {
    const ahora = Date.now();
    for (const [key, value] of verificacionCache.entries()) {
        if (ahora - value.timestamp > CACHE_TTL) {
            verificacionCache.delete(key);
        }
    }
}

export default async function handler(req, res) {
    console.log('🔍 Verificando si documento existe en DB');
    
    // Limpiar caché expirado
    limpiarCacheExpirado();
    
    // Obtener variables de entorno de Supabase
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Validar que las variables de entorno estén disponibles
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Error de configuración de Supabase');
        return res.status(500).json({ 
            error: "Error de configuración del servidor" 
        });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Configurar CORS
    const allowedOrigins = [
        'https://base-f-j-kevce1d4a-jardines-renacer-s-projects.vercel.app',
        'https://actualizaciondedatos.jardinesdelrenacer.co',
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
    ].filter(Boolean);
    
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { numero_documento } = req.body;
        
        if (!numero_documento) {
            return res.status(400).json({ 
                error: 'Número de documento requerido' 
            });
        }

        // Verificar caché
        const cacheKey = `doc_${numero_documento}`;
        if (verificacionCache.has(cacheKey)) {
            const cached = verificacionCache.get(cacheKey);
            console.log(`✅ Cache hit para verificación: ${numero_documento}`);
            return res.status(200).json(cached.data);
        }

        // Buscar en la base de datos
        const { data: existingRecord, error } = await supabase
            .from('registros_formulario')
            .select('numero_documento, nombre, created_at, updated_at')
            .eq('numero_documento', numero_documento)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = No se encontró registro (caso válido)
            console.error("Error al verificar documento:", error);
            return res.status(500).json({ 
                error: "Error al verificar los datos" 
            });
        }

        const response = {
            exists: !!existingRecord,
            data: existingRecord ? {
                nombre: existingRecord.nombre,
                registrado: existingRecord.created_at,
                actualizado: existingRecord.updated_at
            } : null
        };

        // Guardar en caché
        verificacionCache.set(cacheKey, {
            data: response,
            timestamp: Date.now()
        });

        return res.status(200).json(response);

    } catch (error) {
        console.error("Error general al verificar documento:", error);
        return res.status(500).json({ 
            error: "Error interno del servidor" 
        });
    }
}
