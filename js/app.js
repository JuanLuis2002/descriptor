// app.js - Kernel principal de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Verificación de seguridad básica
    if (sessionStorage.getItem('sesion_activa') !== 'true') {
        window.location.href = 'login.html';
        return;
    }
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

    document.getElementById('txtNombreUsuario').innerText = nombre;
    document.getElementById('txtCargoUsuario').innerHTML = `<i class="bi bi-briefcase-fill me-1"></i> ${cargo}`;

    renderizarMenu(rol, permisos);
    cargarBandejaPrincipal();
}

function renderizarMenu(rol, permisos) {
    const menu = document.getElementById('menu-lateral');
    let html = `
        <a href="#" class="list-group-item list-group-item-action active" id="lnk-dashboard">
            <i class="bi bi-mailbox2 me-2"></i> Bandeja de Entrada
        </a>
    `;

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
            // Ajusta la ruta si es necesario al subir a Netlify
            const { descriptorController } = await import('./modulos/frmDescriptor/controller/descriptorController.js');
            descriptorController.inicializar('NUEVO_BORRADOR');
        } catch (err) { console.error(err); }
    });
}

function cargarBandejaPrincipal() {
    document.getElementById('content-area').innerHTML = `
        <div class="card p-4">
            <h4>Bandeja de Gestión</h4>
            <p>Bienvenido al sistema de descriptores UEES.</p>
        </div>
    `;
}