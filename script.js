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

    // Depuración: verificar elementos críticos
    console.log('showBtn encontrado:', !!showBtn);
    console.log('form encontrado:', !!form);
    console.log('giveawayPopup encontrado:', !!giveawayPopup);
    console.log('closePopupBtn encontrado:', !!closePopupBtn);
    
    // --- ELEMENTOS DE LA SECCIÓN DE CONSULTA VERIFIK (COMENTADO TEMPORALMENTE) ---
    // const btnConsultar = document.getElementById("btn-consultar");
    // const consultaTipoDoc = null;
    // const consultaNumeroDoc = document.getElementById("consulta_numero_documento");
    // const consultaResultado = document.getElementById("consulta-resultado");

    // --- NUEVO: BOTÓN CONSULTAR DOCUMENTO ---
    const btnConsultarDocumento = document.getElementById("btn-consultar-documento");
    const resultadoConsultaDoc = document.getElementById("resultado-consulta-doc");
    const tipoDocumentoSelect = document.getElementById('tipo_documento');
    const numeroDocumentoInput = document.getElementById('numero_documento');
    const nombreInput = document.getElementById('nombre');
    const fechaNacimientoInput = document.getElementById('fecha_nacimiento');

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
    "Amazonas": ["Leticia", "Puerto Narino"],
    "Antioquia": ["Abejorral", "Abriaqui", "Alejandria", "Amaga", "Amalfi", "Andes", "Angelopolis", "Angostura", "Anori", "Anza", "Apartado", "Arboletes", "Argelia", "Armenia", "Barbosa", "Bello", "Belmira", "Betania", "Betulia", "Briceno", "Buritica", "Caceres", "Caicedo", "Caldas", "Campamento", "Canasgordas", "Caracoli", "Caramanta", "Carepa", "Carolina del Principe", "Caucasia", "Chigorodo", "Cisneros", "Ciudad Bolivar", "Cocorna", "Concepcion", "Concordia", "Copacabana", "Dabeiba", "Donmatias", "Ebejico", "El Bagre", "El Carmen de Viboral", "El Penol", "El Retiro", "El Santuario", "Entrerrios", "Envigado", "Fredonia", "Frontino", "Giraldo", "Girardota", "Gomez Plata", "Granada", "Guadalupe", "Guarne", "Guatape", "Heliconia", "Hispania", "Itagui", "Ituango", "Jardin", "Jerico", "La Ceja", "La Estrella", "La Pintada", "La Union", "Liborina", "Maceo", "Marinilla", "Medellin", "Montebello", "Murindo", "Mutata", "Narino", "Nechi", "Necocli", "Olaya", "Peque", "Pueblorrico", "Puerto Berrio", "Puerto Nare", "Puerto Triunfo", "Remedios", "Rionegro", "Sabanalarga", "Sabaneta", "Salgar", "San Andres de Cuerquia", "San Carlos", "San Francisco", "San Jeronimo", "San Jose de la Montana", "San Juan de Uraba", "San Luis", "San Pedro de Uraba", "San Pedro de los Milagros", "San Rafael", "San Roque", "San Vicente", "Santa Barbara", "Santa Fe de Antioquia", "Santo Domingo", "Segovia", "Sonson", "Sopetran", "Tamesis", "Taraza", "Tarso", "Titiribi", "Toledo", "Turbo", "Uramita", "Urrao", "Valdivia", "Valparaiso", "Vegachi", "Venecia", "Vigia del Fuerte", "Yali", "Yarumal", "Yolombo", "Yondo", "Zaragoza"],
    "Arauca": ["Arauca", "Arauquita", "Cravo Norte", "Fortul", "Puerto Rondon", "Saravena", "Tame"],
    "Atlantico": ["Baranoa", "Barranquilla", "Campo de la Cruz", "Candelaria", "Galapa", "Juan de Acosta", "Luruaco", "Malambo", "Manati", "Palmar de Varela", "Piojo", "Polonuevo", "Ponedera", "Puerto Colombia", "Repelon", "Sabanagrande", "Sabanalarga", "Santa Lucia", "Santo Tomas", "Soledad", "Suan", "Tubara", "Usiacuri"],
    "Bolivar": ["Achi", "Altos del Rosario", "Arenal", "Arjona", "Arroyohondo", "Barranco de Loba", "Brazuelo de Papayal", "Calamar", "Cantagallo", "Cartagena de Indias", "Cicuco", "Clemencia", "Cordoba", "El Carmen de Bolivar", "El Guamo", "El Penon", "Hatillo de Loba", "Magangue", "Mahates", "Margarita", "Maria la Baja", "Mompos", "Montecristo", "Morales", "Norosi", "Pinillos", "Regidor", "Rioviejo", "San Cristobal", "San Estanislao", "San Fernando", "San Jacinto del Cauca", "San Jacinto", "San Juan Nepomoceno", "San Martin de Loba", "San Pablo", "Santa Catalina", "Santa Rosa", "Santa Rosa del Sur", "Simiti", "Soplaviento", "Talaigua Nuevo", "Tiquisio", "Turbaco", "Turbana", "Villanueva", "Zambrano"],
    "Boyaca": ["Almeida", "Aquitania", "Arcabuco", "Belen", "Berbeo", "Beteitiva", "Boavita", "Boyaca", "Briceno", "Buenavista", "Busbanza", "Caldas", "Campohermoso", "Cerinza", "Chinavita", "Chiquinquira", "Chiquiza", "Chiscas", "Chita", "Chitaraque", "Chivata", "Chivor", "Cienega", "Combita", "Coper", "Corrales", "Covarachia", "Cubar", "Cucaita", "Cuitiva", "Duitama", "El Cocuy", "El Espino", "Firavitoba", "Floresta", "Gachantiva", "Gameza", "Garagoa", "Guacamayas", "Guateque", "Guayata", "Guican", "Iza", "Jenesano", "Jerico", "La Capilla", "La Uvita", "La Victoria", "Labranzagrande", "Macanal", "Maripi", "Miraflores", "Mongua", "Mongui", "Moniquira", "Motavita", "Muzo", "Nobsa", "Nuevo Colon", "Oicata", "Otanche", "Pachavita", "Paez", "Paipa", "Pajarito", "Panqueba", "Pauna", "Paya", "Paz de Rio", "Pesca", "Pisba", "Puerto Boyaca", "Quipama", "Ramiriqui", "Raquira", "Rondon", "Saboya", "Sachica", "Samaca", "San Eduardo", "San Jose de Pare", "San Luis de Gaceno", "San Mateo", "San Miguel de Sema", "San Pablo de Borbur", "Santa Maria", "Santa Rosa de Viterbo", "Santa Sofia", "Santana", "Sativanorte", "Sativasur", "Siachoque", "Soata", "Socha", "Socota", "Sogamoso", "Somondoco", "Sora", "Soraca", "Sotaquira", "Susacon", "Sutamarchan", "Sutatenza", "Tasco", "Tenza", "Tibana", "Tibasosa", "Tinjaca", "Tipacoque", "Toca", "Togui", "Topaga", "Tota", "Tunja", "Tunungua", "Turmeque", "Tuta", "Tutaza", "Umbita", "Ventaquemada", "Villa de Leyva", "Viracacha", "Zetaquira"],
    "Caldas": ["Aguadas", "Anserma", "Aranzazu", "Belalcazar", "Chinchina", "Filadelfia", "La Dorada", "La Merced", "Manizales", "Manzanares", "Marmato", "Marquetalia", "Marulanda", "Neira", "Norcasia", "Pacora", "Palestina", "Pensilvania", "Riosucio", "Risaralda", "Salamina", "Samana", "San Jose", "Supia", "Victoria", "Villamaria", "Viterbo"],
    "Caqueta": ["Albania", "Belen de los Andaquies", "Cartagena del Chaira", "Curillo", "El Doncello", "El Paujil", "Florencia", "La Montanita", "Milan", "Morelia", "Puerto Rico", "San Jose del Fragua", "San Vicente del Caguan", "Solano", "Solita", "Valparaiso"],
    "Casanare": ["Aguazul", "Chameza", "Hato Corozal", "La Salina", "Mani", "Monterrey", "Nunchia", "Orocue", "Paz de Ariporo", "Pore", "Recetor", "Sabanalarga", "Sacama", "San Luis de Palenque", "Tamara", "Tauramena", "Trinidad", "Villanueva", "Yopal"],
    "Cauca": ["Almaguer", "Argelia", "Balboa", "Bolivar", "Buenos Aires", "Cajibio", "Caldono", "Caloto", "Corinto", "El Tambo", "Florencia", "Guachene", "Guapi", "Inza", "Jambalo", "La Sierra", "La Vega", "Lopez de Micay", "Mercaderes", "Miranda", "Morales", "Padilla", "Paez", "Patia", "Piamonte", "Piendamo", "Popayan", "Puerto Tejada", "Purace", "Rosas", "San Sebastian", "Santander de Quilichao", "Santa Rosa", "Silvia", "Sotara", "Suarez", "Sucre", "Timbio", "Timbiqui", "Toribio", "Totoro", "Villa Rica"],
    "Cesar": ["Aguachica", "Agustin Codazzi", "Astrea", "Becerril", "Bosconia", "Chimichagua", "Chiriguana", "Curumani", "El Copey", "El Paso", "Gamarra", "Gonzalez", "La Gloria", "La Jagua de Ibirico", "La Paz", "Manaure Balcon del Cesar", "Pailitas", "Pelaya", "Pueblo Bello", "Rio de Oro", "San Alberto", "San Diego", "San Martin", "Tamalameque", "Valledupar"],
    "Choco": ["Acandi", "Alto Baudo", "Bagado", "Bahia Solano", "Bajo Baudo", "Bojaya", "Canton de San Pablo", "Certegui", "Condoto", "El Atrato", "El Carmen de Atrato", "El Carmen del Darien", "Istmina", "Jurado", "Litoral de San Juan", "Lloro", "Medio Atrato", "Medio Baudo", "Medio San Juan", "Novita", "Nuqui", "Quibdo", "Riosucio", "Rio Iro", "Rio Quito", "San Jose del Palmar", "Sipi", "Tado", "Unguia", "Union Panamericana"],
    "Cundinamarca": ["Agua de Dios", "Alban", "Anapoima", "Anolaima", "Apulo", "Arbelaez", "Beltran", "Bituima", "Bogota", "Bojaca", "Cabrera", "Cachipay", "Cajica", "Caparrapi", "Caqueza", "Carmen de Carupa", "Chaguani", "Chia", "Chipaque", "Choconta", "Cogua", "Cota", "Cucunuba", "El Colegio", "El Penon", "El Rosal", "Facatativa", "Fomeque", "Fosca", "Funza", "Fuquene", "Fusagasuga", "Gachala", "Gachancipa", "Gacheta", "Gama", "Girardot", "Granada", "Guacheta", "Guaduas", "Guasca", "Guataqui", "Guatavita", "Guayabal de Siquima", "Guayabetal", "Gutierrez", "Jerusalen", "Junin", "La Calera", "La Mesa", "La Palma", "La Pena", "La Vega", "Lenguazaque", "Macheta", "Madrid", "Manta", "Medina", "Mosquera", "Narino", "Nemocon", "Nilo", "Nimaima", "Nocaima", "Pacho", "Paime", "Pandi", "Paratebueno", "Pasca", "Puerto Salgar", "Puli", "Quebradanegra", "Quetame", "Quipile", "Ricaurte", "San Antonio del Tequendama", "San Bernardo", "San Cayetano", "San Francisco", "San Juan de Rioseco", "Sasaima", "Sesquile", "Sibate", "Silvania", "Simijaca", "Soacha", "Sopo", "Subachoque", "Suesca", "Supata", "Susa", "Sutatausa", "Tabio", "Tausa", "Tena", "Tenjo", "Tibacuy", "Tibirita", "Tocaima", "Tocancipa", "Topaipi", "Ubala", "Ubaque", "Ubate", "Une", "Utica", "Venecia", "Vergara", "Viani", "Villagomez", "Villapinzon", "Villeta", "Viota", "Yacopi", "Zipacon", "Zipaquira"],
    "Cordoba": ["Ayapel", "Buenavista", "Canalete", "Cerete", "Chima", "Chinu", "Cienaga de Oro", "Cotorra", "La Apartada", "Lorica", "Los Cordobas", "Momil", "Monitos", "Montelibano", "Monteria", "Planeta Rica", "Pueblo Nuevo", "Puerto Escondido", "Puerto Libertador", "Purisima", "Sahagun", "San Andres de Sotavento", "San Antero", "San Bernardo del Viento", "San Carlos", "San Jose de Ure", "San Pelayo", "Tierralta", "Tuchin", "Valencia"],
    "Guainia": ["Inirida"],
    "Guaviare": ["Calamar", "El Retorno", "Miraflores", "San Jose del Guaviare"],
    "Huila": ["Acevedo", "Agrado", "Aipe", "Algeciras", "Altamira", "Baraya", "Campoalegre", "Colombia", "Elias", "Garzon", "Gigante", "Guadalupe", "Hobo", "Iquira", "Isnos", "La Argentina", "La Plata", "Nataga", "Neiva", "Oporapa", "Paicol", "Palermo", "Palestina", "Pital", "Pitalito", "Rivera", "Saladoblanco", "San Agustin", "Santa Maria", "Suaza", "Tarqui", "Tello", "Teruel", "Tesalia", "Timana", "Villavieja", "Yaguara"],
    "La Guajira": ["Albania", "Barrancas", "Dibulla", "Distraccion", "El Molino", "Fonseca", "Hatonuevo", "La Jagua del Pilar", "Maicao", "Manaure", "Riohacha", "San Juan del Cesar", "Uribia", "Urumita", "Villanueva"],
    "Magdalena": ["Algarrobo", "Aracataca", "Ariguani", "Cerro de San Antonio", "Chivolo", "Cienaga", "Concordia", "El Banco", "El Pinon", "El Reten", "Fundacion", "Guamal", "Nueva Granada", "Pedraza", "Pijino del Carmen", "Pivijay", "Plato", "Puebloviejo", "Remolino", "Sabanas de San Angel", "Salamina", "San Sebastian de Buenavista", "San Zenon", "Santa Ana", "Santa Barbara de Pinto", "Santa Marta", "Sitionuevo", "Tenerife", "Zapayan", "Zona Bananera"],
    "Meta": ["Acacias", "Barranca de Upia", "Cabuyaro", "Castilla la Nueva", "Cubarral", "Cumaral", "El Calvario", "El Castillo", "El Dorado", "Fuente de Oro", "Granada", "Guamal", "La Macarena", "Lejanias", "Mapiripan", "Mesetas", "Puerto Concordia", "Puerto Gaitan", "Puerto Lleras", "Puerto Lopez", "Puerto Rico", "Restrepo", "San Carlos de Guaroa", "San Juan de Arama", "San Juanito", "San Martin", "Uribe", "Villavicencio", "Vista Hermosa"],
    "Narino": ["Aldana", "Ancuya", "Arboleda", "Barbacoas", "Belen", "Buesaco", "Chachagui", "Colon", "Consaca", "Contadero", "Cordoba", "Cuaspud", "Cumbal", "Cumbitara", "El Charco", "El Penol", "El Rosario", "El Tablon de Gomez", "El Tambo", "Francisco Pizarro", "Funes", "Guachucal", "Guaitarilla", "Gualmatan", "Iles", "Imues", "Ipiales", "La Cruz", "La Florida", "La Llanada", "La Tola", "La Union", "Leiva", "Linares", "Los Andes", "Magui Payan", "Mallama", "Mosquera", "Narino", "Olaya Herrera", "Ospina", "Pasto", "Policarpa", "Potosi", "Providencia", "Puerres", "Pupiales", "Ricaurte", "Roberto Payan", "Samaniego", "San Bernardo", "San Lorenzo", "San Pablo", "San Pedro de Cartago", "Sandona", "Santa Barbara", "Santacruz", "Sapuyes", "Taminango", "Tangua", "Tumaco", "Tuquerres", "Yacuanquer"],
    "Norte de Santander": ["Abrego", "Arboledas", "Bochalema", "Bucarasica", "Cachira", "Cacota", "Chinacota", "Chitaga", "Convencion", "Cucuta", "Cucutilla", "Durania", "El Carmen", "El Tarra", "El Zulia", "Gramalote", "Hacari", "Herran", "La Esperanza", "La Playa de Belen", "Labateca", "Los Patios", "Lourdes", "Mutiscua", "Ocana", "Pamplona", "Pamplonita", "Puerto Santander", "Ragonvalia", "Salazar de Las Palmas", "San Calixto", "San Cayetano", "Santiago", "Sardinata", "Silos", "Teorama", "Tibu", "Villa Caro", "Villa del Rosario"],
    "Putumayo": ["Colon", "Mocoa", "Orito", "Puerto Asis", "Puerto Caicedo", "Puerto Guzman", "Puerto Leguizamo", "San Francisco", "San Miguel", "Santiago", "Sibundoy", "Valle del Guamuez", "Villagarzon"],
    "Quindio": ["Armenia", "Buenavista", "Calarca", "Circasia", "Cordoba", "Filandia", "Genova", "La Tebaida", "Montenegro", "Pijao", "Quimbaya", "Salento"],
    "Risaralda": ["Apia", "Balboa", "Belen de Umbria", "Dosquebradas", "Guatica", "La Celia", "La Virginia", "Marsella", "Mistrato", "Pereira", "Pueblo Rico", "Quinchia", "Santa Rosa de Cabal", "Santuario"],
    "San Andres y Providencia": ["Providencia y Santa Catalina Islas", "San Andres"],
    "Santander": ["Aguada", "Albania", "Aratoca", "Barbosa", "Barichara", "Barrancabermeja", "Betulia", "Bolivar", "Bucaramanga", "Cabrera", "California", "Capitanejo", "Carcasi", "Cepita", "Cerrito", "Charala", "Charta", "Chima", "Chipata", "Cimitarra", "Concepcion", "Confines", "Contratacion", "Coromoro", "Curiti", "El Carmen de Chucuri", "El Guacamayo", "El Penon", "El Playon", "Encino", "Enciso", "Floridablanca", "Galan", "Gambita", "Giron", "Guaca", "Guadalupe", "Guapota", "Guavata", "Guepsa", "Hato", "Jesus Maria", "Jordan", "La Belleza", "La Paz", "Landazuri", "Lebrija", "Los Santos", "Macaravita", "Malaga", "Matanza", "Mogotes", "Molagavita", "Ocamonte", "Oiba", "Onzaga", "Palmar", "Palmas del Socorro", "Paramo", "Piedecuesta", "Pinchote", "Puente Nacional", "Puerto Parra", "Puerto Wilches", "Rionegro", "Sabana de Torres", "San Andres", "San Benito", "San Gil", "San Joaquin", "San Jose de Miranda", "San Miguel", "San Vicente de Chucuri", "Santa Barbara", "Santa Helena del Opon", "Simacota", "Socorro", "Suaita", "Sucre", "Surata", "Tona", "Valle de San Jose", "Velez", "Vetas", "Villanueva", "Zapatoca"],
    "Sucre": ["Buenavista", "Caimito", "Chalan", "Coloso", "Corozal", "Covenas", "El Roble", "Galeras", "Guaranda", "La Union", "Los Palmitos", "Majagual", "Morroa", "Ovejas", "Palmito", "Sampues", "San Benito Abad", "San Juan de Betulia", "San Marcos", "San Onofre", "San Pedro", "Since", "Sincelejo", "Sucre", "Tolu", "Toluviejo"],
    "Tolima": ["Alpujarra", "Alvarado", "Ambalema", "Anzoategui", "Armero", "Ataco", "Cajamarca", "Carmen de Apicala", "Casabianca", "Chaparral", "Coello", "Coyaima", "Cunday", "Dolores", "Espinal", "Falan", "Flandes", "Fresno", "Guamo", "Herveo", "Honda", "Ibague", "Icononzo", "Lerida", "Libano", "Mariquita", "Melgar", "Murillo", "Natagaima", "Ortega", "Palocabildo", "Piedras", "Planadas", "Prado", "Purificacion", "Rioblanco", "Roncesvalles", "Rovira", "Saldana", "San Antonio", "San Luis", "Santa Isabel", "Suarez", "Valle de San Juan", "Venadillo", "Villahermosa", "Villarrica"],
    "Valle del Cauca": ["Alcala", "Andalucia", "Ansermanuevo", "Argelia", "Bolivar", "Buenaventura", "Buga", "Bugalagrande", "Caicedonia", "Cali", "Calima", "Candelaria", "Cartago", "Dagua", "El Aguila", "El Cairo", "El Cerrito", "El Dovio", "Florida", "Ginebra", "Guacari", "Jamundi", "La Cumbre", "La Union", "La Victoria", "Obando", "Palmira", "Pradera", "Restrepo", "Riofrio", "Roldanillo", "San Pedro", "Sevilla", "Toro", "Trujillo", "Tulua", "Ulloa", "Versalles", "Vijes", "Yotoco", "Yumbo", "Zarzal"],
    "Vaupes": ["Caruru", "Mitu", "Taraira"],
    "Vichada": ["Cumaribo", "La Primavera", "Puerto Carreno", "Santa Rosalia"],
    "Bogota D.C.": ["Bogota"]
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
    };

    // ===== NUEVO: BOTÓN CONSULTAR DOCUMENTO =====
    if (btnConsultarDocumento) {
        btnConsultarDocumento.addEventListener('click', async () => {
            const numeroDoc = numeroDocumentoInput.value.trim();
            const tipoDoc = tipoDocumentoSelect.value;

            // Validaciones
            if (!tipoDoc) {
                mostrarResultadoConsulta('⚠️ Por favor selecciona el tipo de documento', 'warning');
                return;
            }

            if (!numeroDoc || numeroDoc.length < 5) {
                mostrarResultadoConsulta('⚠️ Por favor ingresa un número de documento válido', 'warning');
                return;
            }

            // Deshabilitar botón y mostrar loading
            btnConsultarDocumento.disabled = true;
            btnConsultarDocumento.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Consultando...';

            try {
                console.log(`🔍 Consultando documento: ${tipoDoc} ${numeroDoc}`);
                
                const response = await fetch('/api/verificar-documento', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        numero_documento: numeroDoc
                    })
                });

                if (!response.ok) {
                    throw new Error('Error al consultar el documento');
                }

                const data = await response.json();
                console.log('📊 Resultado de consulta:', data);

                if (data.exists && data.data) {
                    // ✅ DOCUMENTO EXISTE - Autocompletar y bloquear campos
                    console.log(`✅ Documento encontrado: ${data.data.nombre}`);
                    mostrarResultadoConsulta(
                        `✅ Datos encontrados para: ${data.data.nombre}<br><small>Los campos bloqueados no se pueden modificar.</small>`,
                        'success'
                    );
                    
                    // Autocompletar formulario
                    autocompletarFormularioCompleto(data.data);
                    
                    // Bloquear campos que no se pueden modificar
                    bloquearCamposProtegidos(true);
                    
                } else {
                    // ℹ️ DOCUMENTO NO EXISTE - Permitir llenar todo
                    console.log(`ℹ️ Documento ${numeroDoc} no encontrado - formulario nuevo`);
                    mostrarResultadoConsulta(
                        'ℹ️ Documento no encontrado. Puedes llenar el formulario para registrarte.',
                        'info'
                    );
                    
                    // Limpiar formulario (excepto tipo y número de documento)
                    limpiarFormularioParcial();
                    
                    // Desbloquear todos los campos
                    bloquearCamposProtegidos(false);
                }

            } catch (error) {
                console.error('❌ Error al consultar documento:', error);
                mostrarResultadoConsulta(
                    '❌ Error al consultar el documento. Intenta nuevamente.',
                    'error'
                );
            } finally {
                // Restaurar botón
                btnConsultarDocumento.disabled = false;
                btnConsultarDocumento.innerHTML = '<i class="fas fa-search"></i> Consultar';
            }
        });
    }

    // Función para bloquear campos protegidos (nombre, documento, fecha nacimiento)
    const bloquearCamposProtegidos = (bloquear) => {
        const camposProtegidos = [
            nombreInput,
            tipoDocumentoSelect,
            numeroDocumentoInput,
            fechaNacimientoInput
        ];

        camposProtegidos.forEach(campo => {
            if (campo) {
                campo.disabled = bloquear;
                if (bloquear) {
                    campo.style.backgroundColor = '#f5f5f5';
                    campo.style.cursor = 'not-allowed';
                } else {
                    campo.style.backgroundColor = '';
                    campo.style.cursor = '';
                }
            }
        });

        console.log(`🔒 Campos protegidos ${bloquear ? 'BLOQUEADOS' : 'DESBLOQUEADOS'}`);
    };

    // Función para mostrar resultado de la consulta
    const mostrarResultadoConsulta = (mensaje, tipo) => {
        if (!resultadoConsultaDoc) return;

        const colores = {
            success: { bg: '#d4edda', border: '#28a745', text: '#155724' },
            warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
            error: { bg: '#f8d7da', border: '#dc3545', text: '#721c24' },
            info: { bg: '#d1ecf1', border: '#17a2b8', text: '#0c5460' }
        };

        const color = colores[tipo] || colores.info;

        resultadoConsultaDoc.innerHTML = `
            <div style="background: ${color.bg}; border: 2px solid ${color.border}; border-radius: 8px; padding: 12px; color: ${color.text}; font-size: 14px; animation: slideDown 0.3s ease-out;">
                ${mensaje}
            </div>
        `;

        resultadoConsultaDoc.style.display = 'block';
    };

    // Función para limpiar formulario parcialmente (mantener tipo y número de documento)
    const limpiarFormularioParcial = () => {
        const camposAMantener = ['numero_documento', 'tipo_documento'];
        
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (!camposAMantener.includes(input.id) && input.id !== 'btn-consultar-documento') {
                if (input.type === 'checkbox') {
                    input.checked = false;
                } else if (input.type !== 'button' && input.tagName !== 'BUTTON') {
                    input.value = '';
                }
            }
        });
        
        console.log('🧹 Formulario limpiado parcialmente');
    };

    // ===== CONSULTA AUTOMÁTICA CON VERIFIK Y VERIFICACIÓN EN BD (DESACTIVADA) =====
    let consultaTimeout = null;
    let verificacionTimeout = null;
    let lastConsultedDocument = '';
    let lastVerifiedDocument = '';

    const handleDocumentInput = async (event) => {
        // Solo aplicar validación numérica, SIN consulta automática
        forceNumericInput(event);
        
        // La consulta ahora se hace SOLO con el botón "Consultar"
    };

    const verificarDocumentoEnBD = async (numeroDoc) => {
        if (numeroDoc === lastVerifiedDocument) {
            console.log(`⏭️ Saltando verificación: documento ${numeroDoc} ya verificado`);
            return; // Evitar verificaciones duplicadas
        }

        try {
            console.log(`🔍 Verificando si documento ${numeroDoc} existe en BD...`);
            
            const response = await fetch('/api/verificar-documento', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    numero_documento: numeroDoc
                })
            });

            console.log(`📡 Respuesta de verificación: Status ${response.status}`);

            if (!response.ok) {
                console.error(`❌ Error al verificar documento: ${response.status} ${response.statusText}`);
                return;
            }

            const data = await response.json();
            console.log('📊 Datos recibidos:', data);
            
            if (data.exists) {
                console.log(`✅ ¡DOCUMENTO ENCONTRADO EN BD! Nombre: ${data.data?.nombre || 'N/A'}`);
                console.log('📋 Cargando todos los datos del formulario...');
                mostrarNotificacionDocumentoExistente(data.data);
                autocompletarFormularioCompleto(data.data); // Llenar TODOS los campos
                lastVerifiedDocument = numeroDoc;
            } else {
                console.log(`ℹ️ Documento ${numeroDoc} NO existe en BD (registro nuevo)`);
                ocultarNotificacionDocumentoExistente();
                limpiarFormulario(); // Limpiar el formulario si no existe
                lastVerifiedDocument = '';
            }
            
        } catch (error) {
            console.error('❌ Error al verificar documento en BD:', error);
        }
    };

    const mostrarNotificacionDocumentoExistente = (datos) => {
        // Remover notificación anterior si existe
        ocultarNotificacionDocumentoExistente();
        
        const notificacion = document.createElement('div');
        notificacion.id = 'notificacion-documento-existente';
        notificacion.className = 'notificacion-documento-existente';
        notificacion.innerHTML = `
            <div style="background: #d4edda; border: 2px solid #28a745; border-radius: 8px; padding: 15px; margin: 15px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <i class="fas fa-check-circle" style="color: #28a745; font-size: 24px;"></i>
                    <h3 style="margin: 0; color: #155724; font-size: 16px;">¡Datos Encontrados!</h3>
                </div>
                <p style="margin: 8px 0; color: #155724; font-size: 14px;">
                    <strong>✅ Hemos encontrado tus datos y los hemos cargado automáticamente.</strong>
                </p>
                <p style="margin: 8px 0; color: #155724; font-size: 13px;">
                    ${datos?.nombre ? `📝 Nombre: <strong>${datos.nombre}</strong>` : ''}
                </p>
                <p style="margin: 8px 0; color: #155724; font-size: 13px;">
                    Puedes revisar y actualizar cualquier campo que desees, luego haz clic en "Enviar" para guardar los cambios.
                </p>
            </div>
        `;
        
        // Insertar después del campo de número de documento
        const numeroDocField = document.getElementById('numero_documento');
        numeroDocField.parentNode.insertBefore(notificacion, numeroDocField.nextSibling);
    };

    const ocultarNotificacionDocumentoExistente = () => {
        const notificacion = document.getElementById('notificacion-documento-existente');
        if (notificacion) {
            notificacion.remove();
        }
    };

    // Función para autocompletar TODOS los campos del formulario
    const autocompletarFormularioCompleto = (datos) => {
        if (!datos) return;

        console.log('📝 Autocompletando formulario con datos:', datos);

        // Campos de texto simples
        const camposTexto = {
            'nombre': datos.nombre,
            'tipo_documento': datos.tipo_documento,
            'numero_documento': datos.numero_documento,
            'fecha_nacimiento': datos.fecha_nacimiento,
            'departamento': datos.departamento,
            'direccion': datos.direccion,
            'telefono_principal': datos.telefono_principal,
            'telefono_familiar': datos.telefono_familiar,
            'estado_civil': datos.estado_civil,
            'ocupacion': datos.ocupacion,
            'fondo_pension': datos.fondo_pension
        };

        // Llenar campos de texto y selects
        for (const [campo, valor] of Object.entries(camposTexto)) {
            if (valor !== null && valor !== undefined) {
                const elemento = document.getElementById(campo);
                if (elemento) {
                    elemento.value = valor;
                    // Trigger eventos para validaciones
                    elemento.dispatchEvent(new Event('input', { bubbles: true }));
                    elemento.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log(`✓ Campo ${campo}: ${valor}`);
                }
            }
        }

        // Manejar departamento y ciudad (en orden)
        if (datos.departamento) {
            const deptSelect = document.getElementById('departamento');
            if (deptSelect) {
                deptSelect.value = datos.departamento;
                deptSelect.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Esperar a que se carguen las ciudades y luego seleccionar
                setTimeout(() => {
                    if (datos.ciudad) {
                        const ciudadSelect = document.getElementById('ciudad');
                        if (ciudadSelect) {
                            ciudadSelect.value = datos.ciudad;
                            ciudadSelect.dispatchEvent(new Event('change', { bubbles: true }));
                            console.log(`✓ Ciudad: ${datos.ciudad}`);
                        }
                    }
                }, 100);
            }
        }

        // Campos booleanos/select
        if (datos.tiene_correo !== null && datos.tiene_correo !== undefined) {
            const tieneCorreoSelect = document.getElementById('tiene_correo');
            if (tieneCorreoSelect) {
                tieneCorreoSelect.value = datos.tiene_correo;
                tieneCorreoSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        // Si tiene correo, llenar el campo de correo
        if (datos.correo) {
            // Primero asegurar que el contenedor esté visible
            setTimeout(() => {
                const correoInput = document.getElementById('correo');
                if (correoInput) {
                    correoInput.value = datos.correo;
                    correoInput.dispatchEvent(new Event('input', { bubbles: true }));
                    console.log(`✓ Correo: ${datos.correo}`);
                }
            }, 100);
        }

        // Recibe pensión
        if (datos.recibe_pension !== null && datos.recibe_pension !== undefined) {
            const recibePensionSelect = document.getElementById('recibe_pension');
            if (recibePensionSelect) {
                recibePensionSelect.value = datos.recibe_pension;
                recibePensionSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        // Familia en el extranjero
        if (datos.familia_extranjero !== null && datos.familia_extranjero !== undefined) {
            const familiaSelect = document.getElementById('familia_extranjero');
            if (familiaSelect) {
                familiaSelect.value = datos.familia_extranjero;
                familiaSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        // Mascota
        if (datos.mascota !== null && datos.mascota !== undefined) {
            const mascotaSelect = document.getElementById('mascota');
            if (mascotaSelect) {
                mascotaSelect.value = datos.mascota;
                mascotaSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        // Checkbox de privacidad
        if (datos.privacidad !== null && datos.privacidad !== undefined) {
            const privacidadCheck = document.getElementById('privacidad');
            if (privacidadCheck) {
                privacidadCheck.checked = datos.privacidad;
                privacidadCheck.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        console.log('✅ Formulario autocompletado exitosamente');
    };

    // Función para limpiar el formulario cuando no hay datos
    const limpiarFormulario = () => {
        // No limpiar el número de documento ni el tipo de documento
        const camposAMantener = ['numero_documento', 'tipo_documento'];
        
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (!camposAMantener.includes(input.id)) {
                if (input.type === 'checkbox') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
            }
        });
        
        console.log('🧹 Formulario limpiado (excepto documento)');
    };

    /* VERIFIK - COMENTADO TEMPORALMENTE
    const consultarDatosAutomaticamente = async (numeroDoc, tipoDoc) => {
        try {
            console.log(`🔍 Consultando automáticamente: ${tipoDoc} ${numeroDoc}`);
            
            // Mostrar indicador de carga
            mostrarIndicadorConsulta(true);
            
            const response = await fetch('/api/consultar-datos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    numero_documento: numeroDoc,
                    tipo_documento: tipoDoc
                })
            });

            // Manejar respuestas no-JSON
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                throw new Error('Respuesta inválida del servidor');
            }

            // Manejar error 429
            if (response.status === 429) {
                console.log('⏱️ Límite de consultas alcanzado');
                mostrarMensajeConsulta('⏱️ Límite alcanzado. Completa manualmente.', 'warning');
                return;
            }
            
            if (response.ok && data.success) {
                console.log('✅ Datos encontrados:', data.data);
                autocompletarFormulario(data.data);
                const mensaje = data.fromCache ? 
                    '✅ Datos cargados (caché)' : 
                    '✅ Datos encontrados y cargados';
                mostrarMensajeConsulta(mensaje, 'success');
                lastConsultedDocument = numeroDoc;
            } else {
                console.log('ℹ️ No se encontraron datos para el documento');
                mostrarMensajeConsulta('ℹ️ Documento no encontrado', 'info');
            }
            
        } catch (error) {
            console.error('❌ Error en consulta automática:', error);
            // No mostrar error si es automático, solo log silencioso
        } finally {
            mostrarIndicadorConsulta(false);
        }
    };
    */

    /* VERIFIK - COMENTADO TEMPORALMENTE
    const autocompletarFormulario = (datos) => {
        // Autocompletar campo de nombre si está disponible
        if (datos.nombre) {
            const nombreInput = document.getElementById('nombre');
            if (nombreInput && !nombreInput.value) {
                nombreInput.value = datos.nombre;
                nombreInput.dispatchEvent(new Event('input')); // Trigger validation
            }
        }
        
        // Autocompletar fecha de nacimiento si está disponible
        if (datos.fecha_nacimiento) {
            const fechaInput = document.getElementById('fecha_nacimiento');
            if (fechaInput && !fechaInput.value) {
                fechaInput.value = datos.fecha_nacimiento;
                fechaInput.dispatchEvent(new Event('change')); // Trigger validation
            }
        }
        
        // Se pueden agregar más campos aquí según lo que devuelva Verifik
    };
    */

    /* VERIFIK - COMENTADO TEMPORALMENTE
    const mostrarIndicadorConsulta = (mostrar) => {
        let indicator = document.getElementById('consulta-indicator');
        
        if (mostrar && !indicator) {
            // Crear indicador si no existe
            indicator = document.createElement('div');
            indicator.id = 'consulta-indicator';
            indicator.innerHTML = '🔍 Consultando...';
            indicator.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                background: #e3f2fd;
                color: #1976d2;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
                border: 1px solid #bbdefb;
                animation: pulse 1.5s infinite;
            `;
            numeroDocumentoInput.parentNode.style.position = 'relative';
            numeroDocumentoInput.parentNode.appendChild(indicator);
        } else if (!mostrar && indicator) {
            indicator.remove();
        }
    };
    */

    /* VERIFIK - COMENTADO TEMPORALMENTE
    const mostrarMensajeConsulta = (mensaje, tipo) => {
        let messageDiv = document.getElementById('consulta-message');
        
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'consulta-message';
            numeroDocumentoInput.parentNode.appendChild(messageDiv);
        }
        
        const colores = {
            success: '#4caf50',
            info: '#2196f3',
            warning: '#ff9800'
        };
        
        messageDiv.innerHTML = mensaje;
        messageDiv.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            background: ${colores[tipo] || '#2196f3'};
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            margin-top: 2px;
        `;
        
        // Auto-ocultar después de 4 segundos
        setTimeout(() => {
            if (messageDiv) messageDiv.remove();
        }, 4000);
    };
    */

    // Always enforce numeric input AND auto-consulta con Verifik
    numeroDocumentoInput.addEventListener('input', handleDocumentInput);

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
    if (giveawayPopup) {
        giveawayPopup.classList.remove('hidden');
    }

    if (closePopupBtn && giveawayPopup) {
        closePopupBtn.addEventListener("click", () => {
            giveawayPopup.classList.add("hidden");
        });
    }

    if (closeModalBtn && successModal) {
        closeModalBtn.addEventListener("click", () => {
            successModal.classList.remove("visible");
        });
    }

    // --- INICIALIZACIÓN DE FLATPCIKR ---
    flatpickr('input[type="date"]', {
        "locale": "es",
        dateFormat: "Y-m-d",
    });

    // --- VALIDACIÓN DE EDAD ---
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

        // Asegurarse de que los checkboxes y selects envíen valores booleanos (true/false)
        data.privacidad = formData.has('privacidad');
        data.familia_extranjero = (formData.get('familia_extranjero') === 'Si');
        data.mascota = (formData.get('mascota') === 'Si');
        data.tiene_correo = (formData.get('tiene_correo') === 'Si');

        // Procesar recibe_pension como booleano solo para 'Si' y 'No'
        if (formData.get('recibe_pension') === 'Si') {
            data.recibe_pension = true;
        } else if (formData.get('recibe_pension') === 'No') {
            data.recibe_pension = false;
        } else {
            data.recibe_pension = formData.get('recibe_pension'); // En trámite, Sustitución pensional, etc.
        }

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
                    // Si el cuerpo no es JSON (ej. una página de error 404 en HTML),
                    // mostramos un mensaje genérico para ese caso.
                    if (response.status === 404) {
                        errorMessage = "Error: No se pudo encontrar el servicio de envío (404). Verifica que la función de Vercel se haya desplegado correctamente.";
                    }
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();

            // Éxito al enviar
            // Mostrar mensaje personalizado según si fue actualización o creación
            if (result.action === 'updated') {
                modalMessage.innerHTML = `
                    <div style="text-align: center;">
                        <p style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">✅ ${result.message}</p>
                        <p style="font-size: 14px; color: #666;">Tus datos ya estaban en nuestro sistema y han sido actualizados correctamente.</p>
                    </div>
                `;
            } else {
                modalMessage.innerHTML = `
                    <div style="text-align: center;">
                        <p style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">✅ ${result.message}</p>
                        <p style="font-size: 14px; color: #666;">Hemos registrado tu información exitosamente.</p>
                    </div>
                `;
            }
            
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

    // ===== FUNCIONALIDAD SECCIÓN DE CONSULTA SEPARADA CON VERIFIK (COMENTADA TEMPORALMENTE) =====
    
    /* VERIFIK - COMENTADO TEMPORALMENTE
    
    // Validación numérica para el campo de consulta
    if (consultaNumeroDoc) {
        consultaNumeroDoc.addEventListener('input', (event) => {
            event.target.value = event.target.value.replace(/[^0-9]/g, '');
        });
    }

    // Función principal de consulta
    const realizarConsulta = async () => {
        // Usar "CC" por defecto si no hay selección de tipo (campo comentado en HTML)
        const tipoDoc = consultaTipoDoc?.value || "CC";
        const numeroDoc = consultaNumeroDoc?.value;

        // Validaciones básicas
        if (!numeroDoc) {
            mostrarResultadoConsulta('⚠️ Por favor ingresa el número de documento', 'error');
            return;
        }

        if (numeroDoc.length < 6) {
            mostrarResultadoConsulta('⚠️ El número de documento debe tener al menos 6 dígitos', 'error');
            return;
        }

        try {
            // Deshabilitar botón durante la consulta
            btnConsultar.disabled = true;
            btnConsultar.textContent = '🔍 Consultando...';
            
            mostrarResultadoConsulta('🔍 Buscando información en registros oficiales...', 'info');

            const response = await fetch('/api/consultar-datos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    numero_documento: numeroDoc,
                    tipo_documento: tipoDoc
                })
            });

            // Manejar respuestas no-JSON (como HTML de error)
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // Si no es JSON, probablemente es un error del servidor
                throw new Error('El servidor devolvió una respuesta inválida');
            }

            // Manejar error 429 específicamente
            if (response.status === 429) {
                const retryAfter = data.retryAfter || 60;
                mostrarResultadoConsulta(
                    `⏱️ <strong>Límite de consultas alcanzado</strong><br>
                    ${data.details || 'Por favor espera un momento e intenta nuevamente.'}<br>
                    <em>Puedes continuar llenando el formulario manualmente.</em>`,
                    'warning'
                );
                return;
            }

            if (response.ok && data.success) {
                // Datos encontrados - Mostrar información más detallada
                const nombre = data.data.nombre || 'No disponible';
                const nombres = data.data.nombres || '';
                const apellidos = data.data.apellidos || '';
                const fechaNac = data.data.fecha_nacimiento || 'No disponible';
                const verificadoEn = data.data.verificado_en || '';
                const verificadoPor = data.data.certificado_por || 'Verifik.co';
                
                const mensaje = `✅ <strong>Información encontrada en registros oficiales:</strong><br>
                    👤 <strong>Nombre completo:</strong> ${nombre}<br>
                    ${nombres ? `📝 <strong>Nombres:</strong> ${nombres}<br>` : ''}
                    ${apellidos ? `📝 <strong>Apellidos:</strong> ${apellidos}<br>` : ''}
                    ${fechaNac !== 'No disponible' ? `📅 <strong>Fecha de nacimiento:</strong> ${fechaNac}<br>` : ''}
                    ${verificadoEn ? `🕒 <strong>Verificado:</strong> ${verificadoEn}<br>` : ''}
                    🏛️ <strong>Fuente:</strong> ${verificadoPor}<br>
                    <br>
                    <em>✨ Los datos se han completado automáticamente abajo ⬇️</em>`;
                    
                mostrarResultadoConsulta(mensaje, 'success');
                
                // Auto-completar los campos del formulario principal
                autoCompletarFormularioPrincipal(data.data, numeroDoc, tipoDoc);
                
            } else {
                // No se encontraron datos
                mostrarResultadoConsulta(
                    `ℹ️ <strong>Documento no encontrado en los registros oficiales.</strong><br>
                    Puedes continuar llenando el formulario completo manualmente.`,
                    'info'
                );
                
                // Auto-scroll al campo de nombre después de 1.5 segundos
                setTimeout(() => {
                    const nombreInput = document.getElementById('nombre');
                    if (nombreInput) {
                        nombreInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        nombreInput.focus();
                    }
                }, 1500);
            }

        } catch (error) {
            console.error('Error en consulta:', error);
            mostrarResultadoConsulta(
                '❌ <strong>Error al consultar la información.</strong><br>Por favor intenta nuevamente o continúa con el registro manual.',
                'error'
            );
        } finally {
            // Restaurar botón
            btnConsultar.disabled = false;
            btnConsultar.textContent = 'Consultar';
        }
    };

    const autoCompletarFormularioPrincipal = (datos, numeroDoc, tipoDoc) => {
        // Autocompletar campo de nombre en el formulario principal
        if (datos.nombre) {
            const nombreInput = document.getElementById('nombre');
            if (nombreInput) {
                nombreInput.value = datos.nombre;
                nombreInput.dispatchEvent(new Event('input'));
            }
        }
        
        // Autocompletar fecha de nacimiento en el formulario principal
        if (datos.fecha_nacimiento) {
            const fechaInput = document.getElementById('fecha_nacimiento');
            if (fechaInput) {
                fechaInput.value = datos.fecha_nacimiento;
                fechaInput.dispatchEvent(new Event('change'));
            }
        }
        
        // Autocompletar tipo y número de documento en el formulario principal
        const tipoDocumentoSelect = document.getElementById('tipo_documento');
        const numeroDocumentoInput = document.getElementById('numero_documento');
        
        if (tipoDocumentoSelect && tipoDoc) {
            tipoDocumentoSelect.value = tipoDoc;
            tipoDocumentoSelect.dispatchEvent(new Event('change'));
        }
        
        if (numeroDocumentoInput && numeroDoc) {
            numeroDocumentoInput.value = numeroDoc;
            numeroDocumentoInput.dispatchEvent(new Event('input'));
        }
        
        // Scroll suave hacia el formulario después de 1 segundo
        setTimeout(() => {
            const nombreInput = document.getElementById('nombre');
            if (nombreInput) {
                nombreInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 1000);
    };

    const mostrarResultadoConsulta = (mensaje, tipo) => {
        if (consultaResultado) {
            consultaResultado.innerHTML = mensaje;
            consultaResultado.className = `consulta-resultado ${tipo}`;
            consultaResultado.classList.remove('hidden');
            
            // Auto-ocultar mensajes de error después de 8 segundos
            if (tipo === 'error') {
                setTimeout(() => {
                    consultaResultado.classList.add('hidden');
                }, 8000);
            }
        }
    };

    // Event listener para el botón de consulta
    if (btnConsultar) {
        btnConsultar.addEventListener('click', realizarConsulta);
    }

    // Event listener para Enter en el campo de número
    if (consultaNumeroDoc) {
        consultaNumeroDoc.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                realizarConsulta();
            }
        });
    }
    
    FIN VERIFIK - COMENTADO TEMPORALMENTE */

});