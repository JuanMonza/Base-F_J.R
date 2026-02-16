// API ENDPOINT PARA CONSULTAR DATOS CON VERIFIK
// Caché en memoria para evitar consultas duplicadas (TTL: 1 hora)
const consultasCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hora
const MAX_CONSULTAS_POR_MINUTO = 10;
const consultasRecientes = new Map();

function limpiarCacheExpirado() {
    const ahora = Date.now();
    for (const [key, value] of consultasCache.entries()) {
        if (ahora - value.timestamp > CACHE_TTL) {
            consultasCache.delete(key);
        }
    }
}

function verificarRateLimit(documento) {
    const ahora = Date.now();
    const ventana = 60 * 1000; // 1 minuto
    
    if (!consultasRecientes.has(documento)) {
        consultasRecientes.set(documento, []);
    }
    
    const consultas = consultasRecientes.get(documento).filter(
        timestamp => ahora - timestamp < ventana
    );
    
    consultasRecientes.set(documento, consultas);
    
    if (consultas.length >= MAX_CONSULTAS_POR_MINUTO) {
        return false;
    }
    
    consultas.push(ahora);
    return true;
}

export default async function consultarDatos(req, res) {
    console.log('=== CONSULTA VERIFIK ===');
    
    // Limpiar caché expirado periódicamente
    limpiarCacheExpirado();
    
    // CORS headers
    const allowedOrigins = [
        'https://actualizaciondedatos.jardinesdelrenacer.co',
        'https://base-f-j-r.vercel.app',
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
    ].filter(Boolean);

    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { numero_documento, tipo_documento } = req.body;
        
        if (!numero_documento || !tipo_documento) {
            return res.status(400).json({ 
                error: 'Número de documento y tipo son requeridos' 
            });
        }

        // Crear clave de caché
        const cacheKey = `${tipo_documento}-${numero_documento}`;
        
        // Verificar si existe en caché
        if (consultasCache.has(cacheKey)) {
            const cached = consultasCache.get(cacheKey);
            console.log(`✅ Cache hit para: ${numero_documento}`);
            return res.status(200).json({
                ...cached.data,
                fromCache: true
            });
        }

        // Rate limiting por documento
        if (!verificarRateLimit(numero_documento)) {
            console.log(`🚫 Rate limit excedido para: ${numero_documento}`);
            return res.status(429).json({ 
                error: 'Demasiadas consultas',
                details: 'Por favor espera un momento antes de consultar nuevamente',
                retryAfter: 60
            });
        }

        // Validar token de Verifik
        const verifik_token = process.env.VERIFIK_TOKEN;
        if (!verifik_token) {
            console.error('Token de Verifik no configurado');
            return res.status(500).json({ 
                error: 'Servicio de consulta no disponible' 
            });
        }

        console.log(`Consultando Verifik: ${tipo_documento} ${numero_documento}`);

        // Llamada a la API de Verifik - Endpoint específico para Colombia
        const verifik_response = await fetch('https://api.verifik.co/v2/co/cedula', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${verifik_token}`
            },
            body: JSON.stringify({
                DocumentType: tipo_documento,
                DocumentNumber: numero_documento
            })
        });

        // Manejar respuesta de Verifik
        let verifik_data;
        try {
            verifik_data = await verifik_response.json();
        } catch (parseError) {
            console.error('Error al parsear respuesta de Verifik:', parseError);
            
            // Si Verifik devuelve 429, manejar específicamente
            if (verifik_response.status === 429) {
                return res.status(429).json({ 
                    error: 'Servicio temporalmente ocupado',
                    details: 'El servicio de consulta está procesando muchas solicitudes. Por favor intenta en unos minutos.',
                    retryAfter: 300
                });
            }
            
            return res.status(500).json({ 
                error: 'Error al procesar respuesta del servicio',
                details: 'No se pudo obtener la información en este momento'
            });
        }

        if (!verifik_response.ok) {
            console.error('Error Verifik:', verifik_response.status, verifik_data);
            
            // Manejar específicamente error 429
            if (verifik_response.status === 429) {
                return res.status(429).json({ 
                    error: 'Límite de consultas alcanzado',
                    details: 'Se ha alcanzado el límite de consultas. Por favor intenta más tarde o completa el formulario manualmente.',
                    retryAfter: 300
                });
            }
            
            return res.status(400).json({ 
                error: 'No se pudo consultar la información',
                details: verifik_data.message || 'Documento no encontrado en registros oficiales'
            });
        }

        console.log('Respuesta Verifik exitosa:', verifik_data);

        // Extraer datos según la estructura real de Verifik Colombia
        if (!verifik_data.data) {
            return res.status(404).json({ 
                error: 'Documento no encontrado',
                details: 'No hay información disponible para este documento'
            });
        }

        const extracted_data = {
            nombre: verifik_data.data.fullName || '',
            nombres: verifik_data.data.firstName || '',
            apellidos: verifik_data.data.lastName || '',
            numero_documento: verifik_data.data.documentNumber || numero_documento,
            tipo_documento: verifik_data.data.documentType || tipo_documento,
            // La fecha de nacimiento no está en la respuesta de ejemplo, pero la dejamos por si acaso
            fecha_nacimiento: verifik_data.data.birthDate || verifik_data.data.birth_date || '',
            // Información adicional del API
            array_nombres: verifik_data.data.arrayName || [],
            verifik_id: verifik_data.id || '',
            verificado_en: verifik_data.signature?.dateTime || '',
            certificado_por: verifik_data.signature?.message || 'Verifik.co'
        };

        // Preparar respuesta
        const response_data = {
            success: true,
            data: extracted_data,
            message: 'Datos encontrados correctamente',
            source: 'Verifik.co - Registros Oficiales Colombia'
        };

        // Guardar en caché
        consultasCache.set(cacheKey, {
            data: response_data,
            timestamp: Date.now()
        });

        console.log(`✅ Datos guardados en caché para: ${numero_documento}`);
        
        return res.status(200).json(response_data);

    } catch (error) {
        console.error('Error en consulta Verifik:', error.message);
        return res.status(500).json({ 
            error: 'Error interno del servidor al consultar datos',
            details: error.message 
        });
    }
}