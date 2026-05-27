document.addEventListener('DOMContentLoaded', () => {
    initKernel();
});

function initKernel() {
    const nombre = sessionStorage.getItem('usuario_nombre') || '';
    const cargo = sessionStorage.getItem('usuario_cargo') || '';
    const rol = sessionStorage.getItem('usuario_rol') || '';
    
    let permisos = [];
    try {
        permisos = JSON.parse(sessionStorage.getItem('usuario_permisos') || '[]');
    } catch (e) {
        permisos = [];
    }

    if (document.getElementById('txtNombreUsuario')) {
        document.getElementById('txtNombreUsuario').innerText = nombre;
    }
    if (document.getElementById('txtCargoUsuario')) {
        document.getElementById('txtCargoUsuario').innerHTML = `<i class="bi bi-briefcase-fill me-1"></i> ${cargo}`;
    }

    renderizarMenuPorPermisos(rol, permisos);
    cargarBandejaPrincipal();
}

function renderizarMenuPorPermisos(rol, permisos) {
    const menu = document.getElementById('menu-lateral');
    if (!menu) return;

    let html = `
        <a href="#" class="list-group-item list-group-item-action active" id="lnk-dashboard">
            <i class="bi bi-mailbox2 me-2"></i> Bandeja de Entrada
        </a>
    `;

    // 1. Creador / Jefe Inmediato
    if (rol === 'JEFE_INMEDIATO' || permisos.includes('CREAR_BORRADOR')) {
        html += `
            <a href="#" class="list-group-item list-group-item-action" id="lnk-crear-puesto">
                <i class="bi bi-file-earmark-plus-fill me-2"></i> Nuevo Descriptor
            </a>
        `;
    }

    // 2. Gerente General / Jefe Superior
    if (rol === 'JEFE_SUPERIOR' || permisos.includes('APROBAR_JEFE_SUPERIOR')) {
        html += `
            <a href="#" class="list-group-item list-group-item-action" id="lnk-aprobaciones">
                <i class="bi bi-check2-square me-2"></i> Pendientes de Firma
            </a>
        `;
    }

    // 3 y 4. Talento Humano
    if (rol === 'TALENTO_HUMANO_REVISOR' || rol === 'JEFE_TALENTO_HUMANO' || permisos.includes('EDITAR_INTEGRADO')) {
        html += `
            <a href="#" class="list-group-item list-group-item-action" id="lnk-revision-th">
                <i class="bi bi-file-earmark-medical-fill me-2"></i> Revisión Técnica TH
            </a>
        `;
    }

    // 5. NUEVO: Empleado / Titular del Puesto (Firma de aceptación)
    if (rol === 'COLABORADOR' || permisos.includes('FIRMA_DIGITAL_TITULAR')) {
        html += `
            <a href="#" class="list-group-item list-group-item-action" id="lnk-firma-titular">
                <i class="bi bi-pen-fill me-2"></i> Mis Descriptores (Firma)
            </a>
        `;
    }

    menu.innerHTML = html;
    asignarManejadoresEventos();
}

function asignarManejadoresEventos() {
    const limpiarActive = (target) => {
        document.querySelectorAll('#menu-lateral .list-group-item').forEach(el => el.classList.remove('active'));
        target.classList.add('active');
    };

    const lnkDashboard = document.getElementById('lnk-dashboard');
    if (lnkDashboard) {
        lnkDashboard.addEventListener('click', function(e) {
            e.preventDefault();
            limpiarActive(this);
            cargarBandejaPrincipal();
        });
    }

    const btnCrear = document.getElementById('lnk-crear-puesto');
    if (btnCrear) {
        btnCrear.addEventListener('click', async function(e) {
            e.preventDefault();
            limpiarActive(this);
            try {
                const { descriptorController } = await import('./modulos/frmDescriptor/controller/descriptorController.js');
                descriptorController.inicializar('NUEVO_BORRADOR');
            } catch (err) {
                notificarErrorCarga(err.message);
            }
        });
    }

    // Evento para capturar el click del Empleado/Titular
    const btnFirmaTitular = document.getElementById('lnk-firma-titular');
    if (btnFirmaTitular) {
        btnFirmaTitular.addEventListener('click', function(e) {
            e.preventDefault();
            limpiarActive(this);
            cargarBandejaFirmaEmpleado();
        });
    }
}

function cargarBandejaPrincipal() {
    const area = document.getElementById('content-area');
    if (!area) return;
    const cargo = sessionStorage.getItem('usuario_cargo') || 'Usuario';
    
    area.innerHTML = `
        <div class="card border-0 shadow-sm p-4 bg-white rounded animate-fade-in">
            <h4 class="fw-bold text-secondary mb-1">Bandeja de Gestión de Puestos</h4>
            <p class="text-muted small">Flujo institucional para el control de la estructura organizativa UEES.</p>
            <hr>
            <div class="alert alert-light border border-info d-flex align-items-center mt-3" role="alert">
                <i class="bi bi-info-circle-fill text-info fs-4 me-3"></i>
                <div>
                    <strong>Sesión Inicializada Con Éxito:</strong> Bienvenido al portal, actualmente estás navegando con el cargo de: <code>${cargo}</code>.
                    Selecciona una opción del menú de la izquierda para interactuar con las pantallas del flujo.
                </div>
            </div>
        </div>
    `;
}

function cargarBandejaFirmaEmpleado() {
    const area = document.getElementById('content-area');
    if (!area) return;

    area.innerHTML = `
        <div class="card border-0 shadow-sm p-4 bg-white rounded animate-fade-in">
            <h4 class="fw-bold text-secondary mb-1"><i class="bi bi-pen-fill text-primary me-2"></i>Descriptores Pendientes de Mi Firma</h4>
            <p class="text-muted small">Como titular del puesto, debe validar y firmar de conformidad el perfil integrado una vez aprobado por Talento Humano.</p>
            <hr>
            <div class="table-responsive mt-3">
                <table class="table table-hover align-middle border">
                    <thead class="table-light text-secondary small text-uppercase">
                        <tr>
                            <th>Código</th>
                            <th>Descriptor de Puesto</th>
                            <th>Origen / Solicitante</th>
                            <th>Estado Actual</th>
                            <th class="text-center">Acción</th>
                        </tr>
                    </thead>
                    <tbody class="small">
                        <tr>
                            <td><span class="fw-bold text-primary">DP-2026-001</span></td>
                            <td><strong>Analista Programador</strong></td>
                            <td>Subgerencia de Tecnología de Información</td>
                            <td><span class="badge bg-info text-dark">PENDIENTE FIRMA TITULAR</span></td>
                            <td class="text-center">
                                <button class="btn btn-sm btn-primary fw-bold" onclick="alert('Cargando visor del descriptor integrado oficial para su firma...')">
                                    Ver y Firmar <i class="bi bi-pencil-square ms-1"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function notificarErrorCarga(msg) {
    const area = document.getElementById('content-area');
    if (!area) return;
    area.innerHTML = `
        <div class="alert alert-warning border-0 shadow-sm p-4" role="alert">
            <h5 class="fw-bold text-danger"><i class="bi bi-cone-striped me-2"></i>Controlador No Detectado</h5>
            <p class="mb-0 small text-muted">El archivo físico del controlador de formularios no se encuentra o contiene errores sintácticos.</p>
            <small class="d-block mt-2 text-secondary"><strong>Logs:</strong> ${msg}</small>
        </div>
    `;
}