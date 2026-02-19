import { createClient } from '@supabase/supabase-js';

// Cache para evitar consultas duplicadas
const verificacionCache = new Map();
const CACHE_TTL = 10 * 1000; // 10 segundos para pruebas

function normalizeDocumentNumber(value) {
    if (!value || typeof value !== 'string') return '';
    return value.trim().replace(/[.\-\s]/g, '');
}

function normalizeDocumentType(value) {
    if (!value || typeof value !== 'string') return '';
    const cleaned = value
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');

    if (cleaned === 'CC' || cleaned.includes('CEDULADECIUDADANIA')) return 'CC';
    if (cleaned === 'CE' || cleaned.includes('CEDULADEEXTRANJERIA')) return 'CE';
    if (cleaned === 'PEP' || cleaned.includes('PERMISOESPECIALDEPERMANENCIA')) return 'PEP';
    return cleaned;
}

function buildLooseLikePattern(doc) {
    return `%${doc.split('').join('%')}%`;
}

function pickMatchingRecord(records, numeroDocumentoNormalizado, tipoDocumentoNormalizado) {
    if (!Array.isArray(records) || records.length === 0) return null;

    return records.find((row) => {
        const rowDoc = normalizeDocumentNumber(row.numero_documento || '');
        if (rowDoc !== numeroDocumentoNormalizado) return false;

        if (!tipoDocumentoNormalizado) return true;
        const rowType = normalizeDocumentType(row.tipo_documento || '');
        return rowType === tipoDocumentoNormalizado;
    }) || null;
}

function limpiarCacheExpirado() {
    const ahora = Date.now();
    for (const [key, value] of verificacionCache.entries()) {
        if (ahora - value.timestamp > CACHE_TTL) {
            verificacionCache.delete(key);
        }
    }
}

export default async function handler(req, res) {
    console.log('Verificando si documento existe en DB');
    
    // Limpiar caché expirado
    limpiarCacheExpirado();
    
    // Obtener variables de entorno de Supabase
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Validar que las variables de entorno estén disponibles
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Error de configuración de Supabase: falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
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

    if (req.method === "GET") {
        // Permitir GET solo para pruebas, no consulta la base de datos
        return res.status(200).json({
            message: "Endpoint activo. Usa POST para consultar un documento.",
            success: true
        });
    }
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { numero_documento, tipo_documento } = req.body;
        const tipoDocumentoNormalizado = normalizeDocumentType(tipo_documento);
        const numeroDocumentoNormalizado = normalizeDocumentNumber(numero_documento);
        
        if (!numeroDocumentoNormalizado) {
            return res.status(400).json({ 
                error: 'Número de documento requerido' 
            });
        }

        // Verificar caché
        const cacheKey = `doc_${tipoDocumentoNormalizado || 'NA'}_${numeroDocumentoNormalizado}`;
        if (verificacionCache.has(cacheKey)) {
            const cached = verificacionCache.get(cacheKey);
            console.log(`Cache hit para verificación: ${numeroDocumentoNormalizado}`);
            return res.status(200).json(cached.data);
        }

        // Buscar en la base de datos - TRAER TODOS LOS CAMPOS
        console.log(`Buscando documento ${numeroDocumentoNormalizado} en BD...`);
        const { data: exactRecords, error: exactError } = await supabase
            .from('registros_formulario')
            .select('*') // Traer TODOS los campos
            .eq('numero_documento', numeroDocumentoNormalizado)
            .limit(20);

        if (exactError) {
            console.error("Error al verificar documento (exact):", exactError);
            return res.status(500).json({ 
                error: "Error al verificar los datos" 
            });
        }

        let existingRecord = pickMatchingRecord(
            exactRecords,
            numeroDocumentoNormalizado,
            tipoDocumentoNormalizado
        );

        if (!existingRecord) {
            const pattern = buildLooseLikePattern(numeroDocumentoNormalizado);
            const { data: fuzzyRecords, error: fuzzyError } = await supabase
                .from('registros_formulario')
                .select('*')
                .ilike('numero_documento', pattern)
                .limit(100);

            if (fuzzyError) {
                console.error("Error al verificar documento (fuzzy):", fuzzyError);
                return res.status(500).json({ 
                    error: "Error al verificar los datos" 
                });
            }

            existingRecord = pickMatchingRecord(
                fuzzyRecords,
                numeroDocumentoNormalizado,
                tipoDocumentoNormalizado
            );
        }
        
        console.log(`Resultado búsqueda: ${existingRecord ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);
        if (existingRecord) {
            console.log(`✅ Documento encontrado: ${existingRecord.nombre} - Cargando TODOS los datos`);
        }

        const response = {
            exists: !!existingRecord,
            data: existingRecord || null // Devolver TODOS los campos del registro
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
