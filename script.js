// Se espera a que todo el contenido del HTML esté cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {

    // --- INICIALIZACIÓN DE GRANIM.JS PARA EL FOOTER ---
    // Crea una nueva instancia de Granim para animar el fondo del footer.
    new Granim({
        element: '#granim-canvas', // ID del elemento canvas en el HTML.
        direction: 'left-right',   // Dirección de la animación del degradado.
        states : {
            "default-state": {
                gradients: [
                    ['#2C3E50', '#3498DB'], // Degradado 1: Azul oscuro a Azul claro
                    ['#3498DB', '#8E44AD'], // Degradado 2: Azul claro a Morado
                    ['#8E44AD', '#2C3E50']  // Degradado 3: Morado a Azul oscuro
                ],
                transitionSpeed: 5000 // Velocidad de transición entre degradados (5 segundos).
            }
        }
    });

    // --- ELEMENTOS DEL DOM ---
    const showBtn = document.getElementById("showFormBtn");
    const form = document.getElementById("form");
    const msg = document.getElementById("msg");
    const giveawayPopup = document.getElementById("giveaway-popup");
    const closePopupBtn = document.getElementById("close-popup-btn");

    console.log('showBtn:', showBtn); // Added log
    console.log('form:', form);       // Added log

    // --- LÓGICA DE DEPARTAMENTOS Y CIUDADES ---
    // Datos de ejemplo para departamentos y ciudades (puedes expandir esta lista).
    const colombianLocations = {
        "Antioquia": ["Medellín", "Envigado", "Itagüí"],
        "Cundinamarca": ["Bogotá", "Chía", "Soacha"],
        "Valle del Cauca": ["Cali", "Palmira", "Buga"],
        "Atlántico": ["Barranquilla", "Soledad", "Malambo"]
    };

    const departamentoSelect = document.getElementById('departamento');
    const ciudadSelect = document.getElementById('ciudad');

    // Función para poblar el selector de departamentos.
    function populateDepartamentos() {
        for (const departamento in colombianLocations) {
            const option = document.createElement('option');
            option.value = departamento;
            option.textContent = departamento;
            departamentoSelect.appendChild(option);
        }
    }

    // Función para poblar el selector de ciudades según el departamento seleccionado.
    function populateCiudades(selectedDepartamento) {
        ciudadSelect.innerHTML = '<option value="">Seleccione Ciudad...</option>'; // Limpiar y añadir opción por defecto
        if (selectedDepartamento && colombianLocations[selectedDepartamento]) {
            colombianLocations[selectedDepartamento].forEach(ciudad => {
                const option = document.createElement('option');
                option.value = ciudad;
                option.textContent = ciudad;
                ciudadSelect.appendChild(option);
            });
        }
    }

    // Evento para cuando cambia el departamento seleccionado.
    departamentoSelect.addEventListener('change', (event) => {
        populateCiudades(event.target.value);
    });

    // Poblar departamentos al cargar la página.
    populateDepartamentos();

    // --- LÓGICA DE VALIDACIÓN DE DOCUMENTO ---
    const tipoDocumentoSelect = document.getElementById('tipo_documento');
    const numeroDocumentoInput = document.getElementById('numero_documento');

    function applyDocumentValidation() {
        const selectedType = tipoDocumentoSelect.value;
        numeroDocumentoInput.value = ''; // Limpiar el campo al cambiar el tipo
        numeroDocumentoInput.placeholder = ''; // Limpiar placeholder

        switch (selectedType) {
            case 'CC':
                numeroDocumentoInput.setAttribute('pattern', '[0-9]{5,15}'); // 5 a 15 dígitos
                numeroDocumentoInput.setAttribute('title', 'Solo números (5 a 15 dígitos)');
                numeroDocumentoInput.placeholder = 'Ej: 123456789';
                numeroDocumentoInput.type = 'text'; // Mantener como texto para evitar problemas con ceros iniciales
                break;
            case 'PA':
                numeroDocumentoInput.setAttribute('pattern', '[A-Za-z0-9]{6,20}'); // Alfanumérico, 6 a 20 caracteres
                numeroDocumentoInput.setAttribute('title', 'Letras y números (6 a 20 caracteres)');
                numeroDocumentoInput.placeholder = 'Ej: ABC123456';
                numeroDocumentoInput.type = 'text';
                break;
            case 'TI': // Tarjeta de Identidad
            case 'CE': // Cédula de Extranjería
                numeroDocumentoInput.setAttribute('pattern', '[A-Za-z0-9]{5,20}'); // Alfanumérico, 5 a 20 caracteres
                numeroDocumentoInput.setAttribute('title', 'Letras y números (5 a 20 caracteres)');
                numeroDocumentoInput.placeholder = 'Ej: 1000123456 o ABC12345';
                numeroDocumentoInput.type = 'text';
                break;
            default:
                numeroDocumentoInput.removeAttribute('pattern');
                numeroDocumentoInput.removeAttribute('title');
                numeroDocumentoInput.placeholder = '';
                numeroDocumentoInput.type = 'text';
                break;
        }
    }

    // --- LÓGICA DEL POP-UP DEL SORTEO ---
    // 1. Revisar el contador de vistas desde la memoria del navegador.
    let viewCount = parseInt(localStorage.getItem('popupViewCount')) || 0;

    // 2. Si no ha aparecido 2 veces, mostrarlo después de un tiempo.
    if (viewCount < 2) {
        setTimeout(() => {
            // Se muestra el pop-up quitando la clase que lo oculta.
            giveawayPopup.classList.remove('hidden');
            
            // Se incrementa el contador y se guarda en la memoria del navegador.
            localStorage.setItem('popupViewCount', viewCount + 1);
        }, 3000); // El pop-up aparecerá después de 3 segundos (3000 milisegundos).
    }

    // 3. Lógica para cerrar el pop-up.
    closePopupBtn.addEventListener("click", () => {
        // Se oculta el pop-up añadiendo la clase "hidden".
        giveawayPopup.classList.add("hidden");
    });


    // --- INICIALIZACIÓN DE FLATPCIKR ---
    flatpickr('input[type="date"]', {
        "locale": "es",
        dateFormat: "Y-m-d",
    });

    // --- EVENTO PARA MOSTRAR EL FORMULARIO ---
    showBtn.addEventListener("click", () => {
        console.log('Show Form Button clicked!'); // Added log
        form.classList.remove("hidden");
        showBtn.classList.add("hidden");

        // Call validation logic here, after the form is visible
        applyDocumentValidation(); // Initial call
        tipoDocumentoSelect.addEventListener('change', applyDocumentValidation); // Event listener
    });

    // --- EVENTO PARA MANEJAR EL ENVÍO DEL FORMULARIO ---
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        msg.textContent = "Enviando...";
        
        // Convertir FormData a un objeto JSON
        const formData = new FormData(form);
        const jsonData = {};
        formData.forEach((value, key) => {
            jsonData[key] = value;
        });

        try {
            // Enviar los datos como JSON a la función serverless de Netlify
            const res = await fetch("/.netlify/functions/submit-form", { // URL de la función Netlify
                method: "POST",
                headers: {
                    "Content-Type": "application/json" // Indicar que estamos enviando JSON
                },
                body: JSON.stringify(jsonData) // Convertir el objeto JSON a string
            });

            if (res.ok) {
                msg.textContent = "✅ Datos enviados correctamente";
                msg.style.color = "green";
                form.reset();
            } else {
                msg.textContent = "❌ Error al enviar datos";
                msg.style.color = "red";
            }
        } catch (error) {
            console.error('Error en la conexión:', error);
            msg.textContent = "⚠️ Error de conexión";
            msg.style.color = "red";
        }
    });

});