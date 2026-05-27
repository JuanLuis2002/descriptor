import { descriptorService } from '../services/descriptorService.js';

let countClaves = 0;
let countSecundarias = 0;

export const descriptorController = {
    inicializar: async (accionContexto) => {
        const contentArea = document.getElementById('content-area');
        
        try {
            const response = await fetch('js/modulos/frmDescriptor/view/formCorto.html');
            if (!response.ok) throw new Error('No se pudo mapear la vista física HTML del componente.');
            
            contentArea.innerHTML = await response.text();
            
            // Inicializar contadores locales
            countClaves = 0;
            countSecundarias = 0;

            // Enlazar los disparadores del DOM
            descriptorController.enlazarEventosUI();

            // Inyectar ítems de arranque predeterminados (como viene en tu documento de 1 a 3 ítems base)
            for(let i=0; i<3; i++) {
                descriptorController.agregarInputFuncion('CLAVE');
                descriptorController.agregarInputFuncion('SECUNDARIA');
            }
            descriptorController.agregarFilaKPI();
            descriptorController.agregarFilaCompetencia();

        } catch (error) {
            contentArea.innerHTML = `
                <div class="alert alert-danger border-0 shadow-sm p-4">
                    <h5 class="fw-bold"><i class="bi bi-bug-fill me-2"></i>Fallo de Enlace Modular</h5>
                    <p class="mb-0 small">${error.message}</p>
                </div>
            `;
        }
    },

    enlazarEventosUI: () => {
        document.getElementById('btnFncClave').addEventListener('click', () => descriptorController.agregarInputFuncion('CLAVE'));
        document.getElementById('btnFncSecundaria').addEventListener('click', () => descriptorController.agregarInputFuncion('SECUNDARIA'));
        document.getElementById('btnAgregarKPI').addEventListener('click', () => descriptorController.agregarFilaKPI());
        document.getElementById('btnAgregarComp').addEventListener('click', () => descriptorController.agregarFilaCompetencia());
        
        document.getElementById('btnRegresarBandeja').addEventListener('click', () => {
            document.getElementById('lnk-dashboard').click();
        });

        // Captura del Formulario y cambio de Estado inmediato en el Flujo
        document.getElementById('formDescriptor2026').addEventListener('submit', (e) => {
            e.preventDefault();

            // Recopilar bloque Funciones Claves
            const listaClaves = [];
            document.querySelectorAll('.input-fnc-clave').forEach((el, idx) => {
                if(el.value.trim() !== "") {
                    listaClaves.push({ CORR_FUNCION: idx + 1, DESCRIPCION: el.value.trim(), TIPO: 'CLAVE' });
                }
            });

            // Recopilar bloque Funciones Secundarias
            const listaSecundarias = [];
            document.querySelectorAll('.input-fnc-secundaria').forEach((el, idx) => {
                if(el.value.trim() !== "") {
                    listaSecundarias.push({ CORR_FUNCION: idx + 1, DESCRIPCION: el.value.trim(), TIPO: 'SECUNDARIA' });
                }
            });

            // Recopilar KPIs
            const listaKPIs = [];
            document.querySelectorAll('.tr-kpi-row').forEach((tr, idx) => {
                const desc = tr.querySelector('.kpi-desc').value.trim();
                const meta = tr.querySelector('.kpi-meta').value.trim();
                if(desc !== "") {
                    listaKPIs.push({ CORR_INDICADOR: idx + 1, INDICADOR: desc, FRECUENCIA_META: meta });
                }
            });

            // Recopilar Competencias
            const listaCompetencias = [];
            document.querySelectorAll('.tr-comp-row').forEach((tr, idx) => {
                const nombre = tr.querySelector('.comp-nombre').value.trim();
                const nivel = tr.querySelector('.comp-nivel').value;
                if(nombre !== "") {
                    listaCompetencias.push({ CORR_COMPETENCIA: idx + 1, COMPETENCIA: nombre, NIVEL_DOMINIO: nivel });
                }
            });

            // Ensamblar Payload Estructurado
            const proposalPayload = {
                NOMBRE_PUESTO: document.getElementById('NOMBRE_PUESTO').value.trim(),
                SUPERVISA_A: document.getElementById('SUPERVISA_A').value.trim(),
                MODALIDAD_TRABAJO: document.getElementById('MODALIDAD_TRABAJO').value,
                IMPACTO_ECONOMICO: document.getElementById('IMPACTO_ECONOMICO').value,
                PERFIL_EDAD: document.getElementById('PERFIL_EDAD').value.trim(),
                INDUCCION_DURACION: document.getElementById('INDUCCION_DURACION').value.trim(),
                INDUCCION_RESPONSABLE: document.getElementById('INDUCCION_RESPONSABLE').value.trim(),
                OBJETIVO_PUESTO: document.getElementById('OBJETIVO_PUESTO').value.trim(),
                REQUISITO_EDUCACION: document.getElementById('REQUISITO_EDUCACION').value.trim(),
                REQUISITO_EXPERIENCIA: document.getElementById('REQUISITO_EXPERIENCIA').value.trim(),
                funcionesClaves: listaClaves,
                funcionesSecundarias: listaSecundarias,
                indicadores: listaKPIs,
                competencias: listaCompetencias
            };

            // Mandar al servicio para persistencia local
            descriptorService.registrarPropuestaPaso1(proposalPayload);

            alert("¡Propuesta enviada exitosamente al Gerente General (Dr. Roberto Chang) para revisión y firma de autorización!");
            document.getElementById('lnk-dashboard').click();
        });
    },

    agregarInputFuncion: (tipo) => {
        const isClave = tipo === 'CLAVE';
        const container = document.getElementById(isClave ? 'boxFuncionesClaves' : 'boxFuncionesSecundarias');
        if (isClave) countClaves++; else countSecundarias++;
        const currentCount = isClave ? countClaves : countSecundarias;

        const div = document.createElement('div');
        div.className = 'd-flex align-items-center gap-2 animate-fade-in';
        div.innerHTML = `
            <span class="badge bg-light text-secondary border fw-bold px-2">${currentCount}</span>
            <input type="text" class="form-control form-control-sm ${isClave ? 'input-fnc-clave' : 'input-fnc-secundaria'}" required placeholder="Describa la función...">
            <button type="button" class="btn btn-sm btn-link text-danger p-0" onclick="this.parentElement.remove()"><i class="bi bi-trash3-fill"></i></button>
        `;
        container.appendChild(div);
    },

    agregarFilaKPI: () => {
        const tbody = document.getElementById('tbodyKPIs');
        const tr = document.createElement('tr');
        tr.className = 'tr-kpi-row animate-fade-in';
        tr.innerHTML = `
            <td><input type="text" class="form-control form-control-sm kpi-desc" required placeholder="Ej. Resolución de incidencias"></td>
            <td><input type="text" class="form-control form-control-sm kpi-meta" required placeholder="Ej. Mensual / 95%"></td>
            <td class="text-center"><button type="button" class="btn btn-sm text-danger p-0 border-0 bg-transparent" onclick="this.closest('tr').remove()"><i class="bi bi-x-circle-fill"></i></button></td>
        `;
        tbody.appendChild(tr);
    },

    agregarFilaCompetencia: () => {
        const tbody = document.getElementById('tbodyCompetencias');
        const tr = document.createElement('tr');
        tr.className = 'tr-comp-row animate-fade-in';
        tr.innerHTML = `
            <td><input type="text" class="form-control form-control-sm comp-nombre" required placeholder="Ej. C# / ASP.NET Core / SQL Server"></td>
            <td>
                <select class="form-select form-select-sm comp-nivel">
                    <option value="Alto">Alto (A)</option>
                    <option value="Medio">Medio (M)</option>
                    <option value="Bajo">Bajo (B)</option>
                </select>
            </td>
            <td class="text-center"><button type="button" class="btn btn-sm text-danger p-0 border-0 bg-transparent" onclick="this.closest('tr').remove()"><i class="bi bi-x-circle-fill"></i></button></td>
        `;
        tbody.appendChild(tr);
    }
};