import { createClient } from '@supabase/supabase-js';

// Cache para rate limiting en memoria (en producción usarías Redis)
const submissions = new Map();

// Configuración de seguridad
const SECURITY_CONFIG = {
    MAX_SUBMISSIONS_PER_IP: 500,       // Máximo 500 envíos por IP por hora
    MAX_SUBMISSIONS_PER_DOC: 50,      // Máximo 50 envíos por documento por día (TEMPORAL PARA TESTING)
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

function pickMatchingRecord(records, numeroDocumentoNormalizado) {
    if (!Array.isArray(records) || records.length === 0) return null;

    const matches = records.filter((row) => {
        const rowDoc = normalizeDocumentNumber(row.numero_documento || '');
        return rowDoc === numeroDocumentoNormalizado;
    });

    if (matches.length === 0) return null;

    matches.sort((a, b) => {
        const aTime = new Date(a.created_at || 0).getTime();
        const bTime = new Date(b.created_at || 0).getTime();
        if (aTime !== bTime) return bTime - aTime;
        return (b.id || 0) - (a.id || 0);
    });

    return matches[0];
}

function normalizeComparableValue(value) {
    if (value === undefined) return null;
    if (typeof value === 'string') return value.trim();
    return value;
}

function hasRecordChanges(currentRecord, nextValues) {
    if (!currentRecord || !nextValues) return false;

    return Object.keys(nextValues).some((key) => {
        const currentValue = normalizeComparableValue(currentRecord[key]);
        const nextValue = normalizeComparableValue(nextValues[key]);
        return currentValue !== nextValue;
    });
}

export default async function handler(req, res) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const data = req.body;

        console.log('📥 Datos recibidos del formulario:', JSON.stringify(data, null, 2));

        // Mapear SOLO los campos que existen en la tabla registros_formulario
        // Esto evita que campos extra del formulario rompan el INSERT de Supabase
        const dataToInsert = {
            nombre:            data.nombre            || null,
            tipo_documento:    data.tipo_documento    || null,
            numero_documento:  data.numero_documento  || null,
            fecha_nacimiento:  data.fecha_nacimiento  || null,
            departamento:      data.departamento      || null,
            ciudad:            data.ciudad            || null,
            direccion:         data.direccion         || null,
            telefono_principal:data.telefono_principal|| null,
            telefono_familiar: data.telefono_familiar || null,
            tiene_correo:      data.tiene_correo      || null,
            correo:            data.correo            || null,
            estado_civil:      data.estado_civil      || null,
            ocupacion:         data.ocupacion         || null,
            recibe_pension:    data.recibe_pension     || null,
            fondo_pension:     data.fondo_pension      || null,
            familia_extranjero:data.familia_extranjero|| null,
            mascota:           data.mascota           || null,
            privacidad:        data.privacidad === true || data.privacidad === 'true',
        };

        console.log('📤 Datos a insertar en Supabase:', JSON.stringify(dataToInsert, null, 2));

        const { error: insertError } = await supabase
            .from('registros_formulario')
            .insert([dataToInsert]);

        if (insertError) {
            console.error('❌ Error de Supabase:', insertError);
            return res.status(500).json({ 
                message: `Error al guardar: ${insertError.message}${insertError.details ? ' — ' + insertError.details : ''}`,
                error: insertError.message,
                details: insertError.details,
                hint: insertError.hint
            });
        }

        return res.status(200).json({ 
            message: "¡Datos registrados correctamente! Gracias por actualizar tu información.",
            action: "created"
        });

    } catch (error) {
        console.error("❌ Error general al procesar el formulario:", error);
        return res.status(500).json({ 
            message: `Error interno del servidor: ${error.message}`,
            error: error.message 
        });
    }
};
