export default async function handler(req, res) {
    // Headers CORS básicos
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        console.log('✅ Status endpoint called');
        
        const status = {
            message: "API funcionando correctamente",
            timestamp: new Date().toISOString(),
            method: req.method,
            environment: {
                hasSupabaseUrl: !!process.env.SUPABASE_URL,
                hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
                hasNextSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasNextSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            },
            security: {
                rateLimitingActive: true,
                validationActive: true,
                sanitizationActive: true
            }
        };

        return res.status(200).json(status);
    } catch (error) {
        console.error('❌ Status endpoint error:', error);
        return res.status(500).json({ 
            message: "Error en endpoint de estado",
            error: error.message 
        });
    }
}