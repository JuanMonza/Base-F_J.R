// API ENDPOINT PARA CONSULTAR DATOS CON VERIFIK
export default async function consultarDatos(req, res) {
    console.log('=== CONSULTA VERIFIK ===');
    
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

        // Validar token de Verifik
        const verifik_token = process.env.VERIFIK_TOKEN;
        if (!verifik_token) {
            console.error('Token de Verifik no configurado');
            return res.status(500).json({ 
                error: 'Servicio de consulta no disponible' 
            });
        }

        console.log(`Consultando: ${tipo_documento} ${numero_documento}`);

        // Llamada a la API de Verifik - Endpoint específico para Colombia
        const verifik_response = await fetch('https://api.verifik.co/v2/co/cedula', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${verifik_token}`
            },
            body: JSON.stringify({
                DocumentType: tipo_documento, // Estructura exacta de Verifik
                DocumentNumber: numero_documento
            })
        });

        const verifik_data = await verifik_response.json();

        if (!verifik_response.ok) {
            console.error('Error Verifik:', verifik_data);
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

        console.log('Datos procesados para:', numero_documento);
        
        return res.status(200).json({
            success: true,
            data: extracted_data,
            message: 'Datos encontrados correctamente',
            source: 'Verifik.co - Registros Oficiales Colombia'
        });

    } catch (error) {
        console.error('Error en consulta Verifik:', error.message);
        return res.status(500).json({ 
            error: 'Error interno del servidor al consultar datos',
            details: error.message 
        });
    }
}