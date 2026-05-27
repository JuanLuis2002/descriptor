document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificación de seguridad: si no hay sesión, al login
    if (sessionStorage.getItem('sesion_activa') !== 'true') {
        window.location.href = 'login.html';
        return;
    }
    
    // 2. Inicializar sistema
    initKernel();
});

function initKernel() {
    const nombre = sessionStorage.getItem('usuario_nombre') || 'Usuario';
    const cargo = sessionStorage.getItem('usuario_cargo') || '';
    const rol = (sessionStorage.getItem('usuario_rol') || '').trim().toUpperCase();
    
    let permisos = [];
    try {
        permisos = JSON.parse(sessionStorage.getItem('usuario_permisos') || '[]');
    } catch (e) { permisos = []; }

    // Inyectar datos de usuario
    document.getElementById('txtNombreUsuario').innerText = nombre;

    // Configurar botón de logout
    document.getElementById('btn-logout').addEventListener('click', cerrarSesion);

    renderizarMenu(rol, permisos);
    cargarBandejaPrincipal();
}

function cerrarSesion() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

function renderizarMenu(rol, permisos) {
    const menu = document.getElementById('menu-lateral');
    if (!menu) return;

    let html = `
        <a href="#" class="list-group-item list-group-item-action active" id="lnk-dashboard">
            <i class="bi bi-mailbox2 me-2"></i> Bandeja de Entrada
        </a>
    `;

    // Lógica de menús
    if (rol === 'JEFE_INMEDIATO' || permisos.includes('CREAR_BORRADOR')) {
        html += `<a href="#" class="list-group-item list-group-item-action" id="lnk-crear-puesto">
                    <i class="bi bi-file-earmark-plus-fill me-2"></i> Nuevo Descriptor
                 </a>`;
    }

    if (rol === 'JEFE_SUPERIOR' || permisos.includes('APROBAR_JEFE_SUPERIOR')) {
        html += `<a href="#" class="list-group-item list-group-item-action" id="lnk-aprobaciones">
                    <i class="bi bi-check2-square me-2"></i> Pendientes de Firma
                 </a>`;
    }

    if (rol === 'COLABORADOR' || permisos.includes('FIRMA_DIGITAL_TITULAR')) {
        html += `<a href="#" class="list-group-item list-group-item-action" id="lnk-firma-titular">
                    <i class="bi bi-pen-fill me-2"></i> Mis Descriptores (Firma)
                 </a>`;
    }

    menu.innerHTML = html;
    asignarEventos();
}

function asignarEventos() {
    document.getElementById('lnk-dashboard')?.addEventListener('click', (e) => {
        e.preventDefault();
        cargarBandejaPrincipal();
    });

    document.getElementById('lnk-crear-puesto')?.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            const { descriptorController } = await import('./modulos/frmDescriptor/controller/descriptorController.js');
            descriptorController.inicializar('NUEVO_BORRADOR');
        } catch (err) { console.error("Error cargando módulo:", err); }
    });
}

function cargarBandejaPrincipal() {
    document.getElementById('content-area').innerHTML = `
        <div class="card p-4 shadow-sm border-0">
            <h4 class="fw-bold">Bandeja de Entrada</h4>
            <p class="text-muted">Sistema de Gestión de Descriptores UEES.</p>
        </div>
    `;
}