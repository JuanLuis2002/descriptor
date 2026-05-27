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
    if (currentUser.rol === 'JEFE_INMEDIATO') {
        nav.append(`
            <a href="#" class="nav-link text-white px-3 py-2" data-modulo="nuevoDescriptor">
                <i class="fas fa-plus-circle me-2"></i> <span>Nuevo Descriptor</span>
            </a>
            <a href="#" class="nav-link text-white px-3 py-2" data-modulo="misDescriptores">
                <i class="fas fa-list me-2"></i> <span>Mis Descriptores</span>
            </a>
        `);
    } else if (currentUser.rol === 'JEFE_SUPERIOR') {
        nav.append(`
            <a href="#" class="nav-link text-white px-3 py-2" data-modulo="pendientesAprobar">
                <i class="fas fa-clock me-2"></i> <span>Pendientes de Aprobación</span>
            </a>
        `);
    } else if (currentUser.rol === 'TH_GENERALISTA') {
        nav.append(`
            <a href="#" class="nav-link text-white px-3 py-2" data-modulo="revisionTH">
                <i class="fas fa-check-double me-2"></i> <span>Revisión Técnica</span>
            </a>
            <a href="#" class="nav-link text-white px-3 py-2" data-modulo="complementarTH">
                <i class="fas fa-pen me-2"></i> <span>Complementar Descriptor</span>
            </a>
        `);
    } else if (currentUser.rol === 'JEFE_TH') {
        nav.append(`
            <a href="#" class="nav-link text-white px-3 py-2" data-modulo="validacionFinal">
                <i class="fas fa-gavel me-2"></i> <span>Validación Final</span>
            </a>
            <a href="#" class="nav-link text-white px-3 py-2" data-modulo="competencias">
                <i class="fas fa-graduation-cap me-2"></i> <span>Diccionario Competencias</span>
            </a>
        `);
    } else if (currentUser.rol === 'COLABORADOR') {
        nav.append(`
            <a href="#" class="nav-link text-white px-3 py-2" data-modulo="misFirmas">
                <i class="fas fa-signature me-2"></i> <span>Pendientes de Firma</span>
            </a>
            <a href="#" class="nav-link text-white px-3 py-2" data-modulo="miDescriptor">
                <i class="fas fa-file-alt me-2"></i> <span>Mi Descriptor</span>
            </a>
        `);
    }
    
    // Eventos de los módulos - USAR DELEGACIÓN DE EVENTOS
    $(document).on('click', '.nav-link[data-modulo]', function(e) {
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
    $('#contentContainer').html('<div class="text-center p-5"><i class="fas fa-spinner fa-spin fa-2x"></i><br>Cargando formulario...</div>');
    
    // Cargar los scripts en orden
    $.when(
        $.getScript('modulos/frmDescriptor/services/descriptorService.js'),
        $.getScript('modulos/frmDescriptor/controller/descriptorController.js')
    ).done(function() {
        // Verificar que DescriptorController existe y tiene el método init
        if (typeof DescriptorController !== 'undefined' && DescriptorController.init) {
            DescriptorController.init(currentUser);
        } else if (typeof window.DescriptorController !== 'undefined' && window.DescriptorController.init) {
            window.DescriptorController.init(currentUser);
        } else {
            // Si no existe, intentar cargar directamente la vista
            cargarVistaDescriptorDirecta();
        }
    }).fail(function(err) {
        console.error('Error cargando scripts:', err);
        // Fallback: cargar vista directamente
        cargarVistaDescriptorDirecta();
    });
}

// Fallback - Cargar vista directamente
function cargarVistaDescriptorDirecta() {
    $.get('modulos/frmDescriptor/view/descriptorForm.html')
        .done(function(html) {
            $('#contentContainer').html(html);
            // Inicializar eventos del formulario si existen
            if (typeof initFormularioDescriptor === 'function') {
                initFormularioDescriptor();
            }
        })
        .fail(function() {
            $('#contentContainer').html(`
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Error al cargar el formulario. Verifique que el archivo existe en:<br>
                    <strong>modulos/frmDescriptor/view/descriptorForm.html</strong>
                </div>
            `);
        });
}

// Cargar mis descriptores
function cargarMisDescriptores() {
    $('#pageTitle').text('Mis Descriptores');
    
    // Obtener descriptores del localStorage
    let descriptores = [];
    const data = localStorage.getItem('descriptores');
    if (data) {
        descriptores = JSON.parse(data);
        // Filtrar por creador
        descriptores = descriptores.filter(d => d.creador === currentUser.nombre);
    }
    
    if (descriptores.length === 0) {
        $('#contentContainer').html(`
            <div class="alert alert-info text-center">
                <i class="fas fa-info-circle"></i> No tiene descriptores creados aún.
                <a href="#" onclick="cargarNuevoDescriptor(); return false;" class="alert-link">Crear nuevo descriptor</a>
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
                <td>${d.fechaEmision || (d.fechaCreacion ? d.fechaCreacion.split('T')[0] : '-')}</td>
                <td><span class="badge ${getEstadoBadge(d.estado)}">${d.estado || 'BORRADOR'}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="verDescriptor(${d.id})"><i class="fas fa-eye"></i></button>
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

// Funciones auxiliares
function verDescriptor(id) {
    Swal.fire('Información', `Ver descriptor ID: ${id}`, 'info');
}

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

// Variables globales
window.cargarNuevoDescriptor = cargarNuevoDescriptor;
window.verDescriptor = verDescriptor;
window.openMobileSidebar = openMobileSidebar;
window.closeMobileSidebar = closeMobileSidebar;