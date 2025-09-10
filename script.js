// Se espera a que todo el contenido del HTML esté cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded. Script is running.');

    // --- INICIALIZACIÓN DE GRANIM.JS PARA EL FOOTER ---
    new Granim({
        element: '#granim-canvas',
        direction: 'left-right',
        states : {
            "default-state": {
                gradients: [
                    ['#2C3E50', '#3498DB'],
                    ['#3498DB', '#8E44AD'],
                    ['#8E44AD', '#2C3E50']
                ],
                transitionSpeed: 5000
            }
        }
    });

    // --- ELEMENTOS DEL DOM ---
    const showBtn = document.getElementById("showFormBtn");
    const form = document.getElementById("form");
    const msg = document.getElementById("msg");
    const giveawayPopup = document.getElementById("giveaway-popup");
    const closePopupBtn = document.getElementById("close-popup-btn");

    console.log('showBtn:', showBtn);
    console.log('form:', form);

    // --- LÓGICA DE DEPARTAMENTOS Y CIUDADES ---
    const colombianLocations = {
        "Antioquia": ["Medellín", "Envigado", "Itagüí"],
        "Cundinamarca": ["Bogotá", "Chía", "Soacha"],
        "Valle del Cauca": ["Cali", "Palmira", "Buga"],
        "Atlántico": ["Barranquilla", "Soledad", "Malambo"]
    };

    const departamentoSelect = document.getElementById('departamento');
    const ciudadSelect = document.getElementById('ciudad');

    function populateDepartamentos() {
        for (const departamento in colombianLocations) {
            const option = document.createElement('option');
            option.value = departamento;
            option.textContent = departamento;
            departamentoSelect.appendChild(option);
        }
    }

    function populateCiudades(selectedDepartamento) {
        ciudadSelect.innerHTML = '<option value="">Seleccione Ciudad...</option>';
        if (selectedDepartamento && colombianLocations[selectedDepartamento]) {
            colombianLocations[selectedDepartamento].forEach(ciudad => {
                const option = document.createElement('option');
                option.value = ciudad;
                option.textContent = ciudad;
                ciudadSelect.appendChild(option);
            });
        }
    }

    departamentoSelect.addEventListener('change', (event) => {
        populateCiudades(event.target.value);
    });

    populateDepartamentos();

    // --- LÓGICA DE VALIDACIÓN DE DOCUMENTO ---
    const tipoDocumentoSelect = document.getElementById('tipo_documento');
    const numeroDocumentoInput = document.getElementById('numero_documento');

    function applyDocumentValidation() {
        console.log('applyDocumentValidation called.'); // Added log
        console.log('tipoDocumentoSelect (inside applyDocumentValidation):', tipoDocumentoSelect); // Added log
        console.log('numeroDocumentoInput (inside applyDocumentValidation):', numeroDocumentoInput); // Added log

        const selectedType = tipoDocumentoSelect.value;
        numeroDocumentoInput.value = '';
        numeroDocumentoInput.placeholder = '';

        switch (selectedType) {
            case 'CC':
                numeroDocumentoInput.setAttribute('pattern', '[0-9]{5,15}');
                numeroDocumentoInput.setAttribute('title', 'Solo números (5 a 15 dígitos)');
                numeroDocumentoInput.placeholder = 'Ej: 123456789';
                numeroDocumentoInput.type = 'text';
                break;
            case 'PA':
                numeroDocumentoInput.setAttribute('pattern', '[A-Za-z0-9]{6,20}');
                numeroDocumentoInput.setAttribute('title', 'Letras y números (6 a 20 caracteres)');
                numeroDocumentoInput.placeholder = 'Ej: ABC123456';
                numeroDocumentoInput.type = 'text';
                break;
            case 'TI':
            case 'CE':
                numeroDocumentoInput.setAttribute('pattern', '[A-Za-z0-9]{5,20}');
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
    let viewCount = parseInt(localStorage.getItem('popupViewCount')) || 0;

    if (viewCount < 2) {
        setTimeout(() => {
            giveawayPopup.classList.remove('hidden');
            localStorage.setItem('popupViewCount', viewCount + 1);
        }, 3000);
    }

    closePopupBtn.addEventListener("click", () => {
        giveawayPopup.classList.add("hidden");
    });


    // --- INICIALIZACIÓN DE FLATPCIKR ---
    flatpickr('input[type="date"]', {
        "locale": "es",
        dateFormat: "Y-m-d",
    });

    // --- EVENTO PARA MOSTRAR EL FORMULARIO ---
    showBtn.addEventListener("click", () => {
        console.log('Show Form Button clicked!');
        form.classList.remove("hidden");
        showBtn.classList.add("hidden");

        // Call validation logic here, after the form is visible
        applyDocumentValidation();
        tipoDocumentoSelect.addEventListener('change', applyDocumentValidation);
    });

    // --- EVENTO PARA MANEJAR EL ENVÍO DEL FORMULARIO ---
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        msg.textContent = "Enviando...";
        
        const formData = new FormData(form);
        const jsonData = {};
        formData.forEach((value, key) => {
            jsonData[key] = value;
        });

        try {
            const res = await fetch("/.netlify/functions/submit-form", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(jsonData)
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