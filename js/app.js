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
    $('#toggleSidebar').click(function() {
        if (isMobile) {
            openMobileSidebar();
        } else {
            $('#sidebar').toggleClass('collapsed');
            $('#mainContent').toggleClass('expanded');
        }
    });
    
    $('#sidebarOverlay').click(function() {
        closeMobileSidebar();
    });
    
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
    
    $(window).resize(function() {
        checkMobile();
    });
}

// Cargar menú según el rol del usuario
function loadMenu() {
    const nav = $('#mainNav');
    nav.empty();
    
    nav.append(`
        <a href="#" class="nav-link text-white px-3 py-2 active" data-modulo="dashboard">
            <i class="fas fa-tachometer-alt me-2"></i> <span>Dashboard</span>
        </a>
    `);
    
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
            <a href="#" class="nav-link text-white px-3 py-2" data-modulo="firmasJTH">
                <i class="fas fa-signature me-2"></i> <span>Firmas Pendientes</span>
            </a>
        `);
    } else if (currentUser.rol === 'COLABORADOR') {
        nav.append(`
            <a href="#" class="nav-link text-white px-3 py-2" data-modulo="firmasCT">
                <i class="fas fa-signature me-2"></i> <span>Mi Firma</span>
            </a>
        `);
    }
    
    // Eventos de navegación
    $(document).on('click', '.nav-link[data-modulo]', function(e) {
        e.preventDefault();
        const modulo = $(this).data('modulo');
        
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
        
        if (isMobile) {
            closeMobileSidebar();
        }
        
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
        case 'firmasJTH':
            cargarFirmasJTH();
            break;
        case 'firmasCT':
            cargarFirmasCT();
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

// Cargar formulario de nuevo descriptor
function cargarNuevoDescriptor() {
    $('#pageTitle').text('Nuevo Descriptor de Puesto');
    
    // Los scripts YA están cargados, solo llamamos al controlador
    if (typeof DescriptorController !== 'undefined' && DescriptorController.init) {
        DescriptorController.init(currentUser);
    } else {
        $('#contentContainer').html(`
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i> 
                Error: No se pudo cargar el módulo del descriptor.
            </div>
        `);
    }
}

// Cargar mis descriptores
function cargarMisDescriptores() {
    $('#pageTitle').text('Mis Descriptores');
    
    if (typeof DescriptorListController !== 'undefined' && DescriptorListController.init) {
        DescriptorListController.init(currentUser);
    } else {
        $('#contentContainer').html(`
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i> 
                Error: No se pudo cargar la lista de descriptores.
            </div>
        `);
    }
}

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

function verDescriptor(id) {
    Swal.fire('Información', `Ver descriptor ID: ${id}`, 'info');
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

// Función para editar descriptor (llamada desde la lista)
function editarDescriptor(id) {
    console.log('Editando descriptor ID:', id);
    $('#pageTitle').text('Editar Descriptor');
    // Cambiar la pestaña activa a Nuevo Descriptor
    $('.nav-link').removeClass('active');
    $('.nav-link[data-modulo="nuevoDescriptor"]').addClass('active');
    // Inicializar el controlador en modo edición
    if (typeof DescriptorController !== 'undefined') {
        DescriptorController.init(currentUser, id);
    } else {
        Swal.fire('Error', 'No se puede editar el descriptor', 'error');
    }
}

// Cargar pendientes de aprobación (Jefe Superior)
function cargarPendientesAprobar() {
    $('#pageTitle').text('Pendientes de Aprobación');
    
    if (typeof AprobacionController !== 'undefined' && AprobacionController.init) {
        AprobacionController.init(currentUser);
    } else {
        // Cargar scripts del módulo
        $.getScript('modulos/frmAprobacion/services/aprobacionService.js')
            .done(function() {
                $.getScript('modulos/frmAprobacion/controller/aprobacionController.js')
                    .done(function() {
                        if (typeof AprobacionController !== 'undefined') {
                            AprobacionController.init(currentUser);
                        }
                    });
            });
    }
}

// Cargar revisión TH (TH Generalista)
function cargarRevisionTH() {
    $('#pageTitle').text('Revisión Técnica - TH');
    
    if (typeof THController !== 'undefined' && THController.init) {
        THController.init(currentUser);
    } else {
        // Cargar scripts del módulo
        $.getScript('modulos/frmAprobacionTH/services/thService.js')
            .done(function() {
                $.getScript('modulos/frmAprobacionTH/controller/thController.js')
                    .done(function() {
                        if (typeof THController !== 'undefined') {
                            THController.init(currentUser);
                        }
                    });
            });
    }
}

// Cargar firmas Jefe de TH
function cargarFirmasJTH() {
    $('#pageTitle').text('Firmas - Jefe de Talento Humano');
    
    if (typeof JTHController !== 'undefined' && JTHController.init) {
        JTHController.init(currentUser);
    } else {
        $.getScript('modulos/frmFirmaJTH/services/jthService.js')
            .done(function() {
                $.getScript('modulos/frmFirmaJTH/controller/jthController.js')
                    .done(function() {
                        if (typeof JTHController !== 'undefined') {
                            JTHController.init(currentUser);
                        }
                    });
            });
    }
}

// Cargar firmas Colaborador
function cargarFirmasCT() {
    $('#pageTitle').text('Firmas - Colaborador');
    
    if (typeof CTController !== 'undefined' && CTController.init) {
        CTController.init(currentUser);
    } else {
        $.getScript('modulos/frmFirmaCT/services/ctService.js')
            .done(function() {
                $.getScript('modulos/frmFirmaCT/controller/ctController.js')
                    .done(function() {
                        if (typeof CTController !== 'undefined') {
                            CTController.init(currentUser);
                        }
                    });
            });
    }
}

// Función para firmar descriptor (Jefe Inmediato)
function firmarDescriptorJI(id) {
    var descriptor = DescriptorService.getById(id);
    if (!descriptor) return;
    
    var modalHtml = '<div class="text-center"><div id="signature-pad" class="border rounded mx-auto" style="width: 400px; height: 200px; border: 2px solid #ccc;"><canvas id="firmaCanvas" width="400" height="200" style="width:100%;height:100%;"></canvas></div><div class="mt-3"><button id="limpiarFirma" class="btn btn-secondary btn-sm"><i class="fas fa-eraser"></i> Limpiar</button><button id="descargarFirma" class="btn btn-info btn-sm"><i class="fas fa-download"></i> Descargar</button></div></div>';
    
    Swal.fire({
        title: 'Firma Digital - Jefe Inmediato',
        html: modalHtml,
        width: '500px',
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-save"></i> Guardar Firma',
        cancelButtonText: 'Cancelar',
        didOpen: function() {
            var canvas = document.getElementById('firmaCanvas');
            var signaturePad = new SignaturePad(canvas);
            $('#limpiarFirma').click(function() { signaturePad.clear(); });
            $('#descargarFirma').click(function() {
                if (signaturePad.isEmpty()) { Swal.fire('Advertencia', 'No hay firma', 'warning'); return; }
                var link = document.createElement('a');
                link.download = 'firma_ji_' + id + '.png';
                link.href = signaturePad.toDataURL('image/png');
                link.click();
            });
            window.currentSignaturePad = signaturePad;
        },
        preConfirm: function() {
            if (window.currentSignaturePad && window.currentSignaturePad.isEmpty()) {
                Swal.showValidationMessage('Debe dibujar una firma');
                return false;
            }
            return window.currentSignaturePad.toDataURL('image/png');
        }
    }).then(function(result) {
        if (result.isConfirmed && result.value) {
            var firmasGuardadas = JSON.parse(localStorage.getItem('firmas')) || {};
            firmasGuardadas['ji_' + id] = result.value;
            localStorage.setItem('firmas', JSON.stringify(firmasGuardadas));
            DescriptorService.update(id, { estado: 'ACTIVO', firmaJI: result.value, fechaFirmaJI: new Date().toISOString() });
            DescriptorService.registrarEvento(id, {
                accion: 'FIRMA DEL JEFE INMEDIATO',
                usuario: currentUser.nombre,
                rol: currentUser.rolNombre,
                estado: 'ACTIVO'
            });
            Swal.fire('Firmado', 'Descriptor firmado y activado correctamente', 'success');
            cargarMisDescriptores();
        }
    });
}

// Función para desactivar descriptor
function desactivarDescriptor(id) {
    Swal.fire({
        title: 'Desactivar Descriptor',
        html: '<textarea id="motivo" class="swal2-textarea" placeholder="Motivo de desactivación..." rows="3"></textarea>',
        showCancelButton: true,
        confirmButtonText: 'Desactivar',
        confirmButtonColor: '#dc3545',
        preConfirm: function() {
            var motivo = document.getElementById('motivo').value;
            if (!motivo || motivo.trim() === '') {
                Swal.showValidationMessage('Debe ingresar un motivo');
                return false;
            }
            return motivo;
        }
    }).then(function(result) {
        if (result.isConfirmed && result.value) {
            DescriptorService.desactivar(id, result.value, currentUser.nombre, currentUser.rolNombre);
            Swal.fire('Desactivado', 'Descriptor desactivado correctamente', 'success');
            cargarMisDescriptores();
        }
    });
}

// Función para reenviar a TH desde observado
function enviarDescriptorATHDesdeObservado(id) {
    Swal.fire({ 
        title: '¿Reenviar a Talento Humano?', 
        text: 'Una vez reenviado, Talento Humano podrá revisar las correcciones.', 
        icon: 'question', 
        showCancelButton: true, 
        confirmButtonText: 'Sí, reenviar', 
        confirmButtonColor: '#198754' 
    }).then(function(result) {
        if (result.isConfirmed) {
            var currentUserGlobal = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
            DescriptorService.update(id, { estado: 'ENVIADO_TH' });
            DescriptorService.registrarEvento(id, {
                accion: 'REENVÍO A TALENTO HUMANO (DESPUÉS DE CORRECCIÓN)',
                usuario: currentUserGlobal.nombre,
                rol: currentUserGlobal.rolNombre,
                estado: 'ENVIADO_TH'
            });
            Swal.fire('Reenviado', 'Descriptor reenviado a Talento Humano', 'success');
            cargarMisDescriptores();
        }
    });
}

// Función para notificar firmantes
function notificarFirmantes(id) {
    var descriptor = DescriptorService.getById(id);
    if (!descriptor) return;
    
    var jthUser = { nombre: 'Carlos Gómez', rol: 'JEFE_TH' };
    var colaborador = { nombre: descriptor.titular || 'Juan Pérez', rol: 'COLABORADOR' };
    
    var notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
    
    notificaciones.push({
        id: Date.now(),
        descriptorId: id,
        descriptorCodigo: descriptor.codigo,
        descriptorPuesto: descriptor.puesto,
        fecha: new Date().toISOString(),
        mensaje: 'Se requiere su firma digital para el descriptor ' + descriptor.codigo,
        leido: false,
        usuarioDestino: jthUser.nombre,
        rolDestino: jthUser.rol
    });
    
    notificaciones.push({
        id: Date.now() + 1,
        descriptorId: id,
        descriptorCodigo: descriptor.codigo,
        descriptorPuesto: descriptor.puesto,
        fecha: new Date().toISOString(),
        mensaje: 'Se requiere su firma digital como titular del puesto para el descriptor ' + descriptor.codigo,
        leido: false,
        usuarioDestino: colaborador.nombre,
        rolDestino: colaborador.rol
    });
    
    localStorage.setItem('notificaciones', JSON.stringify(notificaciones));
    
    Swal.fire({ title: 'Notificaciones Enviadas', text: 'Se ha notificado al Jefe de Talento Humano y al Colaborador/Titular.', icon: 'success' });
}

// Exportar globales
window.enviarDescriptorATHDesdeObservado = enviarDescriptorATHDesdeObservado;
window.notificarFirmantes = notificarFirmantes;
window.firmarDescriptorJI = firmarDescriptorJI;
window.desactivarDescriptor = desactivarDescriptor;

// Exportar globales
window.firmarDescriptorJI = firmarDescriptorJI;
window.desactivarDescriptor = desactivarDescriptor;

// Exportar globales
window.cargarNuevoDescriptor = cargarNuevoDescriptor;
window.verDescriptor = verDescriptor;
window.openMobileSidebar = openMobileSidebar;
window.closeMobileSidebar = closeMobileSidebar;
window.editarDescriptor = editarDescriptor;

// Variable para la ruta del logo (configurable)
var LOGO_PATH = 'logo/logo.png'; // Colocar aquí la ruta del logo

// Generar versión corta del descriptor
function generarVersionCorta(id) {
    var descriptor = DescriptorService.getById(id);
    if (!descriptor) {
        Swal.fire('Error', 'No se encontró el descriptor', 'error');
        return;
    }
    
    // Generar el HTML para el PDF
    var pdfHtml = generarHTMLVersionCorta(descriptor);
    
    // Mostrar modal con previsualización
    Swal.fire({
        title: 'Descriptor de Puesto - Versión Corta',
        html: '<div id="pdfPreviewContainer" style="max-height: 70vh; overflow-y: auto; background: #f0f2f5; padding: 10px; border-radius: 8px;">' +
              '<div id="pdfContent" style="background: white; padding: 20px; border-radius: 8px;">' + pdfHtml + '</div>' +
              '</div>' +
              '<div class="mt-3 d-flex justify-content-center gap-2">' +
              '<button id="btnDescargarPDF" class="btn btn-success"><i class="fas fa-download"></i> Descargar PDF</button>' +
              '<button id="btnImprimirPDF" class="btn btn-info"><i class="fas fa-print"></i> Imprimir</button>' +
              '</div>',
        width: '900px',
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: 'Cerrar',
        didOpen: function() {
            $('#btnDescargarPDF').click(function() {
                var element = document.getElementById('pdfContent');
                var opt = {
                    margin: [0.5, 0.5, 0.5, 0.5],
                    filename: 'descriptor_corto_' + descriptor.codigo + '.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, letterRendering: true, useCORS: true },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                };
                html2pdf().set(opt).from(element).save();
            });
            
            $('#btnImprimirPDF').click(function() {
                var element = document.getElementById('pdfContent');
                var opt = {
                    margin: [0.5, 0.5, 0.5, 0.5],
                    filename: 'descriptor_corto_' + descriptor.codigo + '.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, letterRendering: true, useCORS: true },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                };
                html2pdf().set(opt).from(element).outputPdf().then(function(pdf) {
                    var iframe = document.createElement('iframe');
                    iframe.style.display = 'none';
                    iframe.src = pdf;
                    document.body.appendChild(iframe);
                    iframe.contentWindow.print();
                });
            });
        }
    });
}

// Generar HTML para versión corta (formato EXACTAMENTE como en las imágenes del PDF)
function generarHTMLVersionCorta(d) {
    // Obtener firmas guardadas
    var firmasGuardadas = JSON.parse(localStorage.getItem('firmas') || '{}');
    var firmaJI = firmasGuardadas['ji_' + d.id] || d.firmaJI || null;
    var firmaJTH = firmasGuardadas['jth_' + d.id] || d.firmaJTH || null;
    var firmaCT = firmasGuardadas['ct_' + d.id] || d.firmaCT || null;

    function getFirmaHtml(firmaDataUrl) {
        if (firmaDataUrl) {
            return '<img src="' + firmaDataUrl + '" style="width:100px;height:35px;">';
        }
        return '&nbsp;';
    }

    var fechaActual = new Date().toLocaleDateString('es-ES');
    var logoHtml = LOGO_PATH ? '<img src="' + LOGO_PATH + '" height="50">' : '<img src="" height="50" style="visibility:hidden;">';

    // ── Funciones Claves ──────────────────────────────────────────────────────
    var funcionesClavesRows = '';
    for (var i = 0; i < 5; i++) {
        var nombre = (d.funcionesClaves && d.funcionesClaves[i]) ? (d.funcionesClaves[i].nombre || '') : '';
        var codigo = (d.funcionesClaves && d.funcionesClaves[i] && d.funcionesClaves[i].codigo)
            ? '[' + d.funcionesClaves[i].codigo + '] ' : '';
        funcionesClavesRows +=
            '<tr><td style="padding:2px 4px;border:none;">' + (i + 1) + '.&nbsp;' + codigo + nombre + '</td></tr>';
    }

    // ── Funciones Secundarias ─────────────────────────────────────────────────
    var funcionesSecRows = '';
    for (var i = 0; i < 5; i++) {
        var fs = (d.funcionesSecundarias && d.funcionesSecundarias[i]) ? d.funcionesSecundarias[i] : '';
        funcionesSecRows +=
            '<tr><td style="padding:2px 4px;border:none;">' + (i + 1) + '.&nbsp;' + fs + '</td></tr>';
    }

    // ── KPIs ──────────────────────────────────────────────────────────────────
    var kpisRows = '';
    for (var i = 0; i < 5; i++) {
        var indicador  = (d.kpis && d.kpis[i]) ? (d.kpis[i].indicador  || '') : '';
        var frecuencia = (d.kpis && d.kpis[i]) ? (d.kpis[i].frecuencia || '') : '';
        var meta       = (d.kpis && d.kpis[i]) ? (d.kpis[i].meta       || '') : '';
        var freqMeta   = frecuencia && meta ? frecuencia + ' / ' + meta : (frecuencia || meta);
        kpisRows += '<tr>'
            + '<td style="border:1px solid #000;padding:5px 6px;width:55%;">' + indicador + '</td>'
            + '<td style="border:1px solid #000;padding:5px 6px;width:45%;">' + freqMeta  + '</td>'
            + '</tr>';
    }

    // ── Educación ─────────────────────────────────────────────────────────────
    var eduRows = '';
    for (var i = 0; i < 2; i++) {
        var req  = (d.educacion && d.educacion[i]) ? (d.educacion[i].requisito        || '') : '';
        var esp  = (d.educacion && d.educacion[i]) ? (d.educacion[i].especificaciones || '') : '';
        var reqd = (d.educacion && d.educacion[i])
            ? (d.educacion[i].requerido == 1 ? 'Requerido' : 'Deseable') : '';
        eduRows += '<tr>'
            + '<td style="border:1px solid #000;padding:5px 6px;">' + req  + '</td>'
            + '<td style="border:1px solid #000;padding:5px 6px;">' + esp  + '</td>'
            + '<td style="border:1px solid #000;padding:5px 6px;text-align:center;">' + reqd + '</td>'
            + '</tr>';
    }

    // ── Experiencia ───────────────────────────────────────────────────────────
    var expRows = '';
    for (var i = 0; i < 2; i++) {
        var reqExp  = (d.experiencia && d.experiencia[i]) ? (d.experiencia[i].requisito || '') : '';
        var reqdExp = (d.experiencia && d.experiencia[i])
            ? (d.experiencia[i].requerido == 1 ? 'Requerido' : 'Deseable') : '';
        expRows += '<tr>'
            + '<td style="border:1px solid #000;padding:5px 6px;">'                     + reqExp  + '</td>'
            + '<td style="border:1px solid #000;padding:5px 6px;text-align:center;">'   + reqdExp + '</td>'
            + '</tr>';
    }

    // ── Competencias Técnicas ─────────────────────────────────────────────────
    var compTechRows = '';
    for (var i = 0; i < 5; i++) {
        var nom = (d.competenciasTecnicas && d.competenciasTecnicas[i]) ? (d.competenciasTecnicas[i].nombre || '') : '';
        var niv = (d.competenciasTecnicas && d.competenciasTecnicas[i]) ? (d.competenciasTecnicas[i].nivel  || '') : '';
        compTechRows += '<tr>'
            + '<td style="border:1px solid #000;padding:5px 6px;text-align:center;width:12%;">' + (nom ? (i + 1) : '') + '</td>'
            + '<td style="border:1px solid #000;padding:5px 6px;">'                             + nom                  + '</td>'
            + '<td style="border:1px solid #000;padding:5px 6px;text-align:center;width:22%;">' + niv                  + '</td>'
            + '</tr>';
    }

    // ── Competencias Conductuales ─────────────────────────────────────────────
    var compCondRows = '';
    for (var i = 0; i < 3; i++) {
        var nomCond  = (d.competenciasConductuales && d.competenciasConductuales[i]) ? (d.competenciasConductuales[i].nombre      || '') : '';
        var descCond = (d.competenciasConductuales && d.competenciasConductuales[i]) ? (d.competenciasConductuales[i].descripcion || '') : '';
        compCondRows += '<tr>'
            + '<td style="border:1px solid #000;padding:5px 6px;width:35%;">' + nomCond  + '</td>'
            + '<td style="border:1px solid #000;padding:5px 6px;">'           + descCond + '</td>'
            + '</tr>';
    }

    // ── Sexo display ──────────────────────────────────────────────────────────
    var sexoDisplay = d.perfil && d.perfil.sexo
        ? (d.perfil.sexo === 'MASCULINO' ? 'Masculino'
            : d.perfil.sexo === 'FEMENINO' ? 'Femenino' : 'Indiferente')
        : '';

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Descriptor ${d.codigo || ''}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: Arial, sans-serif;
    font-size: 10pt;
    margin: 0;
    padding: 18px 22px;
    color: #000;
  }
  /* ── Shared table base ── */
  table { border-collapse: collapse; width: 100%; }
  td, th { font-size: 10pt; }

  /* ── Header band ── */
  .header-table td {
    border: 1.5px solid #000;
    padding: 6px 8px;
    vertical-align: middle;
  }
  .header-logo   { width: 18%; text-align: center; }
  .header-title  { width: 52%; text-align: center; font-weight: bold; font-size: 11pt; border-left: none !important; border-right: none !important; }
  .header-meta   { width: 30%; text-align: left; font-size: 9pt; }

  /* ── Section header row ── */
  .sec-header { background: #D9D9D9; font-weight: bold; text-align: left; border: 1.5px solid #000; padding: 5px 8px; }

  /* ── General data table ── */
  .gen-table td {
    border: 1px solid #000;
    padding: 4px 7px;
    vertical-align: top;
  }
  .gen-label { font-weight: bold; width: 24%; background: #fff; }
  .gen-value { width: 30%; }
  .gen-label2 { font-weight: bold; width: 20%; }
  .gen-value2 { width: 26%; }

  /* ── Two-column layout (funciones) ── */
  .two-col-table { border: 1px solid #000; }
  .two-col-table td { border: none; vertical-align: top; padding: 0; }
  .two-col-header { background: #fff; font-weight: bold; padding: 4px 7px; border-right: 1px solid #000; border-bottom: 1px solid #000; }
  .two-col-header.last { border-right: none; }
  .two-col-inner { padding: 2px 0; }
  .two-col-inner td { border: none; padding: 2px 7px; }

  /* ── KPI table ── */
  .kpi-subheader th {
    background: #fff;
    border: 1px solid #000;
    padding: 4px 7px;
    font-weight: bold;
  }

  /* ── Sup/Info rows ── */
  .info-label { font-weight: bold; width: 24%; border: 1px solid #000; padding: 5px 7px; vertical-align: top; }
  .info-value { border: 1px solid #000; padding: 5px 7px; vertical-align: top; }

  /* ── Profile / Page 2 ── */
  .profile-table td { border: 1px solid #000; padding: 5px 7px; }
  .profile-label { font-weight: bold; width: 24%; }
  .profile-label2 { font-weight: bold; width: 20%; }

  /* ── Sub-headers for edu/exp/comp tables ── */
  .sub-header th {
    background: #fff;
    border: 1px solid #000;
    padding: 4px 7px;
    font-weight: bold;
  }

  /* ── Firmas ── */
  .firma-cell {
    border: 1px solid #000;
    text-align: center;
    padding: 10px 6px;
    width: 33.3%;
    vertical-align: top;
  }
  .firma-line { margin-top: 8px; margin-bottom: 2px; border-top: 1px solid #000; width: 70%; display: inline-block; }

  /* ── Spacing ── */
  .mt8  { margin-top: 8px; }
  .mt12 { margin-top: 12px; }
  .page-break { page-break-before: always; }

  /* ── Footer ── */
  .footer { text-align: center; font-size: 8pt; color: #444; margin-top: 14px; }
</style>
</head>
<body>

<!-- ═══════════════════════════════════════════════════════════════ PÁGINA 1 -->

<!-- ENCABEZADO PÁGINA 1 -->
<table class="header-table" style="margin-bottom:10px;">
  <tr>
    <td class="header-logo">${logoHtml}</td>
    <td class="header-title">DEPARTAMENTO DE TALENTO HUMANO<br><span style="font-size:10pt;">DESCRIPTOR Y PERFIL DE PUESTO</span></td>
    <td class="header-meta">
      <strong>Código:</strong> ${d.codigo || ''}<br>
      <strong>Fecha de Emisión:</strong> ${d.fechaEmision || fechaActual}<br>
      <strong>Páginas:</strong> 1 de 2
    </td>
  </tr>
</table>

<!-- GENERALIDADES DEL PUESTO -->
<table class="gen-table">
  <tr><td colspan="4" class="sec-header">GENERALIDADES DEL PUESTO</td></tr>
  <tr>
    <td class="gen-label">TITULO DEL PUESTO:</td>
    <td class="gen-value">${d.puesto || ''}</td>
    <td class="gen-label2">CODIGO:</td>
    <td class="gen-value2">${d.codigo || ''}</td>
  </tr>
  <tr>
    <td class="gen-label">DIRECCION / DEPTO:</td>
    <td class="gen-value">${d.area || ''}</td>
    <td class="gen-label2">FECHA DE EMISION:</td>
    <td class="gen-value2">${d.fechaEmision || fechaActual}</td>
  </tr>
  <tr>
    <td class="gen-label">PUESTO AL QUE SE REPORTA:</td>
    <td class="gen-value">${d.reportaA || ''}</td>
    <td class="gen-label2">FECHA DE REVISION:</td>
    <td class="gen-value2">${fechaActual}</td>
  </tr>
  <tr>
    <td class="gen-label">N° de Personal a cargo:</td>
    <td class="gen-value">${d.entrenamiento && d.entrenamiento.personalCargo ? d.entrenamiento.personalCargo : 'N/A'}</td>
    <td class="gen-label2">PAGINAS:</td>
    <td class="gen-value2">1 de 2</td>
  </tr>
</table>

<!-- OBJETIVO -->
<table class="gen-table mt8">
  <tr>
    <td style="border:1px solid #000;padding:5px 7px;font-weight:bold;width:24%;vertical-align:top;">Objetivo del Puesto</td>
    <td style="border:1px solid #000;padding:5px 7px;">${d.objetivo || ''}</td>
  </tr>
</table>

<!-- FUNCIONES CLAVES + SECUNDARIAS (layout tabla de 2 columnas) -->
<table class="two-col-table mt8">
  <tr>
    <td class="two-col-header" style="width:50%;">Funciones Claves</td>
    <td class="two-col-header last" style="width:50%;">Funciones Secundarias</td>
  </tr>
  <tr>
    <td style="vertical-align:top;border-right:1px solid #000;padding:0;">
      <table class="two-col-inner" style="width:100%;">${funcionesClavesRows}</table>
    </td>
    <td style="vertical-align:top;padding:0;">
      <table class="two-col-inner" style="width:100%;">${funcionesSecRows}</table>
    </td>
  </tr>
</table>

<!-- INDICADORES DE DESEMPEÑO -->
<table class="gen-table mt8">
  <tr><td colspan="2" class="sec-header">Indicadores de Desempeño</td></tr>
  <tr class="kpi-subheader">
    <th style="width:55%;">Indicador</th>
    <th style="width:45%;">Frecuencia / Meta</th>
  </tr>
  ${kpisRows}
</table>

<!-- SUPERVISA / INDUCCIÓN / IMPACTO -->
<table class="gen-table mt8">
  <tr>
    <td class="info-label">Supervisa a:</td>
    <td class="info-value">${(d.responsabilidades && d.responsabilidades.equipo) ? d.responsabilidades.equipo : 'N/A'}</td>
  </tr>
  <tr>
    <td class="info-label">Inducción Específica al Puesto</td>
    <td class="info-value">
      <strong>Duración:</strong> ${(d.entrenamiento && d.entrenamiento.duracion) ? d.entrenamiento.duracion : '2 semanas'}<br>
      <strong>Responsable:</strong> ${(d.entrenamiento && d.entrenamiento.puestosResponsables) ? d.entrenamiento.puestosResponsables : ''}
    </td>
  </tr>
  <tr>
    <td class="info-label">Impacto Económico Institucional:</td>
    <td class="info-value">${(d.responsabilidades && d.responsabilidades.impactoEconomico) ? d.responsabilidades.impactoEconomico : 'Poco significativo, (menor a $50,000.00).'}</td>
  </tr>
</table>

<!-- PERFIL DE PUESTO (al final de la pag 1, antes del salto) -->
<table class="profile-table mt8">
  <tr><td colspan="4" class="sec-header">PERFIL DE PUESTO</td></tr>
  <tr>
    <td class="profile-label">Edad:</td>
    <td>${(d.perfil && d.perfil.edadMin) ? d.perfil.edadMin : '18'} - ${(d.perfil && d.perfil.edadMax) ? d.perfil.edadMax : '65'} años</td>
    <td class="profile-label2">Sexo:</td>
    <td>${sexoDisplay}</td>
  </tr>
  <tr>
    <td class="profile-label">Modalidad de Trabajo:</td>
    <td>${(d.perfil && d.perfil.modalidadTrabajo) ? d.perfil.modalidadTrabajo : 'Presencial'}</td>
    <td class="profile-label2">Otros:</td>
    <td>${(d.perfil && d.perfil.disponibilidadHorario) ? d.perfil.disponibilidadHorario : 'Tiempo Completo'}</td>
  </tr>
</table>

<!-- ═══════════════════════════════════════════════════════════════ PÁGINA 2 -->
<div class="page-break">

<!-- ENCABEZADO PÁGINA 2 (igual al de pag 1 pero dice 2 de 2) -->
<table class="header-table" style="margin-bottom:10px;">
  <tr>
    <td class="header-logo">${logoHtml}</td>
    <td class="header-title">DEPARTAMENTO DE TALENTO HUMANO<br><span style="font-size:10pt;">DESCRIPTOR Y PERFIL DE PUESTO</span></td>
    <td class="header-meta">
      <strong>Código:</strong> ${d.codigo || ''}<br>
      <strong>Fecha de Emisión:</strong> ${d.fechaEmision || fechaActual}<br>
      <strong>Páginas:</strong> 2 de 2
    </td>
  </tr>
</table>

<!-- EDUCACIÓN -->
<table class="gen-table">
  <tr><td colspan="3" class="sec-header">EDUCACION</td></tr>
  <tr class="sub-header">
    <th style="width:36%;">Requisito</th>
    <th style="width:44%;">Especificaciones</th>
    <th style="width:20%;">Requerido</th>
  </tr>
  ${eduRows}
</table>

<!-- EXPERIENCIA -->
<table class="gen-table mt8">
  <tr><td colspan="2" class="sec-header">EXPERIENCIA</td></tr>
  <tr class="sub-header">
    <th style="width:72%;">Requisito</th>
    <th style="width:28%;">Requerido</th>
  </tr>
  ${expRows}
</table>

<!-- COMPETENCIAS TÉCNICAS -->
<table class="gen-table mt8">
  <tr><td colspan="3" class="sec-header">COMPETENCIAS TÉCNICAS</td></tr>
  <tr class="sub-header">
    <th style="width:12%;">Código</th>
    <th>Competencias Técnicas Requeridas</th>
    <th style="width:22%;">Nivel de Dominio</th>
  </tr>
  ${compTechRows}
</table>

<!-- COMPETENCIAS CONDUCTUALES -->
<table class="gen-table mt8">
  <tr><td colspan="2" class="sec-header">COMPETENCIAS CONDUCTUALES</td></tr>
  ${compCondRows}
</table>

<!-- FIRMAS -->
<table class="gen-table mt12">
  <tr><td colspan="3" class="sec-header">FIRMAS</td></tr>
  <tr>
    <td class="firma-cell">
      <strong>${d.titular || '_________________'}</strong><br>
      Nombre del Empleado<br><br>
      ${getFirmaHtml(firmaCT)}<br>
      <span class="firma-line"></span><br>
      Fecha y Firma:&nbsp;${d.fechaFirmaCT ? new Date(d.fechaFirmaCT).toLocaleDateString('es-ES') : '_________'}
    </td>
    <td class="firma-cell">
      <strong>${d.creador || '_________________'}</strong><br>
      Nombre de Jefatura<br><br>
      ${getFirmaHtml(firmaJI)}<br>
      <span class="firma-line"></span><br>
      Fecha y Firma:&nbsp;${d.fechaFirmaJI ? new Date(d.fechaFirmaJI).toLocaleDateString('es-ES') : '_________'}
    </td>
    <td class="firma-cell">
      <strong>_________________</strong><br>
      Jefe de Talento Humano<br><br>
      ${getFirmaHtml(firmaJTH)}<br>
      <span class="firma-line"></span><br>
      Fecha y Firma:&nbsp;${d.fechaFirmaJTH ? new Date(d.fechaFirmaJTH).toLocaleDateString('es-ES') : '_________'}
    </td>
  </tr>
</table>

<div class="footer">Departamento de Talento Humano | 2025</div>

</div><!-- end page 2 -->
</body>
</html>`;
}

// Exportar función global
window.generarVersionCorta = generarVersionCorta;