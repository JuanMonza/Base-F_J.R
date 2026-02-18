import { createClient } from '@supabase/supabase-js';

// Cache para rate limiting en memoria (en producción usarías Redis)
const submissions = new Map();

// Configuración de seguridad
const SECURITY_CONFIG = {
    MAX_SUBMISSIONS_PER_IP: 500,       // Máximo 500 envíos por IP por hora
    MAX_SUBMISSIONS_PER_DOC: 5,      // Máximo 5 envíos por documento por día (TEMPORAL PARA TESTING)
    TIME_WINDOW: 60 * 60 * 1000,     // 1 hora en milisegundos
    DOC_TIME_WINDOW: 24 * 60 * 60 * 1000, // 24 horas
    MAX_PAYLOAD_SIZE: 10240,          // 10KB máximo
    HONEYPOT_FIELD: 'website',        // Campo trampa para bots
    MIN_FORM_TIME: 3000,             // Mínimo 3 segundos para llenar el form (TEMPORAL PARA TESTING)
    MAX_FORM_TIME: 30 * 60 * 1000     // Máximo 30 minutos
};

function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.headers['x-real-ip'] || 
           req.connection?.remoteAddress || 
           'unknown';
}

function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function isValidPhone(phone) {
    const phonePattern = /^[0-9]{10}$/;
    return phonePattern.test(phone);
}

function validateDocumentNumber(type, number) {
    if (!number || !type) return false;
    
    switch (type) {
        case 'CC':
            return /^[0-9]{5,15}$/.test(number);
        case 'CE':
        case 'PEP':
            return /^[0-9]{5,20}$/.test(number);
        default:
            return false;
    }
}

// Funciones de validación adicionales (más permisivas)
function isValidString(str) {
    if (!str || typeof str !== 'string') return true; // Permitir strings vacíos
    const trimmed = str.trim();
    if (trimmed.length === 0) return true; // Permitir strings vacíos después del trim
    // Permitir letras, números, espacios, acentos y caracteres especiales comunes
    return /^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s\-\.,'#@()\[\]&+:;]{1,200}$/.test(trimmed);
}

function isValidDocument(doc) {
    if (!doc || typeof doc !== 'string') return false;
    const trimmed = doc.trim();
    // Permitir números y algunos caracteres especiales, longitud entre 3 y 25 caracteres
    return /^[0-9\-\.]{3,25}$/.test(trimmed);
}

// Funciones de sanitización (más robustas)
function sanitizeString(str) {
    if (!str) return null; // Manejar null, undefined, ""
    if (typeof str !== 'string') return String(str).slice(0, 200); // Convertir a string
    
    const cleaned = str
        .trim()
        .replace(/<[^>]*>/g, '') // Remover HTML tags
        .replace(/[<>\"'&]/g, '') // Remover caracteres peligrosos
        .slice(0, 200); // Limitar longitud
        
    return cleaned || null; // Retornar null si queda vacío
}

function sanitizeEmail(email) {
    if (!email) return null;
    if (typeof email !== 'string') return null;
    
    const sanitized = email.trim().toLowerCase().slice(0, 100);
    return (sanitized && isValidEmail(sanitized)) ? sanitized : null;
}

export default async function handler(req, res) {
    const startTime = Date.now();
    const clientIP = getClientIP(req);
    
    // Log de seguridad
    console.log(`🔒 Solicitud desde IP: ${clientIP}, Method: ${req.method}, User-Agent: ${req.headers['user-agent']?.substring(0, 50)} - REPO PÚBLICO ✅`);
    
    // Obtener variables de entorno de Supabase
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Validar que las variables de entorno estén disponibles
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Error de configuración de Supabase:', {
            supabaseUrl: !!supabaseUrl,
            supabaseKey: !!supabaseKey,
            env_SUPABASE_URL: !!process.env.SUPABASE_URL,
            env_SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY
        });
        return res.status(500).json({ 
            message: "Error de configuración del servidor" 
        });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Configurar CORS restrictivo (solo tu dominio)
    const allowedOrigins = [
        'https://base-f-j-kevce1d4a-jardines-renacer-s-projects.vercel.app',
        'https://actualizaciondedatos.jardinesdelrenacer.co', // Tu dominio personalizado
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
        console.log(`❌ Método no permitido: ${req.method} desde ${clientIP}`);
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    // PROTECCIÓN 1: Rate Limiting por IP
    const ipKey = `ip_${clientIP}`;
    const now = Date.now();
    const ipSubmissions = submissions.get(ipKey) || [];
    
    // Limpiar submissions antiguos
    const recentSubmissions = ipSubmissions.filter(time => now - time < SECURITY_CONFIG.TIME_WINDOW);
    
    if (recentSubmissions.length >= SECURITY_CONFIG.MAX_SUBMISSIONS_PER_IP) {
        console.log(`🚫 Rate limit IP excedido: ${clientIP} (${recentSubmissions.length}/${SECURITY_CONFIG.MAX_SUBMISSIONS_PER_IP} en ${SECURITY_CONFIG.TIME_WINDOW/1000/60} min)`);
        return res.status(429).json({ 
            message: "Demasiadas solicitudes desde tu IP. Intenta de nuevo más tarde.",
            retryAfter: Math.ceil(SECURITY_CONFIG.TIME_WINDOW / 1000 / 60) + " minutos"
        });
    }
    
    // Registrar esta submission
    recentSubmissions.push(now);
    submissions.set(ipKey, recentSubmissions);

    try {
        const data = req.body; // En Vercel, el body ya viene parseado

        console.log(`✅ Formulario recibido desde ${clientIP}`);

        // PROTECCIÓN 2: Validar tamaño del payload
        const payloadSize = JSON.stringify(data).length;
        if (payloadSize > SECURITY_CONFIG.MAX_PAYLOAD_SIZE) {
            console.log(`🚫 Payload demasiado grande: ${payloadSize} bytes desde ${clientIP}`);
            return res.status(413).json({ message: "Datos demasiado grandes" });
        }

        // Validar que los datos necesarios estén presentes
        if (!data || typeof data !== 'object') {
            return res.status(400).json({ message: "Datos inválidos" });
        }

        // PROTECCIÓN 3: Detectar campos honeypot (campos trampa para bots)
        if (data.honeypot || data.website || data.url) {
            console.log(`🍯 Honeypot detectado desde ${clientIP}`);
            return res.status(400).json({ message: "Solicitud inválida" });
        }

        // PROTECCIÓN 4: Validación básica de formato
        if (!isValidString(data.nombre) && data.nombre) {
            console.log(`🚫 Nombre inválido desde ${clientIP}`);
            return res.status(400).json({ message: "Formato de nombre inválido" });
        }
        
        if (!isValidDocument(data.numero_documento) && data.numero_documento) {
            console.log(`🚫 Documento inválido desde ${clientIP}`);
            return res.status(400).json({ message: "Formato de documento inválido" });
        }

        // PROTECCIÓN 5: Rate limiting por documento (configurable para testing)
        if (data.numero_documento) {
            const docKey = `doc_${data.numero_documento}`;
            const docSubmissions = submissions.get(docKey) || [];
            const recentDocSubmissions = docSubmissions.filter(time => now - time < SECURITY_CONFIG.DOC_TIME_WINDOW);
            
            if (recentDocSubmissions.length >= SECURITY_CONFIG.MAX_SUBMISSIONS_PER_DOC) {
                console.log(`🚫 Límite de documento excedido: ${data.numero_documento} (${recentDocSubmissions.length}/${SECURITY_CONFIG.MAX_SUBMISSIONS_PER_DOC}) desde ${clientIP}`);
                return res.status(429).json({ 
                    message: `Este documento ya alcanzó el límite de registros (${SECURITY_CONFIG.MAX_SUBMISSIONS_PER_DOC} por día). Intenta mañana.`,
                    retryAfter: "24 horas"
                });
            }
            
            recentDocSubmissions.push(now);
            submissions.set(docKey, recentDocSubmissions);
            console.log(`✅ Documento registrado: ${data.numero_documento} (${recentDocSubmissions.length}/${SECURITY_CONFIG.MAX_SUBMISSIONS_PER_DOC})`);
        }

        // PROTECCIÓN 6: Sanitizar todos los datos antes de insertar
        const dataToInsert = {
            nombre: sanitizeString(data.nombre),
            tipo_documento: sanitizeString(data.tipo_documento),
            numero_documento: sanitizeString(data.numero_documento),
            fecha_nacimiento: sanitizeString(data.fecha_nacimiento),
            departamento: sanitizeString(data.departamento),
            ciudad: sanitizeString(data.ciudad),
            direccion: sanitizeString(data.direccion),
            telefono_principal: sanitizeString(data.telefono_principal),
            telefono_familiar: sanitizeString(data.telefono_familiar),
            tiene_correo: sanitizeString(data.tiene_correo), // TEXT en BD
            correo: sanitizeEmail(data.correo),
            estado_civil: sanitizeString(data.estado_civil),
            ocupacion: sanitizeString(data.ocupacion),
            recibe_pension: sanitizeString(data.recibe_pension), // TEXT en BD
            fondo_pension: sanitizeString(data.fondo_pension),
            familia_extranjero: sanitizeString(data.familia_extranjero), // TEXT en BD
            mascota: sanitizeString(data.mascota), // TEXT en BD
            privacidad: data.privacidad === 'true' || data.privacidad === true // BOOLEAN en BD
        };

        // --- Primero verificar si el documento ya existe en la base de datos ---
        console.log(`Verificando si documento ${dataToInsert.numero_documento} ya existe...`);
        const { data: existingRecords, error: checkError } = await supabase
            .from('registros_formulario')
            .select('id, numero_documento, created_at')
            .eq('numero_documento', dataToInsert.numero_documento);

        if (checkError) { 
            console.error("Error al verificar documento existente:", checkError);
            return res.status(500).json({ 
                message: "Error al verificar los datos.",
                error: checkError.message 
            });
        }

        const existingRecord = existingRecords && existingRecords.length > 0 ? existingRecords[0] : null;

        // Si el documento YA EXISTE, hacemos UPDATE en lugar de INSERT
        if (existingRecord) {
            console.log(`¡DOCUMENTO DETECTADO! ${dataToInsert.numero_documento} ya existe (ID: ${existingRecord.id}). Actualizando...`);
            
            const { data: updatedData, error: updateError } = await supabase
                .from('registros_formulario')
                .update(dataToInsert)
                .eq('numero_documento', dataToInsert.numero_documento);

            if (updateError) {
                console.error("Error al actualizar en Supabase:", updateError);
                return res.status(500).json({ 
                    message: "Error al actualizar los datos.",
                    error: updateError.message 
                });
            }

            console.log(`Datos actualizados exitosamente para documento: ${dataToInsert.numero_documento}`);
            return res.status(200).json({ 
                message: "¡Tus datos ya estaban registrados y han sido actualizados exitosamente!",
                action: "updated"
            });
        }

        // Si NO EXISTE, hacemos INSERT (nuevo registro)
        console.log(`Nuevo documento ${dataToInsert.numero_documento}. Insertando...`);
        
        const { data: insertedData, error: insertError } = await supabase
            .from('registros_formulario')
            .insert([dataToInsert]);

        if (insertError) {
            console.error("Error al insertar en Supabase:", insertError);
            return res.status(500).json({ 
                message: "Error al guardar los datos en la base de datos.",
                error: insertError.message 
            });
        }

        console.log(`Nuevo registro creado exitosamente para documento: ${dataToInsert.numero_documento}`);
        return res.status(200).json({ 
            message: "¡Datos registrados correctamente! Gracias por actualizar tu información.",
            action: "created"
        });

    } catch (error) {
        console.error("Error general al procesar el formulario:", error);
        return res.status(500).json({ 
            message: "Error interno del servidor.",
            error: error.message 
        });
    }
};