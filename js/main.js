// Variable global para el usuario actual
let currentUser = null;
let currentPage = 'dashboard';

// Inicialización
$(document).ready(function() {
    // Verificar autenticación
    checkAuth();
    
    // Cargar usuario actual
    loadCurrentUser();
    
    // Configurar eventos
    setupEventListeners();
    
    // Cargar página inicial
    loadPage('dashboard');
});

// Verificar autenticación
function checkAuth() {
    const userStr = sessionStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'login.html';
        return;
    }
    currentUser = JSON.parse(userStr);
}

// Cargar usuario actual en la interfaz
function loadCurrentUser() {
    if (!currentUser) return;
    
    // Sidebar
    $('#userInfoSidebar').html(`
        <strong>${currentUser.nombre}</strong>
        <small>${currentUser.rolNombre}</small>
        <small>${currentUser.area}</small>
    `);
    
    // Top navbar
    $('#userNameDisplay').text(currentUser.nombre);
    $('#userRoleBadge').text(currentUser.rolNombre).addClass(`role-${currentUser.rol}`);
}

// Configurar eventos
function setupEventListeners() {
    // Toggle sidebar
    $('#toggleSidebar').click(function() {
        $('.sidebar').toggleClass('collapsed');
        $('.main-content').toggleClass('expanded');
    });
    
    // Navegación
    $('.sidebar-nav .nav-link').click(function(e) {
        e.preventDefault();
        const page = $(this).data('page');
        if (page) {
            loadPage(page);
            $('.sidebar-nav .nav-link').removeClass('active');
            $(this).addClass('active');
        }
    });
    
    // Logout
    $('#btnLogout').click(function(e) {
        e.preventDefault();
        Swal.fire({
            title: '¿Cerrar sesión?',
            text: '¿Estás seguro de que deseas salir?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                sessionStorage.clear();
                window.location.href = 'login.html';
            }
        });
    });
}

// Cargar página
function loadPage(page) {
    currentPage = page;
    const titles = {
        'dashboard': 'Dashboard Principal',
        'descriptores': 'Gestión de Descriptores',
        'crear-descriptor': 'Nuevo Descriptor de Puesto',
        'competencias': 'Diccionario de Competencias',
        'mi-perfil': 'Mi Perfil'
    };
    $('#pageTitle').text(titles[page] || 'Sistema');
    
    // Cargar contenido según la página
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'descriptores':
            loadDescriptores();
            break;
        case 'crear-descriptor':
            loadCrearDescriptor();
            break;
        case 'competencias':
            loadCompetencias();
            break;
        case 'mi-perfil':
            loadMiPerfil();
            break;
        default:
            loadDashboard();
    }
}

// Cargar Dashboard
function loadDashboard() {
    const descriptors = getDescriptors();
    const userRole = currentUser.rol;
    
    let stats = {
        total: descriptors.length,
        pendientes: descriptors.filter(d => d.estado === 'BORRADOR' || d.estado === 'ENVIADO_TH' || d.estado === 'OBSERVADO').length,
        activos: descriptors.filter(d => d.estado === 'ACTIVO' || d.estado === 'FIRMADO').length,
        miArea: descriptors.filter(d => d.area === currentUser.area).length
    };
    
    const html = `
        <div class="row">
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="stat-icon" style="background: #e3f2fd; color: #0d6efd;">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${stats.total}</h3>
                        <p>Total Descriptores</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="stat-icon" style="background: #fff3e0; color: #ffc107;">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${stats.pendientes}</h3>
                        <p>Pendientes</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="stat-icon" style="background: #e8f5e9; color: #198754;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${stats.activos}</h3>
                        <p>Activos / Firmados</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="stat-icon" style="background: #fce4ec; color: #dc3545;">
                        <i class="fas fa-building"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${stats.miArea}</h3>
                        <p>Mi Área</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-md-8">
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-list me-2"></i>Descriptores Recientes
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover" id="recentDescriptorsTable">
                            <thead>
                                <tr><th>ID</th><th>Puesto</th><th>Área</th><th>Estado</th><th>Versión</th><th>Acciones</th></tr>
                            </thead>
                            <tbody>
                                ${descriptors.slice(0, 5).map(d => `
                                    <tr>
                                        <td>${d.id}</td>
                                        <td>${d.puesto}</td>
                                        <td>${d.area}</td>
                                        <td><span class="status-badge status-${d.estado.toLowerCase()}">${d.estado}</span></td>
                                        <td>v${d.version}</td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="viewDescriptor(${d.id})">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-chart-line me-2"></i>Flujo de Trabajo
                    </div>
                    <div class="timeline">
                        <div class="timeline-item ${getWorkflowStatus('creacion')}">
                            <div class="timeline-date">Paso 1</div>
                            <div class="timeline-title">Creación del Descriptor</div>
                        </div>
                        <div class="timeline-item ${getWorkflowStatus('aprobacion_jefe')}">
                            <div class="timeline-date">Paso 2</div>
                            <div class="timeline-title">Aprobación Jefe Superior</div>
                        </div>
                        <div class="timeline-item ${getWorkflowStatus('revision_th')}">
                            <div class="timeline-date">Paso 3</div>
                            <div class="timeline-title">Revisión Talento Humano</div>
                        </div>
                        <div class="timeline-item ${getWorkflowStatus('firmas')}">
                            <div class="timeline-date">Paso 4</div>
                            <div class="timeline-title">Firmas Digitales</div>
                        </div>
                    </div>
                </div>
                
                <div class="form-section mt-3">
                    <div class="form-section-title">
                        <i class="fas fa-bell me-2"></i>Notificaciones
                    </div>
                    <div id="notificationsList">
                        <p class="text-muted text-center">No hay notificaciones nuevas</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    $('#contentContainer').html(html);
    
    // Inicializar tabla
    if ($.fn.DataTable) {
        $('#recentDescriptorsTable').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
            },
            pageLength: 5,
            searching: false,
            paging: false,
            info: false
        });
    }
}

// Cargar Descriptores
function loadDescriptores() {
    const descriptors = getDescriptors();
    const userRole = currentUser.rol;
    
    // Filtrar según rol
    let filteredDescriptors = descriptors;
    if (userRole === 'JEFE_INMEDIATO') {
        filteredDescriptors = descriptors.filter(d => d.creador === currentUser.nombre);
    } else if (userRole === 'COLABORADOR') {
        filteredDescriptors = descriptors.filter(d => d.titular === currentUser.nombre);
    }
    
    const html = `
        <div class="form-section">
            <div class="form-section-title">
                <i class="fas fa-file-alt me-2"></i>Lista de Descriptores de Puesto
                <button class="btn btn-primary btn-sm float-end" onclick="loadPage('crear-descriptor')">
                    <i class="fas fa-plus"></i> Nuevo Descriptor
                </button>
            </div>
            <div class="table-responsive">
                <table class="table table-hover" id="descriptoresTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Código</th>
                            <th>Puesto</th>
                            <th>Área</th>
                            <th>Versión</th>
                            <th>Fecha Emisión</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredDescriptors.map(d => `
                            <tr>
                                <td>${d.id}</td>
                                <td>DES-${d.id.toString().padStart(4, '0')}</td>
                                <td>${d.puesto}</td>
                                <td>${d.area}</td>
                                <td>v${d.version}</td>
                                <td>${d.fechaEmision}</td>
                                <td><span class="status-badge status-${d.estado.toLowerCase()}">${getEstadoNombre(d.estado)}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-info" onclick="viewDescriptor(${d.id})" title="Ver">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    ${canEditDescriptor(d) ? `<button class="btn btn-sm btn-warning" onclick="editDescriptor(${d.id})" title="Editar"><i class="fas fa-edit"></i></button>` : ''}
                                    ${canApproveDescriptor(d) ? `<button class="btn btn-sm btn-success" onclick="approveDescriptor(${d.id})" title="Aprobar"><i class="fas fa-check"></i></button>` : ''}
                                    ${canSignDescriptor(d) ? `<button class="btn btn-sm btn-primary" onclick="signDescriptor(${d.id})" title="Firmar"><i class="fas fa-signature"></i></button>` : ''}
                                 </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    $('#contentContainer').html(html);
    
    if ($.fn.DataTable) {
        $('#descriptoresTable').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
            },
            pageLength: 10
        });
    }
}

// Cargar formulario de creación de descriptor
function loadCrearDescriptor() {
    const html = `
        <form id="descriptorForm">
            <div class="form-section">
                <div class="form-section-title">
                    <i class="fas fa-info-circle me-2"></i>I. Generalidades del Puesto
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Título del Puesto *</label>
                        <input type="text" class="form-control" name="puesto" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Área / Departamento *</label>
                        <input type="text" class="form-control" name="area" required value="${currentUser.area}">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Puesto al que reporta *</label>
                        <input type="text" class="form-control" name="reportaA" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">N° de Personal a cargo</label>
                        <input type="number" class="form-control" name="personalCargo" value="0">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Fecha de Emisión</label>
                        <input type="date" class="form-control" name="fechaEmision" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <div class="form-section-title">
                    <i class="fas fa-bullseye me-2"></i>II. Objetivo del Puesto
                </div>
                <textarea class="form-control" name="objetivo" rows="4" placeholder="Describa el objetivo general del puesto..." required></textarea>
            </div>
            
            <div class="form-section">
                <div class="form-section-title">
                    <i class="fas fa-tasks me-2"></i>III. Funciones Claves (4-6)
                </div>
                <div id="funcionesClavesContainer">
                    ${[1,2,3,4].map(i => `
                        <div class="card mb-3">
                            <div class="card-body">
                                <div class="mb-3">
                                    <label class="form-label">Función Clave ${i}</label>
                                    <input type="text" class="form-control" name="funcionClave${i}" placeholder="Nombre de la función">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Actividades</label>
                                    <textarea class="form-control" name="actividades${i}" rows="3" placeholder="Lista de actividades asociadas"></textarea>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button type="button" class="btn btn-sm btn-secondary" onclick="addFuncionClave()">
                    <i class="fas fa-plus"></i> Agregar Función Clave
                </button>
            </div>
            
            <div class="form-section">
                <div class="form-section-title">
                    <i class="fas fa-chart-simple me-2"></i>IV. Indicadores de Desempeño (KPIs)
                </div>
                <div id="kpisContainer">
                    ${[1,2,3].map(i => `
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <input type="text" class="form-control" name="kpi${i}" placeholder="Indicador ${i}">
                            </div>
                            <div class="col-md-4">
                                <select class="form-select" name="frecuencia${i}">
                                    <option value="">Seleccione frecuencia</option>
                                    <option value="Diaria">Diaria</option>
                                    <option value="Semanal">Semanal</option>
                                    <option value="Mensual">Mensual</option>
                                    <option value="Trimestral">Trimestral</option>
                                    <option value="Semestral">Semestral</option>
                                    <option value="Anual">Anual</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                <input type="text" class="form-control" name="meta${i}" placeholder="Meta">
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button type="button" class="btn btn-sm btn-secondary" onclick="addKPI()">
                    <i class="fas fa-plus"></i> Agregar KPI
                </button>
            </div>
            
            <div class="form-section">
                <div class="form-section-title">
                    <i class="fas fa-user-graduate me-2"></i>Perfil del Puesto
                </div>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <label class="form-label">Edad Mínima</label>
                        <input type="number" class="form-control" name="edadMin" value="18">
                    </div>
                    <div class="col-md-4 mb-3">
                        <label class="form-label">Edad Máxima</label>
                        <input type="number" class="form-control" name="edadMax" value="65">
                    </div>
                    <div class="col-md-4 mb-3">
                        <label class="form-label">Sexo</label>
                        <select class="form-select" name="sexo">
                            <option value="INDIFERENTE">Indiferente</option>
                            <option value="MASCULINO">Masculino</option>
                            <option value="FEMENINO">Femenino</option>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12 mb-3">
                        <label class="form-label">Requisitos Académicos</label>
                        <div id="educacionContainer">
                            <div class="row mb-2">
                                <div class="col-md-6"><input type="text" class="form-control" placeholder="Requisito" name="eduRequisito1"></div>
                                <div class="col-md-4"><input type="text" class="form-control" placeholder="Especificaciones" name="eduEspec1"></div>
                                <div class="col-md-2">
                                    <select class="form-select" name="eduReq1">
                                        <option value="1">Requerido</option>
                                        <option value="0">Deseable</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="addEducacion()">
                            <i class="fas fa-plus"></i> Agregar Requisito
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="text-end">
                <button type="button" class="btn btn-secondary" onclick="loadPage('descriptores')">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar como Borrador</button>
            </div>
        </form>
    `;
    
    $('#contentContainer').html(html);
    
    $('#descriptorForm').submit(function(e) {
        e.preventDefault();
        saveDescriptor();
    });
}

// Cargar Diccionario de Competencias
function loadCompetencias() {
    const competencias = getCompetencias();
    
    const html = `
        <div class="row">
            <div class="col-md-6">
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-microchip me-2"></i>Competencias Técnicas
                        ${currentUser.rol === 'TH_GENERALISTA' || currentUser.rol === 'JEFE_TH' ? `
                            <button class="btn btn-primary btn-sm float-end" onclick="addCompetenciaTecnica()">
                                <i class="fas fa-plus"></i> Nueva Competencia
                            </button>
                        ` : ''}
                    </div>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr><th>Código</th><th>Competencia</th><th>Nivel</th><th>Acciones</th></tr>
                            </thead>
                            <tbody>
                                ${competencias.tecnicas.map(c => `
                                    <tr>
                                        <td>${c.codigo}</td>
                                        <td>${c.nombre}</td>
                                        <td>${c.nivelDominio}</td>
                                        <td>
                                            ${currentUser.rol === 'TH_GENERALISTA' || currentUser.rol === 'JEFE_TH' ? `
                                                <button class="btn btn-sm btn-warning" onclick="editCompetencia(${c.id}, 'tecnica')">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-sm btn-danger" onclick="deleteCompetencia(${c.id}, 'tecnica')">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            ` : ''}
                                         </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-heart me-2"></i>Competencias Conductuales
                        ${currentUser.rol === 'TH_GENERALISTA' || currentUser.rol === 'JEFE_TH' ? `
                            <button class="btn btn-primary btn-sm float-end" onclick="addCompetenciaConductual()">
                                <i class="fas fa-plus"></i> Nueva Competencia
                            </button>
                        ` : ''}
                    </div>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr><th>Código</th><th>Competencia</th><th>Descripción</th><th>Acciones</th></tr>
                            </thead>
                            <tbody>
                                ${competencias.conductuales.map(c => `
                                    <tr>
                                        <td>${c.codigo}</td>
                                        <td>${c.nombre}</td>
                                        <td>${c.descripcion.substring(0, 50)}...</td>
                                        <td>
                                            ${currentUser.rol === 'TH_GENERALISTA' || currentUser.rol === 'JEFE_TH' ? `
                                                <button class="btn btn-sm btn-warning" onclick="editCompetencia(${c.id}, 'conductual')">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-sm btn-danger" onclick="deleteCompetencia(${c.id}, 'conductual')">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            ` : ''}
                                         </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    $('#contentContainer').html(html);
}

// Cargar Mi Perfil
function loadMiPerfil() {
    const html = `
        <div class="row">
            <div class="col-md-4">
                <div class="form-section text-center">
                    <i class="fas fa-user-circle fa-5x mb-3" style="color: var(--primary-color);"></i>
                    <h4>${currentUser.nombre}</h4>
                    <p class="text-muted">${currentUser.rolNombre}</p>
                    <p><i class="fas fa-building"></i> ${currentUser.area}</p>
                    <p><i class="fas fa-envelope"></i> ${currentUser.email}</p>
                    <hr>
                    <p><small class="text-muted">Último acceso: ${new Date().toLocaleString()}</small></p>
                </div>
            </div>
            <div class="col-md-8">
                <div class="form-section">
                    <div class="form-section-title">
                        <i class="fas fa-history me-2"></i>Mi Actividad Reciente
                    </div>
                    <div class="timeline">
                        <div class="timeline-item completed">
                            <div class="timeline-date">Hoy</div>
                            <div class="timeline-title">Inicio de sesión</div>
                        </div>
                        <div class="timeline-item completed">
                            <div class="timeline-date">Ayer</div>
                            <div class="timeline-title">Visualización de descriptor #001</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    $('#contentContainer').html(html);
}

// Funciones auxiliares
function getDescriptors() {
    let descriptors = localStorage.getItem('descriptores');
    if (!descriptors) {
        // Datos de ejemplo
        descriptors = [
            {
                id: 1,
                puesto: 'Analista Programador',
                area: 'Subgerencia de TI',
                version: 1,
                fechaEmision: '2026-01-15',
                estado: 'ACTIVO',
                creador: 'Ing. Juan Hércules',
                titular: 'Ing. Juan Pérez',
                jefeSuperior: 'Dr. Roberto Chang',
                reportaA: 'Jefe de Subgerencia de TI',
                personalCargo: 0,
                objetivo: 'Desarrollar y mantener aplicaciones del ERP universitario...'
            },
            {
                id: 2,
                puesto: 'Coordinador de Reclutamiento',
                area: 'Talento Humano',
                version: 1,
                fechaEmision: '2026-01-10',
                estado: 'BORRADOR',
                creador: 'Licda. Ana López',
                titular: '',
                jefeSuperior: 'Lic. Carlos Gómez',
                reportaA: 'Jefe de Talento Humano',
                personalCargo: 3,
                objetivo: 'Coordinar los procesos de reclutamiento y selección...'
            },
            {
                id: 3,
                puesto: 'Asistente Administrativo',
                area: 'Gerencia General',
                version: 1,
                fechaEmision: '2026-01-05',
                estado: 'ENVIADO_TH',
                creador: 'Dr. Roberto Chang',
                titular: '',
                jefeSuperior: '',
                reportaA: 'Gerente General',
                personalCargo: 0,
                objetivo: 'Apoyar en las tareas administrativas de la gerencia...'
            }
        ];
        localStorage.setItem('descriptores', JSON.stringify(descriptors));
        return descriptors;
    }
    return JSON.parse(descriptors);
}

function getCompetencias() {
    let competencias = localStorage.getItem('competencias');
    if (!competencias) {
        competencias = {
            tecnicas: [
                { id: 1, codigo: 'T001', nombre: 'Programación Java', nivelDominio: 'Avanzado' },
                { id: 2, codigo: 'T002', nombre: 'SQL Server', nivelDominio: 'Intermedio' },
                { id: 3, codigo: 'T003', nombre: 'JavaScript/React', nivelDominio: 'Avanzado' }
            ],
            conductuales: [
                { id: 1, codigo: 'C001', nombre: 'Trabajo en Equipo', descripcion: 'Capacidad para colaborar efectivamente' },
                { id: 2, codigo: 'C002', nombre: 'Comunicación Efectiva', descripcion: 'Exprimir ideas claramente' },
                { id: 3, codigo: 'C003', nombre: 'Liderazgo', descripcion: 'Guiar y motivar al equipo' }
            ]
        };
        localStorage.setItem('competencias', JSON.stringify(competencias));
        return competencias;
    }
    return JSON.parse(competencias);
}

function saveDescriptor() {
    const form = $('#descriptorForm');
    const descriptors = getDescriptors();
    
    const newDescriptor = {
        id: descriptors.length + 1,
        puesto: form.find('[name="puesto"]').val(),
        area: form.find('[name="area"]').val(),
        version: 1,
        fechaEmision: form.find('[name="fechaEmision"]').val(),
        estado: 'BORRADOR',
        creador: currentUser.nombre,
        titular: '',
        jefeSuperior: '',
        reportaA: form.find('[name="reportaA"]').val(),
        personalCargo: form.find('[name="personalCargo"]').val(),
        objetivo: form.find('[name="objetivo"]').val(),
        funcionesClaves: [],
        kpis: [],
        perfil: {
            edadMin: form.find('[name="edadMin"]').val(),
            edadMax: form.find('[name="edadMax"]').val(),
            sexo: form.find('[name="sexo"]').val(),
            educacion: []
        }
    };
    
    descriptors.push(newDescriptor);
    localStorage.setItem('descriptores', JSON.stringify(descriptors));
    
    Swal.fire('Éxito', 'Descriptor guardado como borrador', 'success').then(() => {
        loadPage('descriptores');
    });
}

function viewDescriptor(id) {
    const descriptors = getDescriptors();
    const descriptor = descriptors.find(d => d.id === id);
    
    if (descriptor) {
        Swal.fire({
            title: `Descriptor: ${descriptor.puesto}`,
            html: `
                <div class="text-start">
                    <p><strong>ID:</strong> DES-${descriptor.id.toString().padStart(4, '0')}</p>
                    <p><strong>Puesto:</strong> ${descriptor.puesto}</p>
                    <p><strong>Área:</strong> ${descriptor.area}</p>
                    <p><strong>Versión:</strong> v${descriptor.version}</p>
                    <p><strong>Estado:</strong> ${descriptor.estado}</p>
                    <p><strong>Fecha Emisión:</strong> ${descriptor.fechaEmision}</p>
                    <p><strong>Creador:</strong> ${descriptor.creador}</p>
                    <p><strong>Reporta a:</strong> ${descriptor.reportaA}</p>
                    <hr>
                    <p><strong>Objetivo:</strong></p>
                    <p>${descriptor.objetivo}</p>
                </div>
            `,
            width: '600px',
            confirmButtonText: 'Cerrar'
        });
    }
}

function editDescriptor(id) {
    Swal.fire('Info', 'Funcionalidad de edición en desarrollo', 'info');
}

function approveDescriptor(id) {
    Swal.fire({
        title: '¿Aprobar descriptor?',
        text: '¿Estás seguro de aprobar este descriptor?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, aprobar'
    }).then((result) => {
        if (result.isConfirmed) {
            const descriptors = getDescriptors();
            const index = descriptors.findIndex(d => d.id === id);
            if (index !== -1) {
                descriptors[index].estado = 'ACTIVO';
                localStorage.setItem('descriptores', JSON.stringify(descriptors));
                Swal.fire('Aprobado', 'Descriptor aprobado exitosamente', 'success').then(() => {
                    loadPage('descriptores');
                });
            }
        }
    });
}

function signDescriptor(id) {
    Swal.fire({
        title: 'Firma Digital',
        html: `
            <p>Estás firmando el descriptor como: <strong>${currentUser.rolNombre}</strong></p>
            <input type="password" id="pinFirma" class="swal2-input" placeholder="Ingrese su PIN de firma">
        `,
        showCancelButton: true,
        confirmButtonText: 'Firmar',
        preConfirm: () => {
            const pin = document.getElementById('pinFirma').value;
            if (pin === '123456') {
                return true;
            } else {
                Swal.showValidationMessage('PIN incorrecto');
                return false;
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const descriptors = getDescriptors();
            const index = descriptors.findIndex(d => d.id === id);
            if (index !== -1) {
                descriptors[index].estado = 'FIRMADO';
                localStorage.setItem('descriptores', JSON.stringify(descriptores));
                Swal.fire('Firmado', 'Descriptor firmado exitosamente', 'success').then(() => {
                    loadPage('descriptores');
                });
            }
        }
    });
}

function canEditDescriptor(descriptor) {
    return currentUser.rol === 'JEFE_INMEDIATO' && 
           descriptor.creador === currentUser.nombre && 
           (descriptor.estado === 'BORRADOR' || descriptor.estado === 'OBSERVADO');
}

function canApproveDescriptor(descriptor) {
    if (currentUser.rol === 'JEFE_SUPERIOR' && descriptor.estado === 'ENVIADO_TH') return true;
    if (currentUser.rol === 'TH_GENERALISTA' && descriptor.estado === 'ENVIADO_TH') return true;
    if (currentUser.rol === 'JEFE_TH' && descriptor.estado === 'VALIDACION_TECNICA') return true;
    return false;
}

function canSignDescriptor(descriptor) {
    if (currentUser.rol === 'COLABORADOR' && descriptor.titular === currentUser.nombre && descriptor.estado === 'ACTIVO') return true;
    if (currentUser.rol === 'JEFE_INMEDIATO' && descriptor.creador === currentUser.nombre && descriptor.estado === 'ACTIVO') return true;
    if (currentUser.rol === 'JEFE_TH' && descriptor.estado === 'FIRMADO') return true;
    return false;
}

function getEstadoNombre(estado) {
    const estados = {
        'BORRADOR': 'Borrador',
        'ENVIADO_TH': 'Enviado a TH',
        'OBSERVADO': 'Observado',
        'VALIDACION_TECNICA': 'Validación Técnica',
        'ACTIVO': 'Activo',
        'FIRMADO': 'Firmado'
    };
    return estados[estado] || estado;
}

function getWorkflowStatus(step) {
    // Simulación de flujo
    return 'completed';
}

// Funciones globales
window.addFuncionClave = function() {
    Swal.fire('Info', 'Función agregada (demo)', 'info');
};

window.addKPI = function() {
    Swal.fire('Info', 'KPI agregado (demo)', 'info');
};

window.addEducacion = function() {
    Swal.fire('Info', 'Requisito educativo agregado (demo)', 'info');
};

window.viewDescriptor = viewDescriptor;
window.editDescriptor = editDescriptor;
window.approveDescriptor = approveDescriptor;
window.signDescriptor = signDescriptor;
window.loadPage = loadPage;
window.addCompetenciaTecnica = function() {
    Swal.fire('Info', 'Nueva competencia técnica (demo)', 'info');
};
window.addCompetenciaConductual = function() {
    Swal.fire('Info', 'Nueva competencia conductual (demo)', 'info');
};