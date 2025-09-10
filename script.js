// Se espera a que todo el contenido del HTML esté cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DEL DOM ---
    const showBtn = document.getElementById("showFormBtn");
    const form = document.getElementById("form");
    const msg = document.getElementById("msg");
    const giveawayPopup = document.getElementById("giveaway-popup");
    const closePopupBtn = document.getElementById("close-popup-btn");

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
        form.classList.remove("hidden");
        showBtn.classList.add("hidden");
    });

    // --- EVENTO PARA MANEJAR EL ENVÍO DEL FORMULARIO ---
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        msg.textContent = "Enviando...";
        const data = new FormData(form);

        try {
            // ¡IMPORTANTE! Debes reemplazar "https://TU_BACKEND/api/submit" por la URL real de tu servidor.
            const res = await fetch("https://TU_BACKEND/api/submit", {
                method: "POST",
                body: data
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