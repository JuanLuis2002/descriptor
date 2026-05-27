// App principal - Controlador de módulos
let currentUser = null;
let isMobile = window.innerWidth <= 768;

// Inicializar
$(document).ready(function() {
    checkAuth();
    loadUser();
    setupEvents();
    loadMenu();
    checkMobile();
    
    // Cargar dashboard por defecto
    loadDashboard();
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

// Cargar usuario en UI
function loadUser() {
    if (!currentUser) return;
    
    $('#userName').text(currentUser.nombre);
    $('#userRole').text(currentUser.rolNombre);
    $('#userArea').text(currentUser.area);
    $('#userRoleBadge').text(currentUser.rolNombre);
}

// Configurar eventos
function setupEvents() {
    // Toggle sidebar
    $('#toggleSidebar').click(function() {
        if (isMobile) {
            openMobileSidebar();
        } else {
            $('#sidebar').toggleClass('collapsed');
            $('#mainContent').toggleClass('expanded');
        }
    });
    
    // Cerrar sidebar con overlay
    $('#sidebarOverlay').click(function() {
        closeMobileSidebar();
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
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#0d6efd'
        }).then((result) => {
            if (result.isConfirmed) {
                sessionStorage.clear();
                window.location.href = 'login.html';
            }
        });
    });
    
    // Detectar resize para móvil
    $(window).resize(function() {
        checkMobile();
    });
}

// Cargar menú según el rol del usuario
function loadMenu() {
    const nav = $('#mainNav');
    nav.empty();
    
    // Opción Dashboard (siempre visible)
    nav.append(`
        <a href="#" class="nav-link text-white px-3 py-2 active" data-modulo="dashboard">
            <i class="fas fa-tachometer-alt me-2"></i> <span>Dashboard</span>
        </a>
    `);
    
    // Según el rol del usuario, mostrar opciones
    switch(currentUser.rol) {
        case 'JEFE_INMEDIATO':
            nav.append(`
                <a href="#" class="nav-link text-white px-3 py-2" data-modulo="nuevoDescriptor">
                    <i class="fas fa-plus-circle me-2"></i> <span>Nuevo Descriptor</span>
                </a>
                <a href="#" class="nav-link text-white px-3 py-2" data-modulo="misDescriptores">
                    <i class="fas fa-list me-2"></i> <span>Mis Descriptores</span>
                </a>
            `);
            break;
            
        case 'JEFE_SUPERIOR':
            nav.append(`
                <a href="#" class="nav-link text-white px-3 py-2" data-modulo="pendientesAprobar">
                    <i class="fas fa-clock me-2"></i> <span>Pendientes de Aprobación</span>
                </a>
            `);
            break;
            
        case 'TH_GENERALISTA':
            nav.append(`
                <a href="#" class="nav-link text-white px-3 py-2" data-modulo="revisionTH">
                    <i class="fas fa-check-double me-2"></i> <span>Revisión Técnica</span>
                </a>
                <a href="#" class="nav-link text-white px-3 py-2" data-modulo="complementarTH">
                    <i class="fas fa-pen me-2"></i> <span>Complementar Descriptor</span>
                </a>
            `);
            break;
            
        case 'JEFE_TH':
            nav.append(`
                <a href="#" class="nav-link text-white px-3 py-2" data-modulo="validacionFinal">
                    <i class="fas fa-gavel me-2"></i> <span>Validación Final</span>
                </a>
                <a href="#" class="nav-link text-white px-3 py-2" data-modulo="competencias">
                    <i class="fas fa-graduation-cap me-2"></i> <span>Diccionario Competencias</span>
                </a>
            `);
            break;
            
        case 'COLABORADOR':
            nav.append(`
                <a href="#" class="nav-link text-white px-3 py-2" data-modulo="misFirmas">
                    <i class="fas fa-signature me-2"></i> <span>Pendientes de Firma</span>
                </a>
                <a href="#" class="nav-link text-white px-3 py-2" data-modulo="miDescriptor">
                    <i class="fas fa-file-alt me-2"></i> <span>Mi Descriptor</span>
                </a>
            `);
            break;
    }
    
    // Eventos de los módulos
    $('.nav-link[data-modulo]').click(function(e) {
        e.preventDefault();
        const modulo = $(this).data('modulo');
        
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
        
        // Cerrar sidebar en móvil después de seleccionar
        if (isMobile) {
            closeMobileSidebar();
        }
        
        // Cargar el módulo correspondiente
        cargarModulo(modulo);
    });
}

// Cargar módulo según la opción seleccionada
function cargarModulo(modulo) {
    switch(modulo) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'nuevoDescriptor':
            cargarNuevoDescriptor();
            break;
        case 'misDescriptores':
            cargarMisDescriptores();
            break;
        case 'pendientesAprobar':
            cargarPendientesAprobar();
            break;
        case 'revisionTH':
            cargarRevisionTH();
            break;
        case 'complementarTH':
            cargarComplementarTH();
            break;
        case 'validacionFinal':
            cargarValidacionFinal();
            break;
        case 'competencias':
            cargarCompetencias();
            break;
        case 'misFirmas':
            cargarMisFirmas();
            break;
        case 'miDescriptor':
            cargarMiDescriptor();
            break;
        default:
            loadDashboard();
    }
}

// Cargar Dashboard
function loadDashboard() {
    $('#pageTitle').text('Dashboard Principal');
    $('#contentContainer').html(`
        <div class="fade-in">
            <div class="welcome-card p-4 p-md-5 text-center">
                <i class="fas fa-clipboard-list fa-4x mb-3 text-primary"></i>
                <h2 class="mb-2">Bienvenido, ${currentUser.nombre}</h2>
                <p class="text-secondary mb-4">Rol: ${currentUser.rolNombre} | Área: ${currentUser.area}</p>
                <hr class="my-4">
                <div class="row mt-4 g-3">
                    <div class="col-12 col-md-4">
                        <div class="info-card p-3 text-center h-100">
                            <i class="fas fa-file-alt fa-2x mb-2"></i>
                            <h5 class="mb-1">Descriptor de Puesto</h5>
                            <p class="text-secondary small mb-0">Gestión completa de descriptores de puesto</p>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="info-card p-3 text-center h-100">
                            <i class="fas fa-user-graduate fa-2x mb-2"></i>
                            <h5 class="mb-1">Perfil de Puesto</h5>
                            <p class="text-secondary small mb-0">Requisitos y competencias del puesto</p>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="info-card p-3 text-center h-100">
                            <i class="fas fa-signature fa-2x mb-2"></i>
                            <h5 class="mb-1">Flujo de Firmas</h5>
                            <p class="text-secondary small mb-0">Aprobación y validación digital</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);
}

// Cargar formulario de nuevo descriptor (solo Jefe Inmediato)
function cargarNuevoDescriptor() {
    $('#pageTitle').text('Nuevo Descriptor de Puesto');
    
    // Verificar que el módulo existe y cargarlo dinámicamente
    if (typeof DescriptorController !== 'undefined') {
        DescriptorController.init(currentUser);
    } else {
        // Cargar scripts del módulo frmDescriptor
        $.getScript('modulos/frmDescriptor/services/descriptorService.js')
            .done(function() {
                $.getScript('modulos/frmDescriptor/controller/descriptorController.js')
                    .done(function() {
                        if (typeof DescriptorController !== 'undefined') {
                            DescriptorController.init(currentUser);
                        }
                    })
                    .fail(function() {
                        mostrarError('Error al cargar el controlador del descriptor');
                    });
            })
            .fail(function() {
                mostrarError('Error al cargar el servicio del descriptor');
            });
    }
}

// Cargar mis descriptores (Jefe Inmediato)
function cargarMisDescriptores() {
    $('#pageTitle').text('Mis Descriptores');
    const descriptores = DescriptorService ? DescriptorService.getByCreador(currentUser.nombre) : [];
    
    if (descriptores.length === 0) {
        $('#contentContainer').html(`
            <div class="alert alert-info text-center">
                <i class="fas fa-info-circle"></i> No tiene descriptores creados aún.
                <a href="#" onclick="cargarNuevoDescriptor()" class="alert-link">Crear nuevo descriptor</a>
            </div>
        `);
        return;
    }
    
    let html = `
        <div class="table-responsive">
            <table class="table table-hover bg-white rounded">
                <thead class="table-light">
                    <tr>
                        <th>Código</th>
                        <th>Puesto</th>
                        <th>Área</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    descriptores.forEach(d => {
        html += `
            <tr>
                <td>${d.codigo || 'DES-' + d.id}</td>
                <td>${d.puesto}</td>
                <td>${d.area}</td>
                <td>${d.fechaEmision || d.fechaCreacion?.split('T')[0] || '-'}</td>
                <td><span class="badge ${getEstadoBadge(d.estado)}">${d.estado || 'BORRADOR'}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="verDescriptor(${d.id})"><i class="fas fa-eye"></i></button>
                    ${d.estado === 'BORRADOR' ? `<button class="btn btn-sm btn-warning" onclick="editarDescriptor(${d.id})"><i class="fas fa-edit"></i></button>` : ''}
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table></div>`;
    $('#contentContainer').html(html);
}

// Función para obtener badge según estado
function getEstadoBadge(estado) {
    const badges = {
        'BORRADOR': 'bg-secondary',
        'ENVIADO_TH': 'bg-info',
        'OBSERVADO': 'bg-warning',
        'ACTIVO': 'bg-success',
        'FIRMADO': 'bg-primary'
    };
    return badges[estado] || 'bg-secondary';
}

// Funciones placeholder para otros módulos
function cargarPendientesAprobar() {
    $('#pageTitle').text('Pendientes de Aprobación');
    $('#contentContainer').html(`
        <div class="alert alert-info">
            <i class="fas fa-info-circle"></i> Módulo en desarrollo. Aquí aparecerán los descriptores pendientes de aprobación.
        </div>
    `);
}

function cargarRevisionTH() {
    $('#pageTitle').text('Revisión Técnica');
    $('#contentContainer').html(`
        <div class="alert alert-info">
            <i class="fas fa-info-circle"></i> Módulo en desarrollo. Aquí aparecerán los descriptores para revisión técnica.
        </div>
    `);
}

function cargarComplementarTH() {
    $('#pageTitle').text('Complementar Descriptor');
    $('#contentContainer').html(`
        <div class="alert alert-info">
            <i class="fas fa-info-circle"></i> Módulo en desarrollo. Aquí se complementarán relaciones laborales, requerimientos y riesgos.
        </div>
    `);
}

function cargarValidacionFinal() {
    $('#pageTitle').text('Validación Final');
    $('#contentContainer').html(`
        <div class="alert alert-info">
            <i class="fas fa-info-circle"></i> Módulo en desarrollo. Aquí aparecerán los descriptores para validación final.
        </div>
    `);
}

function cargarCompetencias() {
    $('#pageTitle').text('Diccionario de Competencias');
    $('#contentContainer').html(`
        <div class="alert alert-info">
            <i class="fas fa-info-circle"></i> Módulo en desarrollo. Gestión del diccionario de competencias técnicas y conductuales.
        </div>
    `);
}

function cargarMisFirmas() {
    $('#pageTitle').text('Pendientes de Firma');
    $('#contentContainer').html(`
        <div class="alert alert-info">
            <i class="fas fa-info-circle"></i> Módulo en desarrollo. Aquí aparecerán los descriptores pendientes de su firma.
        </div>
    `);
}

function cargarMiDescriptor() {
    $('#pageTitle').text('Mi Descriptor');
    $('#contentContainer').html(`
        <div class="alert alert-info">
            <i class="fas fa-info-circle"></i> Módulo en desarrollo. Aquí podrá ver el descriptor de su puesto.
        </div>
    `);
}

// Funciones auxiliares
function mostrarError(mensaje) {
    $('#contentContainer').html(`
        <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle"></i> ${mensaje}
        </div>
    `);
}

// Funciones para móvil
function checkMobile() {
    isMobile = window.innerWidth <= 768;
    if (!isMobile) {
        closeMobileSidebar();
        $('#sidebar').css('transform', '');
        $('#sidebar').removeClass('mobile-open');
        $('#sidebarOverlay').removeClass('show');
    }
}

function openMobileSidebar() {
    $('#sidebar').addClass('mobile-open');
    $('#sidebarOverlay').addClass('show');
    $('#sidebar').css('transform', 'translateX(0)');
}

function closeMobileSidebar() {
    $('#sidebar').removeClass('mobile-open');
    $('#sidebarOverlay').removeClass('show');
    $('#sidebar').css('transform', 'translateX(-100%)');
}

// Funciones globales para usar en onclick
window.cargarNuevoDescriptor = cargarNuevoDescriptor;
window.verDescriptor = function(id) {
    Swal.fire('Información', `Ver descriptor ID: ${id}`, 'info');
};
window.editarDescriptor = function(id) {
    Swal.fire('Información', `Editar descriptor ID: ${id}`, 'info');
};
window.openMobileSidebar = openMobileSidebar;
window.closeMobileSidebar = closeMobileSidebar;