// App principal
let currentUser = null;
let isMobile = window.innerWidth <= 768;

$(document).ready(function() {
    const userStr = sessionStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'login.html';
        return;
    }
    currentUser = JSON.parse(userStr);
    window.currentUser = currentUser;
    
    $('#userName').text(currentUser.nombre);
    $('#userRole').text(currentUser.rolNombre);
    $('#userArea').text(currentUser.area);
    $('#userRoleBadge').text(currentUser.rolNombre);
    
    setupEvents();
    loadMenu();
    checkMobile();
    loadDashboard();
});

function setupEvents() {
    $('#toggleSidebar').click(function() {
        if (isMobile) openMobileSidebar();
        else {
            $('#sidebar').toggleClass('collapsed');
            $('#mainContent').toggleClass('expanded');
        }
    });
    $('#sidebarOverlay').click(closeMobileSidebar);
    $('#btnLogout').click(function(e) {
        e.preventDefault();
        Swal.fire({
            title: '¿Cerrar sesión?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        }).then(result => {
            if (result.isConfirmed) {
                sessionStorage.clear();
                window.location.href = 'login.html';
            }
        });
    });
    $(window).resize(checkMobile);
}

function loadMenu() {
    const nav = $('#mainNav');
    nav.empty();
    nav.append(`<a href="#" class="nav-link text-white px-3 py-2 active" data-modulo="dashboard"><i class="fas fa-tachometer-alt me-2"></i> <span>Dashboard</span></a>`);
    
    if (currentUser.rol === 'JEFE_INMEDIATO') {
        nav.append(`
            <a href="#" class="nav-link text-white px-3 py-2" data-modulo="nuevoDescriptor"><i class="fas fa-plus-circle me-2"></i> <span>Nuevo Descriptor</span></a>
            <a href="#" class="nav-link text-white px-3 py-2" data-modulo="misDescriptores"><i class="fas fa-list me-2"></i> <span>Mis Descriptores</span></a>
        `);
    }
    
    $(document).on('click', '.nav-link[data-modulo]', function(e) {
        e.preventDefault();
        const modulo = $(this).data('modulo');
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
        if (isMobile) closeMobileSidebar();
        cargarModulo(modulo);
    });
}

function cargarModulo(modulo) {
    if (modulo === 'dashboard') loadDashboard();
    else if (modulo === 'nuevoDescriptor') cargarNuevoDescriptor();
    else if (modulo === 'misDescriptores') cargarMisDescriptores();
    else loadDashboard();
}

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
                            <p class="text-secondary small mb-0">Requisitos y competencias</p>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="info-card p-3 text-center h-100">
                            <i class="fas fa-signature fa-2x mb-2"></i>
                            <h5 class="mb-1">Flujo de Firmas</h5>
                            <p class="text-secondary small mb-0">Aprobación y validación</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);
}

function cargarNuevoDescriptor() {
    $('#pageTitle').text('Nuevo Descriptor de Puesto');
    if (typeof DescriptorController !== 'undefined') {
        DescriptorController.init(currentUser);
    } else {
        $('#contentContainer').html(`<div class="alert alert-danger">Error: No se pudo cargar el módulo</div>`);
    }
}

function cargarMisDescriptores() {
    $('#pageTitle').text('Mis Descriptores');
    if (typeof DescriptorListService !== 'undefined') {
        mostrarListaDescriptores();
    } else {
        $('#contentContainer').html(`<div class="alert alert-danger">Error: No se pudo cargar la lista</div>`);
    }
}

function mostrarListaDescriptores() {
    const currentUserLocal = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    let descriptores = DescriptorService.getAll().filter(d => d.creador === currentUserLocal.nombre);
    
    if (descriptores.length === 0) {
        $('#contentContainer').html(`
            <div class="alert alert-info text-center">
                <i class="fas fa-info-circle"></i> No tiene descriptores creados aún.
                <a href="#" onclick="cargarNuevoDescriptor(); return false;" class="alert-link">Crear nuevo descriptor</a>
            </div>
        `);
        return;
    }
    
    let html = `<div class="row">`;
    descriptores.forEach(d => {
        const fecha = d.fechaEmision || (d.fechaCreacion ? d.fechaCreacion.split('T')[0] : '-');
        html += `
            <div class="col-12 col-md-6 col-lg-4 mb-3">
                <div class="card h-100">
                    <div class="card-header bg-white d-flex justify-content-between align-items-center">
                        <span class="fw-bold">${d.codigo || 'DES-' + d.id}</span>
                        <span class="badge ${d.estado === 'BORRADOR' ? 'bg-secondary' : 'bg-success'}">${d.estado || 'BORRADOR'}</span>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${d.puesto || 'Sin título'}</h5>
                        <p class="card-text text-muted small"><i class="fas fa-building"></i> ${d.area || 'N/A'}<br><i class="fas fa-calendar"></i> ${fecha}</p>
                    </div>
                    <div class="card-footer bg-white">
                        <button class="btn btn-sm btn-outline-info" onclick="verDescriptor(${d.id})"><i class="fas fa-eye"></i> Ver</button>
                        ${d.estado === 'BORRADOR' ? `<button class="btn btn-sm btn-outline-primary" onclick="enviarDescriptor(${d.id})"><i class="fas fa-paper-plane"></i> Enviar a TH</button>` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    $('#contentContainer').html(html);
}

function verDescriptor(id) {
    const descriptor = DescriptorService.getById(id);
    if (!descriptor) return;
    let funcionesHtml = '';
    if (descriptor.funcionesClaves && descriptor.funcionesClaves.length > 0) {
        funcionesHtml = '<ul>' + descriptor.funcionesClaves.map(f => `<li><strong>${f.codigo}</strong> - ${f.nombre}</li>`).join('') + '</ul>';
    } else {
        funcionesHtml = '<p>No registradas</p>';
    }
    Swal.fire({
        title: `Descriptor: ${descriptor.puesto}`,
        html: `<div class="text-start"><p><strong>Código:</strong> ${descriptor.codigo}</p><p><strong>Área:</strong> ${descriptor.area}</p><p><strong>Reporta a:</strong> ${descriptor.reportaA || 'N/A'}</p><hr><strong>Objetivo:</strong><p>${descriptor.objetivo || '-'}</p><hr><strong>Funciones Claves:</strong>${funcionesHtml}</div>`,
        width: '600px',
        confirmButtonText: 'Cerrar'
    });
}

function enviarDescriptor(id) {
    Swal.fire({
        title: '¿Enviar a Talento Humano?',
        text: 'Una vez enviado, no podrá modificar el descriptor.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, enviar'
    }).then(result => {
        if (result.isConfirmed) {
            DescriptorService.update(id, { estado: 'ENVIADO_TH' });
            Swal.fire('Enviado', 'Descriptor enviado a Talento Humano', 'success');
            cargarMisDescriptores();
        }
    });
}

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

window.cargarNuevoDescriptor = cargarNuevoDescriptor;
window.verDescriptor = verDescriptor;
window.enviarDescriptor = enviarDescriptor;
window.openMobileSidebar = openMobileSidebar;
window.closeMobileSidebar = closeMobileSidebar;