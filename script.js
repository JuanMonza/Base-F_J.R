// Se espera a que todo el contenido del HTML esté cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded. Script is running.');

    // --- ELEMENTOS DEL DOM ---
    const showBtn = document.getElementById("showFormBtn");
    const form = document.getElementById("form");
    const msg = document.getElementById("msg");
    const giveawayPopup = document.getElementById("giveaway-popup");
    const closePopupBtn = document.getElementById("close-popup-btn");
    const successModal = document.getElementById("success-modal");
    const modalMessage = document.getElementById("modal-message");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const modalIcon = document.querySelector(".modal-icon");
    const modalIconI = document.getElementById("modal-icon-i");

    // --- LÓGICA PARA MOSTRAR EL FORMULARIO ---
    if (showBtn && form) {
        showBtn.addEventListener('click', () => {
            // Oculta el botón y muestra el formulario con la animación
            showBtn.style.display = 'none';
            form.classList.remove('hidden');
        });
    }

    // --- LÓGICA DE DEPARTAMENTOS Y CIUDADES ---
    const colombianLocations = {
        "Amazonas": ["Leticia", "Puerto Nariño"],
        "Antioquia": ["Abejorral", "Abriaquí", "Alejandría", "Amagá", "Amalfi", "Andes", "Angelópolis", "Angostura", "Anorí", "Anzá", "Apartadó", "Arboletes", "Argelia", "Armenia", "Barbosa", "Bello", "Belmira", "Betania", "Betulia", "Briceño", "Buriticá", "Cáceres", "Caicedo", "Caldas", "Campamento", "Cañasgordas", "Caracolí", "Caramanta", "Carepa", "Carolina del Príncipe", "Caucasia", "Chigorodó", "Cisneros", "Ciudad Bolívar", "Cocorná", "Concepción", "Concordia", "Copacabana", "Dabeiba", "Donmatías", "Ebéjico", "El Bagre", "El Carmen de Viboral", "El Peñol", "El Retiro", "El Santuario", "Entrerríos", "Envigado", "Fredonia", "Frontino", "Giraldo", "Girardota", "Gómez Plata", "Granada", "Guadalupe", "Guarne", "Guatapé", "Heliconia", "Hispania", "Itagüí", "Ituango", "Jardín", "Jericó", "La Ceja", "La Estrella", "La Pintada", "La Unión", "Liborina", "Maceo", "Marinilla", "Medellín", "Montebello", "Murindó", "Mutatá", "Nariño", "Nechí", "Necoclí", "Olaya", "Peque", "Pueblorrico", "Puerto Berrío", "Puerto Nare", "Puerto Triunfo", "Remedios", "Rionegro", "Sabanalarga", "Sabaneta", "Salgar", "San Andrés de Cuerquia", "San Carlos", "San Francisco", "San Jerónimo", "San José de la Montaña", "San Juan de Urabá", "San Luis", "San Pedro de Urabá", "San Pedro de los Milagros", "San Rafael", "San Roque", "San Vicente", "Santa Bárbara", "Santa Fe de Antioquia", "Santo Domingo", "Segovia", "Sonsón", "Sopetrán", "Támesis", "Tarazá", "Tarso", "Titiribí", "Toledo", "Turbo", "Uramita", "Urrao", "Valdivia", "Valparaíso", "Vegachí", "Venecia", "Vigía del Fuerte", "Yalí", "Yarumal", "Yolombó", "Yondó", "Zaragoza"],
        "Arauca": ["Arauca", "Arauquita", "Cravo Norte", "Fortul", "Puerto Rondón", "Saravena", "Tame"],
        "Atlántico": ["Baranoa", "Barranquilla", "Campo de la Cruz", "Candelaria", "Galapa", "Juan de Acosta", "Luruaco", "Malambo", "Manatí", "Palmar de Varela", "Piojó", "Polonuevo", "Ponedera", "Puerto Colombia", "Repelón", "Sabanagrande", "Sabanalarga", "Santa Lucía", "Santo Tomás", "Soledad", "Suán", "Tubará", "Usiacurí"],
        "Bolívar": ["Achí", "Altos del Rosario", "Arenal", "Arjona", "Arroyohondo", "Barranco de Loba", "Brazuelo de Papayal", "Calamar", "Cantagallo", "Cartagena de Indias", "Cicuco", "Clemencia", "Córdoba", "El Carmen de Bolívar", "El Guamo", "El Peñón", "Hatillo de Loba", "Magangué", "Mahates", "Margarita", "María la Baja", "Mompós", "Montecristo", "Morales", "Norosí", "Pinillos", "Regidor", "Rioviejo", "San Cristóbal", "San Estanislao", "San Fernando", "San Jacinto del Cauca", "San Jacinto", "San Juan Nepomoceno", "San Martín de Loba", "San Pablo", "Santa Catalina", "Santa Rosa", "Santa Rosa del Sur", "Simití", "Soplaviento", "Talaigua Nuevo", "Tiquisio", "Turbaco", "Turbaná", "Villanueva", "Zambrano"],
        "Boyacá": ["Almeida", "Aquitania", "Arcabuco", "Belén", "Berbeo", "Betéitiva", "Boavita", "Boyacá", "Briceño", "Buenavista", "Busbanzá", "Caldas", "Campohermoso", "Cerinza", "Chinavita", "Chiquinquirá", "Chíquiza", "Chiscas", "Chita", "Chitaraque", "Chivatá", "Chivor", "Ciénega", "Cómbita", "Coper", "Corrales", "Covarachía", "Cubar", "Cucaita", "Cuítiva", "Duitama", "El Cocuy", "El Espino", "Firavitoba", "Floresta", "Gachantivá", "Gámeza", "Garagoa", "Guacamayas", "Guateque", "Guayatá", "Güicán", "Iza", "Jenesano", "Jericó", "La Capilla", "La Uvita", "La Victoria", "Labranzagrande", "Macanal", "Maripí", "Miraflores", "Mongua", "Monguí", "Moniquirá", "Motavita", "Muzo", "Nobsa", "Nuevo Colón", "Oicatá", "Otanche", "Pachavita", "Páez", "Paipa", "Pajarito", "Panqueba", "Pauna", "Paya", "Paz de Río", "Pesca", "Pisba", "Puerto Boyacá", "Quípama", "Ramiriquí", "Ráquira", "Rondón", "Saboyá", "Sáchica", "Samacá", "San Eduardo", "San José de Pare", "San Luis de Gaceno", "San Mateo", "San Miguel de Sema", "San Pablo de Borbur", "Santa María", "Santa Rosa de Viterbo", "Santa Sofía", "Santana", "Sativanorte", "Sativasur", "Siachoque", "Soatá", "Socha", "Socotá", "Sogamoso", "Somondoco", "Sora", "Soracá", "Sotaquirá", "Susacón", "Sutamarchán", "Sutatenza", "Tasco", "Tenza", "Tibaná", "Tibasosa", "Tinjacá", "Tipacoque", "Toca", "Togüí", "Tópaga", "Tota", "Tunja", "Tununguá", "Turmequé", "Tuta", "Tutazá", "Úmbita", "Ventaquemada", "Villa de Leyva", "Viracachá", "Zetaquira"],
        "Caldas": ["Aguadas", "Anserma", "Aranzazu", "Belalcázar", "Chinchiná", "Filadelfia", "La Dorada", "La Merced", "Manizales", "Manzanares", "Marmato", "Marquetalia", "Marulanda", "Neira", "Norcasia", "Pácora", "Palestina", "Pensilvania", "Riosucio", "Risaralda", "Salamina", "Samaná", "San José", "Supía", "Victoria", "Villamaría", "Viterbo"],
        "Caquetá": ["Albania", "Belén de los Andaquíes", "Cartagena del Chairá", "Curillo", "El Doncello", "El Paujil", "Florencia", "La Montañita", "Milán", "Morelia", "Puerto Rico", "San José del Fragua", "San Vicente del Caguán", "Solano", "Solita", "Valparaíso"],
        "Casanare": ["Aguazul", "Chámeza", "Hato Corozal", "La Salina", "Maní", "Monterrey", "Nunchía", "Orocué", "Paz de Ariporo", "Pore", "Recetor", "Sabanalarga", "Sácama", "San Luis de Palenque", "Támara", "Tauramena", "Trinidad", "Villanueva", "Yopal"],
        "Cauca": ["Almaguer", "Argelia", "Balboa", "Bolívar", "Buenos Aires", "Cajibío", "Caldono", "Caloto", "Corinto", "El Tambo", "Florencia", "Guachené", "Guapí", "Inzá", "Jambaló", "La Sierra", "La Vega", "López de Micay", "Mercaderes", "Miranda", "Morales", "Padilla", "Páez", "Patía", "Piamonte", "Piendamó", "Popayán", "Puerto Tejada", "Puracé", "Rosas", "San Sebastián", "Santander de Quilichao", "Santa Rosa", "Silvia", "Sotará", "Suárez", "Sucre", "Timbío", "Timbiquí", "Toribío", "Totoró", "Villa Rica"],
        "Cesar": ["Aguachica", "Agustín Codazzi", "Astrea", "Becerril", "Bosconia", "Chimichagua", "Chiriguaná", "Curumaní", "El Copey", "El Paso", "Gamarra", "González", "La Gloria", "La Jagua de Ibirico", "La Paz", "Manaure Balcón del Cesar", "Pailitas", "Pelaya", "Pueblo Bello", "Río de Oro", "San Alberto", "San Diego", "San Martín", "Tamalameque", "Valledupar"],
        "Chocó": ["Acandí", "Alto Baudó", "Bagadó", "Bahía Solano", "Bajo Baudó", "Bojayá", "Cantón de San Pablo", "Cértegui", "Condoto", "El Atrato", "El Carmen de Atrato", "El Carmen del Darién", "Istmina", "Juradó", "Litoral de San Juan", "Lloró", "Medio Atrato", "Medio Baudó", "Medio San Juan", "Nóvita", "Nuquí", "Quibdó", "Riosucio", "Río Iró", "Río Quito", "San José del Palmar", "Sipí", "Tadó", "Unguía", "Unión Panamericana"],
        "Cundinamarca": ["Agua de Dios", "Albán", "Anapoima", "Anolaima", "Apulo", "Arbeláez", "Beltrán", "Bituima", "Bogotá", "Bojacá", "Cabrera", "Cachipay", "Cajicá", "Caparrapí", "Cáqueza", "Carmen de Carupa", "Chaguaní", "Chía", "Chipaque", "Chocontá", "Cogua", "Cota", "Cucunubá", "El Colegio", "El Peñón", "El Rosal", "Facatativá", "Fómeque", "Fosca", "Funza", "Fúquene", "Fusagasugá", "Gachalá", "Gachancipá", "Gachetá", "Gama", "Girardot", "Granada", "Guachetá", "Guaduas", "Guasca", "Guataquí", "Guatavita", "Guayabal de Síquima", "Guayabetal", "Gutiérrez", "Jerusalén", "Junín", "La Calera", "La Mesa", "La Palma", "La Peña", "La Vega", "Lenguazaque", "Machetá", "Madrid", "Manta", "Medina", "Mosquera", "Nariño", "Nemocón", "Nilo", "Nimaima", "Nocaima", "Pacho", "Paime", "Pandi", "Paratebueno", "Pasca", "Puerto Salgar", "Pulí", "Quebradanegra", "Quetame", "Quipile", "Ricaurte", "San Antonio del Tequendama", "San Bernardo", "San Cayetano", "San Francisco", "San Juan de Rioseco", "Sasaima", "Sesquilé", "Sibaté", "Silvania", "Simijaca", "Soacha", "Sopó", "Subachoque", "Suesca", "Supatá", "Susa", "Sutatausa", "Tabio", "Tausa", "Tena", "Tenjo", "Tibacuy", "Tibirita", "Tocaima", "Tocancipá", "Topaipí", "Ubalá", "Ubaque", "Ubaté", "Une", "Útica", "Venecia", "Vergara", "Vianí", "Villagómez", "Villapinzón", "Villeta", "Viotá", "Yacopí", "Zipacón", "Zipaquirá"],
        "Córdoba": ["Ayapel", "Buenavista", "Canalete", "Cereté", "Chimá", "Chinú", "Ciénaga de Oro", "Cotorra", "La Apartada", "Lorica", "Los Córdobas", "Momil", "Moñitos", "Montelíbano", "Montería", "Planeta Rica", "Pueblo Nuevo", "Puerto Escondido", "Puerto Libertador", "Purísima", "Sahagún", "San Andrés de Sotavento", "San Antero", "San Bernardo del Viento", "San Carlos", "San José de Uré", "San Pelayo", "Tierralta", "Tuchín", "Valencia"],
        "Guainía": ["Inírida"],
        "Guaviare": ["Calamar", "El Retorno", "Miraflores", "San José del Guaviare"],
        "Huila": ["Acevedo", "Agrado", "Aipe", "Algeciras", "Altamira", "Baraya", "Campoalegre", "Colombia", "Elías", "Garzón", "Gigante", "Guadalupe", "Hobo", "Íquira", "Isnos", "La Argentina", "La Plata", "Nátaga", "Neiva", "Oporapa", "Paicol", "Palermo", "Palestina", "Pital", "Pitalito", "Rivera", "Saladoblanco", "San Agustín", "Santa María", "Suaza", "Tarqui", "Tello", "Teruel", "Tesalia", "Timaná", "Villavieja", "Yaguará"],
        "La Guajira": ["Albania", "Barrancas", "Dibulla", "Distracción", "El Molino", "Fonseca", "Hatonuevo", "La Jagua del Pilar", "Maicao", "Manaure", "Riohacha", "San Juan del Cesar", "Uribia", "Urumita", "Villanueva"],
        "Magdalena": ["Algarrobo", "Aracataca", "Ariguaní", "Cerro de San Antonio", "Chivolo", "Ciénaga", "Concordia", "El Banco", "El Piñón", "El Retén", "Fundación", "Guamal", "Nueva Granada", "Pedraza", "Pijiño del Carmen", "Pivijay", "Plato", "Puebloviejo", "Remolino", "Sabanas de San Ángel", "Salamina", "San Sebastián de Buenavista", "San Zenón", "Santa Ana", "Santa Bárbara de Pinto", "Santa Marta", "Sitionuevo", "Tenerife", "Zapayán", "Zona Bananera"],
        "Meta": ["Acacías", "Barranca de Upía", "Cabuyaro", "Castilla la Nueva", "Cubarral", "Cumaral", "El Calvario", "El Castillo", "El Dorado", "Fuente de Oro", "Granada", "Guamal", "La Macarena", "Lejanías", "Mapiripán", "Mesetas", "Puerto Concordia", "Puerto Gaitán", "Puerto Lleras", "Puerto López", "Puerto Rico", "Restrepo", "San Carlos de Guaroa", "San Juan de Arama", "San Juanito", "San Martín", "Uribe", "Villavicencio", "Vista Hermosa"],
        "Nariño": ["Aldana", "Ancuyá", "Arboleda", "Barbacoas", "Belén", "Buesaco", "Chachagüí", "Colón", "Consacá", "Contadero", "Córdoba", "Cuaspud", "Cumbal", "Cumbitara", "El Charco", "El Peñol", "El Rosario", "El Tablón de Gómez", "El Tambo", "Francisco Pizarro", "Funes", "Guachucal", "Guaitarilla", "Gualmatán", "Iles", "Imués", "Ipiales", "La Cruz", "La Florida", "La Llanada", "La Tola", "La Unión", "Leiva", "Linares", "Los Andes", "Magüí Payán", "Mallama", "Mosquera", "Nariño", "Olaya Herrera", "Ospina", "Pasto", "Policarpa", "Potosí", "Providencia", "Puerres", "Pupiales", "Ricaurte", "Roberto Payán", "Samaniego", "San Bernardo", "San Lorenzo", "San Pablo", "San Pedro de Cartago", "Sandoná", "Santa Bárbara", "Santacruz", "Sapuyes", "Taminango", "Tangua", "Tumaco", "Túquerres", "Yacuanquer"],
        "Norte de Santander": ["Ábrego", "Arboledas", "Bochalema", "Bucarasica", "Cáchira", "Cácota", "Chinácota", "Chitagá", "Convención", "Cúcuta", "Cucutilla", "Duranía", "El Carmen", "El Tarra", "El Zulia", "Gramalote", "Hacarí", "Herrán", "La Esperanza", "La Playa de Belén", "Labateca", "Los Patios", "Lourdes", "Mutiscua", "Ocaña", "Pamplona", "Pamplonita", "Puerto Santander", "Ragonvalia", "Salazar de Las Palmas", "San Calixto", "San Cayetano", "Santiago", "Sardinata", "Silos", "Teorama", "Tibú", "Villa Caro", "Villa del Rosario"],
        "Putumayo": ["Colón", "Mocoa", "Orito", "Puerto Asís", "Puerto Caicedo", "Puerto Guzmán", "Puerto Leguízamo", "San Francisco", "San Miguel", "Santiago", "Sibundoy", "Valle del Guamuez", "Villagarzón"],
        "Quindío": ["Armenia", "Buenavista", "Calarcá", "Circasia", "Córdoba", "Filandia", "Génova", "La Tebaida", "Montenegro", "Pijao", "Quimbaya", "Salento"],
        "Risaralda": ["Apía", "Balboa", "Belén de Umbría", "Dosquebradas", "Guática", "La Celia", "La Virginia", "Marsella", "Mistrató", "Pereira", "Pueblo Rico", "Quinchía", "Santa Rosa de Cabal", "Santuario"],
        "San Andrés y Providencia": ["Providencia y Santa Catalina Islas", "San Andrés"],
        "Santander": ["Aguada", "Albania", "Aratoca", "Barbosa", "Barichara", "Barrancabermeja", "Betulia", "Bolívar", "Bucaramanga", "Cabrera", "California", "Capitanejo", "Carcasí", "Cepitá", "Cerrito", "Charalá", "Charta", "Chima", "Chipatá", "Cimitarra", "Concepción", "Confines", "Contratación", "Coromoro", "Curití", "El Carmen de Chucurí", "El Guacamayo", "El Peñón", "El Playón", "Encino", "Enciso", "Floridablanca", "Galán", "Gámbita", "Girón", "Guaca", "Guadalupe", "Guapotá", "Guavatá", "Güepsa", "Hato", "Jesús María", "Jordán", "La Belleza", "La Paz", "Landázuri", "Lebrija", "Los Santos", "Macaravita", "Málaga", "Matanza", "Mogotes", "Molagavita", "Ocamonte", "Oiba", "Onzaga", "Palmar", "Palmas del Socorro", "Páramo", "Piedecuesta", "Pinchote", "Puente Nacional", "Puerto Parra", "Puerto Wilches", "Rionegro", "Sabana de Torres", "San Andrés", "San Benito", "San Gil", "San Joaquín", "San José de Miranda", "San Miguel", "San Vicente de Chucurí", "Santa Bárbara", "Santa Helena del Opón", "Simacota", "Socorro", "Suaita", "Sucre", "Suratá", "Tona", "Valle de San José", "Vélez", "Vetas", "Villanueva", "Zapatoca"],
        "Sucre": ["Buenavista", "Caimito", "Chalán", "Colosó", "Corozal", "Coveñas", "El Roble", "Galeras", "Guaranda", "La Unión", "Los Palmitos", "Majagual", "Morroa", "Ovejas", "Palmito", "Sampués", "San Benito Abad", "San Juan de Betulia", "San Marcos", "San Onofre", "San Pedro", "Sincé", "Sincelejo", "Sucre", "Tolú", "Tolúviejo"],
        "Tolima": ["Alpujarra", "Alvarado", "Ambalema", "Anzoátegui", "Armero", "Ataco", "Cajamarca", "Carmen de Apicalá", "Casabianca", "Chaparral", "Coello", "Coyaima", "Cunday", "Dolores", "Espinal", "Falan", "Flandes", "Fresno", "Guamo", "Herveo", "Honda", "Ibagué", "Icononzo", "Lérida", "Líbano", "Mariquita", "Melgar", "Murillo", "Natagaima", "Ortega", "Palocabildo", "Piedras", "Planadas", "Prado", "Purificación", "Rioblanco", "Roncesvalles", "Rovira", "Saldaña", "San Antonio", "San Luis", "Santa Isabel", "Suárez", "Valle de San Juan", "Venadillo", "Villahermosa", "Villarrica"],
        "Valle del Cauca": ["Alcalá", "Andalucía", "Ansermanuevo", "Argelia", "Bolívar", "Buenaventura", "Buga", "Bugalagrande", "Caicedonia", "Cali", "Calima", "Candelaria", "Cartago", "Dagua", "El Águila", "El Cairo", "El Cerrito", "El Dovio", "Florida", "Ginebra", "Guacarí", "Jamundí", "La Cumbre", "La Unión", "La Victoria", "Obando", "Palmira", "Pradera", "Restrepo", "Riofrío", "Roldanillo", "San Pedro", "Sevilla", "Toro", "Trujillo", "Tuluá", "Ulloa", "Versalles", "Vijes", "Yotoco", "Yumbo", "Zarzal"],
        "Vaupés": ["Carurú", "Mitú", "Taraira"],
        "Vichada": ["Cumaribo", "La Primavera", "Puerto Carreño", "Santa Rosalía"],
        "Bogotá D.C.": ["Bogotá"]
    };

    const departamentoSelect = document.getElementById('departamento');
    const ciudadSelect = document.getElementById('ciudad');

    function populateDepartamentos() {
        const sortedDepartamentos = Object.keys(colombianLocations).sort();
        for (const departamento of sortedDepartamentos) {
            const option = document.createElement('option');
            option.value = departamento;
            option.textContent = departamento;
            departamentoSelect.appendChild(option);
        }
    }

    function populateCiudades(selectedDepartamento) {
        ciudadSelect.innerHTML = '<option value="">Seleccione Ciudad...</option>';
        if (selectedDepartamento && colombianLocations[selectedDepartamento]) {
            const sortedCiudades = colombianLocations[selectedDepartamento].sort();
            sortedCiudades.forEach(ciudad => {
                const option = document.createElement('option');
                option.value = ciudad;
                option.textContent = ciudad;
                ciudadSelect.appendChild(option);
            }
            );
        }
    }

    departamentoSelect.addEventListener('change', (event) => {
        populateCiudades(event.target.value);
    }
    );

    populateDepartamentos();

    // --- LÓGICA CONDICIONAL PARA PENSIÓN Y CORREO ---
    const recibePensionSelect = document.getElementById('recibe_pension');
    const fondoPensionContainer = document.getElementById('fondo-pension-container');
    const fondoPensionSelect = document.getElementById('fondo_pension');

    const tieneCorreoSelect = document.getElementById('tiene_correo');
    const correoContainer = document.getElementById('correo-container');
    const correoInput = document.getElementById('correo');

    recibePensionSelect.addEventListener('change', () => {
        if (recibePensionSelect.value === 'Si') {
            fondoPensionContainer.style.display = 'block';
            fondoPensionSelect.required = true;
        } else {
            fondoPensionContainer.style.display = 'none';
            fondoPensionSelect.required = false;
            fondoPensionSelect.value = '';
        }
    }
    );

    tieneCorreoSelect.addEventListener('change', () => {
        if (tieneCorreoSelect.value === 'Si') {
            correoContainer.style.display = 'block';
            correoInput.required = true;
        } else {
            correoContainer.style.display = 'none';
            correoInput.required = false;
            correoInput.value = '';
        }
    }
    );

    // --- LÓGICA DE VALIDACIÓN DE DOCUMENTO ---
    const tipoDocumentoSelect = document.getElementById('tipo_documento');
    const numeroDocumentoInput = document.getElementById('numero_documento');

    // --- LÓGICA DE VALIDACIÓN DE NÚMEROS DE TELÉFONO ---
    const telefonoPrincipalInput = document.getElementById('telefono_principal');
    const telefonoFamiliarInput = document.getElementById('telefono_familiar');

    const validatePhoneLength = (event) => {
        const input = event.target;
        const value = input.value;

        // Permitir que el campo esté vacío para que la validación 'required' se encargue
        if (value.length === 0) {
            input.setCustomValidity('');
            return;
        }

        if (value.length !== 10) {
            input.setCustomValidity('El número de teléfono debe tener 10 dígitos.');
        } else {
            input.setCustomValidity('');
        }
    };

    telefonoPrincipalInput.addEventListener('input', validatePhoneLength);
    telefonoFamiliarInput.addEventListener('input', validatePhoneLength);

    const forceNumericInput = (event) => {
        event.target.value = event.target.value.replace(/[^0-9]/g, '');
    }
    ;

    // Always enforce numeric input
    numeroDocumentoInput.addEventListener('input', forceNumericInput);

    function applyDocumentValidation() {
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
        case 'PEP':
        case 'CE':
            numeroDocumentoInput.setAttribute('pattern', '[0-9]{5,20}');
            numeroDocumentoInput.setAttribute('title', 'Solo números (5 a 20 dígitos)');
            numeroDocumentoInput.placeholder = 'Ej: 1000123456';
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

    // --- LÓGICA DEL POP-UP DE BIENVENIDA ---
    giveawayPopup.classList.remove('hidden');
    // Show immediately

    closePopupBtn.addEventListener("click", () => {
        giveawayPopup.classList.add("hidden");
    }
    );

    closeModalBtn.addEventListener("click", () => {
        successModal.classList.remove("visible");
    }
    );

    // --- INICIALIZACIÓN DE FLATPCIKR ---
    flatpickr('input[type="date"]', {
        "locale": "es",
        dateFormat: "Y-m-d",
    });

    // --- VALIDACIÓN DE EDAD ---
    const fechaNacimientoInput = document.querySelector('input[name="fecha_nacimiento"]');
    const submitButton = form.querySelector('button[type="submit"]');

    function checkAge() {
        const MIN_AGE = 18; // Edad mínima para la campaña
        const birthDate = new Date(fechaNacimientoInput.value);
        const today = new Date();
        if (isNaN(birthDate.getTime()) || !fechaNacimientoInput.value) {
            // Si la fecha es inválida o está vacía, no hacemos nada.
            // La validación 'required' del HTML se encargará del campo vacío.
            msg.textContent = '';
            submitButton.disabled = false;
            return;
        }
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < MIN_AGE) {
            msg.textContent = `Esta campaña es para personas mayores de ${MIN_AGE} años.`;
            msg.style.color = 'red';
            submitButton.disabled = true;
        } else {
            msg.textContent = '';
            submitButton.disabled = false;
        }
    }

    // --- LÓGICA DEL CARRUSEL (VERSIÓN CON BUCLE INFINITO) ---
    const carouselContainer = document.querySelector('.carousel-container');
    const carouselTrack = document.querySelector('.carousel-track');
    const originalSlides = Array.from(document.querySelectorAll('.carousel-slide'));

    // Solo ejecutar la lógica del carrusel si los elementos existen y hay más de una diapositiva
    if (carouselContainer && carouselTrack && originalSlides.length > 1) {

        // 1. Clonar diapositivas para bucle infinito
        const firstClone = originalSlides[0].cloneNode(true);
        const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);

        firstClone.id = 'first-clone';
        lastClone.id = 'last-clone';

        carouselTrack.appendChild(firstClone);
        carouselTrack.insertBefore(lastClone, originalSlides[0]);

        const allSlides = Array.from(carouselTrack.children);
        let slideWidth = carouselContainer.getBoundingClientRect().width;
        let currentIndex = 1; // Empezar en la primera diapositiva real
        let autoSlideInterval;
        let isTransitioning = false;

        // 2. Posición inicial y actualizaciones
        const updatePosition = (withTransition = true) => {
            if (!withTransition) {
                carouselTrack.style.transition = 'none';
            }
            carouselTrack.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
            if (!withTransition) {
                // Forzar reflow para aplicar el cambio sin transición y luego restaurarla
                carouselTrack.offsetHeight;
                carouselTrack.style.transition = 'transform 0.5s ease-in-out';
            }
        };

        // 3. Lógica de movimiento
        const moveToSlide = (newIndex) => {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex = newIndex;
            updatePosition();
        };

        // 4. Manejar el "salto" invisible al final de la transición
        carouselTrack.addEventListener('transitionend', () => {
            isTransitioning = false;
            if (allSlides[currentIndex].id === 'first-clone') {
                currentIndex = 1;
                updatePosition(false);
            } else if (allSlides[currentIndex].id === 'last-clone') {
                currentIndex = originalSlides.length;
                updatePosition(false);
            }
        });

        // 5. Autoplay
        const startAutoSlide = () => {
            autoSlideInterval = setInterval(() => {
                moveToSlide(currentIndex + 1);
            }, 3000); // Change slide every 3 seconds
        };

        const stopAutoSlide = () => {
            clearInterval(autoSlideInterval);
        };
        
        // 6. Manejar redimensionamiento de ventana
        window.addEventListener('resize', () => {
            stopAutoSlide();
            slideWidth = carouselContainer.getBoundingClientRect().width;
            updatePosition(false);
            startAutoSlide();
        });

        // 7. Funcionalidad de Swipe
        let touchStartX = 0;
        let touchEndX = 0;
        const swipeThreshold = 50; // Minimum pixels to register a swipe

        carouselContainer.addEventListener('touchstart', (e) => {
            stopAutoSlide();
            isTransitioning = true; // Pausar el listener de 'transitionend' durante el swipe
            touchStartX = e.touches[0].clientX;
        });

        carouselContainer.addEventListener('touchend', (e) => {
            isTransitioning = false;
            touchEndX = e.changedTouches[0].clientX;
            const diffX = touchStartX - touchEndX;

            if (Math.abs(diffX) > swipeThreshold) {
                if (diffX > 0) { // Swiped left
                    moveToSlide(currentIndex + 1);
                } else { // Swiped right
                    moveToSlide(currentIndex - 1);
                }
            }
            startAutoSlide(); // Restart auto-play after swipe
        });

        // 8. Botones de Navegación
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                stopAutoSlide();
                moveToSlide(currentIndex - 1);
                startAutoSlide();
            });

            nextBtn.addEventListener('click', () => {
                stopAutoSlide();
                moveToSlide(currentIndex + 1);
                startAutoSlide();
            });
        }

        // Iniciar todo
        updatePosition(false);
        startAutoSlide();
    }

    // --- LÓGICA DE ENVÍO DEL FORMULARIO ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevenir el envío tradicional del formulario
        const submitButton = form.querySelector('button[type="submit"]');

        // Re-validar la edad justo antes de enviar
        checkAge();

        // Si la validación (p. ej. de edad) deshabilitó el botón, no continuar.
        if (submitButton.disabled) {
            console.warn("Envío bloqueado por validación (ej. edad insuficiente).");
            return;
        }

        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = 'Enviando...';

        // Recolectar los datos del formulario
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Asegurarse de que el checkbox envíe un valor booleano (true/false)
        data.privacidad = formData.has('privacidad');

        try {
            // Enviar los datos a la función de Vercel
            const response = await fetch('/api/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            // Si la respuesta no es exitosa (ej. 404, 500), manejar el error.
            if (!response.ok) {
                let errorMessage = `Ocurrió un error en el servidor (Código: ${response.status}).`;
                // Intentar leer un mensaje de error específico del cuerpo de la respuesta
                try {
                    const errorResult = await response.json();
                    errorMessage = errorResult.message || errorMessage;
                } catch (e) {
                    // Si el cuerpo no es JSON (ej. una página de error 404 en HTML)
                    if (response.status === 404) {
                        errorMessage = "Error: No se pudo encontrar el servicio de envío (404). Verifica que la función de Vercel se haya desplegado correctamente.";
                    }
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();

            // Éxito al enviar
            modalMessage.textContent = result.message || '¡Formulario enviado con éxito!';
            modalIcon.className = 'modal-icon success';
            modalIconI.className = 'fas fa-check-circle';
            successModal.classList.add('visible');
            form.reset(); // Limpiar el formulario
            
            // Ocultar el formulario y mostrar el botón inicial de nuevo
            form.classList.add('hidden');
            showBtn.style.display = 'block';

        } catch (error) {
            // Error de red o cualquier otro error
            console.error('Error al enviar el formulario:', error); // Log para depuración
            modalMessage.textContent = error.message || 'No se pudo enviar el formulario. Por favor, intente de nuevo.';
            modalIcon.className = 'modal-icon error';
            modalIconI.className = 'fas fa-times-circle';
            successModal.classList.add('visible');
        } finally {
            // Restaurar el botón de envío
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });

    // Initial call to apply validation on page load
    applyDocumentValidation();
    tipoDocumentoSelect.addEventListener('change', applyDocumentValidation);

    // Initial check for age on page load if date is pre-filled
    checkAge();
    fechaNacimientoInput.addEventListener('change', checkAge);

});