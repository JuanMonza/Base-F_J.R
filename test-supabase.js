// =====================================
// TESTE DE CONEXIÓN A SUPABASE
// =====================================
import { createClient } from '@supabase/supabase-js';

// Variables de entorno (Vercel automáticamente las carga desde .vercel/.env.development.local)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

console.log('🔍 Verificando variables de entorno...');
console.log('SUPABASE_URL:', SUPABASE_URL ? '✅ Configurada' : '❌ No encontrada');
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No encontrada');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Variables de entorno de Supabase no encontradas.');
    console.log('\n📋 Variables necesarias:');
    console.log('   SUPABASE_URL=tu_url_de_supabase');
    console.log('   SUPABASE_ANON_KEY=tu_clave_anonima');
    process.exit(1);
}

// Crear cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('✅ Cliente de Supabase creado');

// Datos de prueba
const datosTest = {
    nombre: 'MARIA RODRIGUEZ TEST',
    tipo_documento: 'CC',
    numero_documento: 'TEST' + Date.now(),
    fecha_nacimiento: '1985-06-15',
    departamento: 'Antioquia',
    ciudad: 'Medellín',
    direccion: 'Calle de Prueba 123',
    telefono_principal: '3001234567',
    telefono_familiar: '3001234568',
    tiene_correo: 'si',
    correo: 'maria.test@ejemplo.com',
    estado_civil: 'Soltero',
    ocupacion: 'Empleado',
    recibe_pension: 'no',
    fondo_pension: 'Ninguno',
    familia_extranjero: 'no',
    mascota: 'si',
    privacidad: true
};

async function probarBaseDatos() {
    try {
        console.log('\n🧪 Iniciando prueba de base de datos...');
        
        // 1. Verificar conexión
        console.log('1️⃣ Probando conexión...');
        const { data: tablas, error: errorTablas } = await supabase
            .from('registros_formulario')
            .select('id')
            .limit(1);
            
        if (errorTablas) {
            console.error('❌ Error al conectar:', errorTablas.message);
            console.log('💡 Verifica que:');
            console.log('   - La tabla "registros_formulario" existe en Supabase');
            console.log('   - Las Row Level Security (RLS) permiten INSERT');
            return;
        }
        
        console.log('✅ Conexión exitosa a la tabla registros_formulario');
        
        // 2. Insertar registro de prueba
        console.log('\n2️⃣ Insertando registro de prueba...');
        console.log('Datos:', JSON.stringify(datosTest, null, 2));
        
        const { data: resultado, error: errorInsertar } = await supabase
            .from('registros_formulario')
            .insert([datosTest])
            .select()
            .single();
            
        if (errorInsertar) {
            console.error('❌ Error al insertar:', errorInsertar.message);
            console.log('💡 Error details:', errorInsertar);
            
            if (errorInsertar.code === '42501') {
                console.log('❗ Error de permisos: Revisa las políticas RLS en Supabase');
            } else if (errorInsertar.code === '23505') {
                console.log('❗ Registro duplicado: Este documento ya existe');
            }
            return;
        }
        
        console.log('✅ Registro insertado exitosamente!');
        console.log('📄 Resultado:', JSON.stringify(resultado, null, 2));
        
        // 3. Verificar que se insertó
        console.log('\n3️⃣ Verificando el registro insertado...');
        const { data: verificacion, error: errorVerificar } = await supabase
            .from('registros_formulario')
            .select('*')
            .eq('numero_documento', datosTest.numero_documento)
            .single();
            
        if (errorVerificar) {
            console.error('❌ Error al verificar:', errorVerificar.message);
            return;
        }
        
        console.log('✅ Registro verificado en la base de datos!');
        console.log('📄 Datos guardados:', {
            id: verificacion.id,
            nombre: verificacion.nombre,
            numero_documento: verificacion.numero_documento,
            created_at: verificacion.created_at
        });
        
        console.log('\n🎉 ¡TODAS LAS PRUEBAS EXITOSAS!');
        console.log('✅ Tu base de datos Supabase está funcionando correctamente');
        console.log('✅ Los registros se están guardando');
        console.log('✅ La conexión desde código está funcionando');
        
    } catch (error) {
        console.error('💥 Error inesperado:', error.message);
        console.error('🔍 Detalles:', error);
    }
}

// Ejecutar la prueba
probarBaseDatos();