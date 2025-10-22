import { createClient } from '@supabase/supabase-js';

// Cache para rate limiting en memoria (en producción usarías Redis)
const submissions = new Map();

// Configuración de seguridad
const SECURITY_CONFIG = {
    MAX_SUBMISSIONS_PER_IP: 5,        // Máximo 5 envíos por IP por hora
    MAX_SUBMISSIONS_PER_DOC: 1,      // Máximo 1 envío por documento por día
    TIME_WINDOW: 60 * 60 * 1000,     // 1 hora en milisegundos
    DOC_TIME_WINDOW: 24 * 60 * 60 * 1000, // 24 horas
    MAX_PAYLOAD_SIZE: 10240,          // 10KB máximo
    HONEYPOT_FIELD: 'website',        // Campo trampa para bots
    MIN_FORM_TIME: 10000,             // Mínimo 10 segundos para llenar el form
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

// Funciones de validación adicionales
function isValidString(str) {
    if (!str || typeof str !== 'string') return false;
    // Solo letras, espacios, acentos y algunos caracteres especiales
    return /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-\.,']{1,100}$/.test(str.trim());
}

function isValidDocument(doc) {
    if (!doc || typeof doc !== 'string') return false;
    // Solo números, longitud entre 5 y 20 caracteres
    return /^[0-9]{5,20}$/.test(doc.trim());
}

// Funciones de sanitización
function sanitizeString(str) {
    if (!str || typeof str !== 'string') return null;
    
    return str
        .trim()
        .replace(/<[^>]*>/g, '') // Remover HTML tags
        .replace(/[<>\"'&]/g, '') // Remover caracteres peligrosos
        .slice(0, 200); // Limitar longitud
}

function sanitizeEmail(email) {
    if (!email || typeof email !== 'string') return null;
    
    const sanitized = email.trim().toLowerCase().slice(0, 100);
    return isValidEmail(sanitized) ? sanitized : null;
}

export default async function handler(req, res) {
    const startTime = Date.now();
    const clientIP = getClientIP(req);
    
    // Log de seguridad
    console.log(`🔒 Solicitud desde IP: ${clientIP}, Method: ${req.method}, User-Agent: ${req.headers['user-agent']?.substring(0, 50)}`);
    
    // Obtener variables de entorno de Supabase
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Validar que las variables de entorno estén disponibles
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('❌ Error de configuración de Supabase');
        return res.status(500).json({ 
            message: "Error de configuración del servidor" 
        });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
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
        console.log(`🚫 Rate limit excedido para IP: ${clientIP}`);
        return res.status(429).json({ 
            message: "Demasiadas solicitudes. Intenta de nuevo más tarde.",
            retryAfter: Math.ceil(SECURITY_CONFIG.TIME_WINDOW / 1000 / 60) + " minutos"
        });
    }
    
    // Registrar esta submission
    recentSubmissions.push(now);
    submissions.set(ipKey, recentSubmissions);

    try {
        const data = req.body; // En Vercel, el body ya viene parseado

        console.log("Datos recibidos:", data);

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
        if (!isValidString(data.nombre) || !isValidDocument(data.numero_documento)) {
            console.log(`🚫 Datos con formato inválido desde ${clientIP}`);
            return res.status(400).json({ message: "Formato de datos inválido" });
        }

        // PROTECCIÓN 5: Rate limiting por documento (solo 1 por día por documento)
        if (data.numero_documento) {
            const docKey = `doc_${data.numero_documento}`;
            const docSubmissions = submissions.get(docKey) || [];
            const recentDocSubmissions = docSubmissions.filter(time => now - time < 24 * 60 * 60 * 1000); // 24 horas
            
            if (recentDocSubmissions.length >= 1) {
                console.log(`🚫 Documento ya registrado hoy: ${data.numero_documento} desde ${clientIP}`);
                return res.status(429).json({ 
                    message: "Este documento ya fue registrado hoy. Intenta mañana.",
                    retryAfter: "24 horas"
                });
            }
            
            recentDocSubmissions.push(now);
            submissions.set(docKey, recentDocSubmissions);
        }

        // PROTECCIÓN 6: Sanitizar todos los datos antes de insertar
        const dataToInsert = {
            nombre: sanitizeString(data.nombre),
            tipo_documento: sanitizeString(data.tipo_documento),
            numero_documento: sanitizeString(data.numero_documento),
            fecha_expedicion: sanitizeString(data.fecha_expedicion),
            fecha_nacimiento: sanitizeString(data.fecha_nacimiento),
            departamento: sanitizeString(data.departamento),
            ciudad: sanitizeString(data.ciudad),
            direccion: sanitizeString(data.direccion),
            telefono_principal: sanitizeString(data.telefono_principal),
            telefono_familiar: sanitizeString(data.telefono_familiar),
            tiene_correo: data.tiene_correo === 'true' || data.tiene_correo === true,
            correo: sanitizeEmail(data.correo),
            estado_civil: sanitizeString(data.estado_civil),
            ocupacion: sanitizeString(data.ocupacion),
            recibe_pension: data.recibe_pension === 'true' || data.recibe_pension === true,
            fondo_pension: sanitizeString(data.fondo_pension),
            familia_extranjero: data.familia_extranjero === 'true' || data.familia_extranjero === true,
            mascota: data.mascota === 'true' || data.mascota === true,
            privacidad: data.privacidad === 'true' || data.privacidad === true
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