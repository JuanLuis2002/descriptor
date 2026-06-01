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

// Generar HTML para versión corta (formato EXACTAMENTE como en las imágenes)
function generarHTMLVersionCorta(d) {
    var firmasGuardadas = JSON.parse(localStorage.getItem('firmas') || '{}');
    var firmaJI  = firmasGuardadas['ji_'  + d.id] || d.firmaJI  || null;
    var firmaJTH = firmasGuardadas['jth_' + d.id] || d.firmaJTH || null;
    var firmaCT  = firmasGuardadas['ct_'  + d.id] || d.firmaCT  || null;

    function getFirmaHtml(firmaDataUrl) {
        if (firmaDataUrl) return '<img src="' + firmaDataUrl + '" style="width:100px;height:35px;vertical-align:middle;margin-left:8px;">';
        return '';
    }

    var fechaActual = new Date().toLocaleDateString('es-ES');
    var logoHtml = LOGO_PATH ? '<img src="' + LOGO_PATH + '" height="45">' : '';

    // ── Funciones Claves: solo las que tienen contenido ───────────────────────
    var funcionesClavesRows = '';
    if (d.funcionesClaves && d.funcionesClaves.length > 0) {
        for (var i = 0; i < d.funcionesClaves.length; i++) {
            var nombre = d.funcionesClaves[i].nombre || '';
            if (!nombre) continue;
            var codigo = d.funcionesClaves[i].codigo ? '[' + d.funcionesClaves[i].codigo + '] ' : '';
            funcionesClavesRows += '<tr><td style="padding:2px 6px;border:none;">' + (i+1) + '. ' + codigo + nombre + '</td></tr>';
        }
    }
    if (!funcionesClavesRows) {
        for (var i = 0; i < 5; i++) funcionesClavesRows += '<tr><td style="padding:2px 6px;border:none;">' + (i+1) + '.&nbsp;</td></tr>';
    }

    // ── Funciones Secundarias: solo las que tienen contenido ──────────────────
    var funcionesSecRows = '';
    if (d.funcionesSecundarias && d.funcionesSecundarias.length > 0) {
        for (var i = 0; i < d.funcionesSecundarias.length; i++) {
            var fs = d.funcionesSecundarias[i] || '';
            if (!fs) continue;
            funcionesSecRows += '<tr><td style="padding:2px 6px;border:none;">' + (i+1) + '. ' + fs + '</td></tr>';
        }
    }
    if (!funcionesSecRows) {
        for (var i = 0; i < 5; i++) funcionesSecRows += '<tr><td style="padding:2px 6px;border:none;">' + (i+1) + '.&nbsp;</td></tr>';
    }

    // ── KPIs ──────────────────────────────────────────────────────────────────
    var kpisRows = '';
    for (var i = 0; i < 5; i++) {
        var indicador  = (d.kpis && d.kpis[i]) ? (d.kpis[i].indicador  || '') : '';
        var frecuencia = (d.kpis && d.kpis[i]) ? (d.kpis[i].frecuencia || '') : '';
        var meta       = (d.kpis && d.kpis[i]) ? (d.kpis[i].meta       || '') : '';
        var freqMeta   = (frecuencia && meta) ? frecuencia + ' / ' + meta : (frecuencia || meta);
        kpisRows += '<tr>'
            + '<td style="border:1px solid #000;padding:5px 6px;height:18px;">' + indicador + '</td>'
            + '<td style="border:1px solid #000;padding:5px 6px;">'             + freqMeta  + '</td>'
            + '</tr>';
    }

    // ── Educación ─────────────────────────────────────────────────────────────
    var eduRows = '';
    for (var i = 0; i < 2; i++) {
        var req  = (d.educacion && d.educacion[i]) ? (d.educacion[i].requisito        || '') : '';
        var esp  = (d.educacion && d.educacion[i]) ? (d.educacion[i].especificaciones || '') : '';
        var reqd = (d.educacion && d.educacion[i]) ? (d.educacion[i].requerido == 1   ? 'Requerido' : 'Deseable') : '';
        eduRows += '<tr>'
            + '<td style="border:1px solid #000;padding:5px 6px;height:18px;">'                   + req  + '</td>'
            + '<td style="border:1px solid #000;padding:5px 6px;">'                               + esp  + '</td>'
            + '<td style="border:1px solid #000;padding:5px 6px;text-align:center;width:18%;">'   + reqd + '</td>'
            + '</tr>';
    }

    // ── Experiencia ───────────────────────────────────────────────────────────
    var expRows = '';
    for (var i = 0; i < 2; i++) {
        var reqExp  = (d.experiencia && d.experiencia[i]) ? (d.experiencia[i].requisito || '') : '';
        var reqdExp = (d.experiencia && d.experiencia[i]) ? (d.experiencia[i].requerido == 1 ? 'Requerido' : 'Deseable') : '';
        expRows += '<tr>'
            + '<td style="border:1px solid #000;padding:5px 6px;height:18px;">'                   + reqExp  + '</td>'
            + '<td style="border:1px solid #000;padding:5px 6px;text-align:center;width:22%;">'   + reqdExp + '</td>'
            + '</tr>';
    }

    // ── Competencias Técnicas ─────────────────────────────────────────────────
    var compTechRows = '';
    for (var i = 0; i < 5; i++) {
        var nom = (d.competenciasTecnicas && d.competenciasTecnicas[i]) ? (d.competenciasTecnicas[i].nombre || '') : '';
        var niv = (d.competenciasTecnicas && d.competenciasTecnicas[i]) ? (d.competenciasTecnicas[i].nivel  || '') : '';
        compTechRows += '<tr>'
            + '<td style="border:1px solid #000;padding:5px 6px;text-align:center;width:12%;height:18px;">' + (nom ? (i+1) : '') + '</td>'
            + '<td style="border:1px solid #000;padding:5px 6px;">'                                          + nom               + '</td>'
            + '<td style="border:1px solid #000;padding:5px 6px;text-align:center;width:22%;">'             + niv               + '</td>'
            + '</tr>';
    }

    // ── Competencias Conductuales ─────────────────────────────────────────────
    var compCondRows = '';
    for (var i = 0; i < 3; i++) {
        var nomCond  = (d.competenciasConductuales && d.competenciasConductuales[i]) ? (d.competenciasConductuales[i].nombre      || '') : '';
        var descCond = (d.competenciasConductuales && d.competenciasConductuales[i]) ? (d.competenciasConductuales[i].descripcion || '') : '';
        compCondRows += '<tr>'
            + '<td style="border:1px solid #000;padding:5px 6px;width:40%;height:22px;">' + nomCond  + '</td>'
            + '<td style="border:1px solid #000;padding:5px 6px;">'                       + descCond + '</td>'
            + '</tr>';
    }

    var sexoDisplay = '';
    if (d.perfil && d.perfil.sexo) {
        sexoDisplay = d.perfil.sexo === 'MASCULINO' ? 'Masculino' : d.perfil.sexo === 'FEMENINO' ? 'Femenino' : 'Indiferente';
    }

    var CSS = `
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Arial, sans-serif; font-size: 10pt; color: #000; padding: 20px 25px; }
      table { border-collapse: collapse; width: 100%; }
      td, th { font-size: 10pt; }

      /* ── Encabezado ── */
      .hdr td { border: 1.5px solid #000; padding: 5px 8px; vertical-align: middle; }
      .hdr-logo  { width: 16%; text-align: center; }
      .hdr-title { width: 52%; text-align: center; font-weight: bold; font-size: 11pt; border-left: none !important; border-right: none !important; }
      .hdr-meta  { width: 32%; font-size: 9pt; }

      /* ── Fila de sección (sin gris) ── */
      .sec { font-weight: bold; border: 1px solid #000; padding: 4px 7px; background: #fff; }

      /* ── Tablas generales ── */
      .t td  { border: 1px solid #000; padding: 4px 7px; vertical-align: top; }
      .lbl   { font-weight: bold; }
      .mt6   { margin-top: 6px; }
      .mt10  { margin-top: 10px; }

      /* ── Sub-encabezados de columna (sin gris) ── */
      .col-hdr th { border: 1px solid #000; padding: 4px 7px; font-weight: bold; background: #fff; text-align: left; }

      /* ── Firmas ── */
      .firma-t td { border: 1px solid #000; padding: 5px 8px; vertical-align: middle; }
      .firma-lbl  { width: 22%; font-size: 9.5pt; }
      .firma-val  { width: 28%; }
      .firma-lbl2 { width: 20%; font-size: 9.5pt; }
      .firma-val2 { width: 30%; }

      .page-break { page-break-before: always; }
      .footer { text-align: right; font-size: 8pt; color: #444; margin-top: 12px; }
    </style>`;

    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Descriptor ${d.codigo || ''}</title>${CSS}</head>
<body>

<!-- ══════════════════════════════════════════════ PÁGINA 1 -->

<!-- Encabezado -->
<table class="hdr" style="margin-bottom:8px;">
  <tr>
    <td class="hdr-logo">${logoHtml}</td>
    <td class="hdr-title">DEPARTAMENTO DE TALENTO HUMANO<br><span style="font-size:10pt;font-weight:normal;">DESCRIPTOR Y PERFIL DE PUESTO</span></td>
    <td class="hdr-meta">
      <strong>Código:</strong> ${d.codigo || ''}<br>
      <strong>Fecha de Emisión:</strong> ${d.fechaEmision || fechaActual}<br>
      <strong>Páginas:</strong> 1 de 2
    </td>
  </tr>
</table>

<!-- Generalidades -->
<table class="t">
  <tr><td colspan="4" class="sec">GENERALIDADES DEL PUESTO</td></tr>
  <tr>
    <td class="lbl" style="width:22%;">TITULO DEL PUESTO:</td>
    <td style="width:30%;">${d.puesto || ''}</td>
    <td class="lbl" style="width:20%;">CODIGO:</td>
    <td>${d.codigo || ''}</td>
  </tr>
  <tr>
    <td class="lbl">DIRECCION / DEPTO:</td>
    <td>${d.area || ''}</td>
    <td class="lbl">FECHA DE EMISION:</td>
    <td>${d.fechaEmision || fechaActual}</td>
  </tr>
  <tr>
    <td class="lbl">PUESTO AL QUE SE REPORTA:</td>
    <td>${d.reportaA || ''}</td>
    <td class="lbl">FECHA DE REVISION:</td>
    <td>${fechaActual}</td>
  </tr>
  <tr>
    <td class="lbl">N° de Personal a cargo:</td>
    <td>${(d.entrenamiento && d.entrenamiento.personalCargo) ? d.entrenamiento.personalCargo : 'N/A'}</td>
    <td class="lbl">PAGINAS:</td>
    <td>1 de 2</td>
  </tr>
</table>

<!-- Objetivo + Funciones (tabla unificada, igual al PDF) -->
<table class="t mt6">
  <tr>
    <td class="lbl" style="width:22%;vertical-align:top;">Objetivo del Puesto</td>
    <td colspan="3">${d.objetivo || ''}</td>
  </tr>
  <tr>
    <td class="lbl" style="vertical-align:top;">Funciones Claves</td>
    <td colspan="3" style="padding:0;">
      <table style="width:100%;border-collapse:collapse;">${funcionesClavesRows}</table>
    </td>
  </tr>
  <tr>
    <td class="lbl" style="vertical-align:top;">Funciones<br>Secundarias</td>
    <td colspan="3" style="padding:0;">
      <table style="width:100%;border-collapse:collapse;">${funcionesSecRows}</table>
    </td>
  </tr>
</table>

<!-- Indicadores de Desempeño -->
<table class="t mt6">
  <tr><td colspan="2" class="sec">Indicadores de Desempeño</td></tr>
  <tr class="col-hdr">
    <th style="width:55%;">Indicador</th>
    <th>Frecuencia / Meta</th>
   </tr>
  ${kpisRows}
</table>

<!-- Supervisa / Inducción / Impacto -->
<table class="t mt6">
  <tr>
    <td class="lbl" style="width:22%;vertical-align:top;">Supervisa a:</td>
    <td>${(d.responsabilidades && d.responsabilidades.equipo) ? d.responsabilidades.equipo : 'N/A'}</td>
  </tr>
  <tr>
    <td class="lbl" style="vertical-align:top;">Inducción Específica<br>al Puesto</td>
    <td>Duración: ${(d.entrenamiento && d.entrenamiento.duracion) ? d.entrenamiento.duracion : '2 semanas'}<br>Responsable: ${(d.entrenamiento && d.entrenamiento.puestosResponsables) ? d.entrenamiento.puestosResponsables : ''}</td>
  </tr>
  <tr>
    <td class="lbl" style="vertical-align:top;">Impacto Económico<br>Institucional:</td>
    <td>${(d.responsabilidades && d.responsabilidades.impactoEconomico) ? d.responsabilidades.impactoEconomico : 'Poco significativo, (menor a $50,000.00).'}</td>
  </tr>
</table>

<!-- Perfil de Puesto -->
<table class="t mt6">
  <tr><td colspan="4" class="sec">PERFIL DE PUESTO</td></tr>
  <tr>
    <td class="lbl" style="width:14%;">Edad:</td>
    <td colspan="3">${(d.perfil && d.perfil.edadMin) ? d.perfil.edadMin : ''} ${(d.perfil && d.perfil.edadMax) ? '- ' + d.perfil.edadMax + ' años' : ''}</td>
  </tr>
  <tr>
    <td class="lbl">Sexo:</td>
    <td colspan="3">${sexoDisplay}</td>
  </tr>
  <tr>
    <td class="lbl">Modalidad de Trabajo:</td>
    <td style="width:36%;">${(d.perfil && d.perfil.modalidadTrabajo) ? d.perfil.modalidadTrabajo : 'P'}</td>
    <td class="lbl" style="width:14%;">Otros:</td>
    <td>${(d.perfil && d.perfil.disponibilidadHorario) ? d.perfil.disponibilidadHorario : ''}</td>
  </tr>
</table>

<!-- Educación (al final pág 1, igual al PDF) -->
<table class="t mt6">
  <tr><td colspan="3" class="sec">EDUCACION</td></tr>
  <tr class="col-hdr">
    <th style="width:36%;">Requisito</th>
    <th style="width:46%;">Especificaciones</th>
    <th style="width:18%;">Requerido</th>
   </tr>
  ${eduRows}
</table>

<!-- ══════════════════════════════════════════════ PÁGINA 2 (sin encabezado) -->
<div class="page-break">

<!-- Experiencia -->
<table class="t">
  <tr><td colspan="2" class="sec">EXPERIENCIA</td></tr>
  <tr class="col-hdr">
    <th>Requisito</th>
    <th style="width:22%;">Requerido</th>
   </tr>
  ${expRows}
</table>

<!-- Competencias Técnicas -->
<table class="t mt10">
  <tr><td colspan="3" class="sec">COMPETENCIAS TÉCNICAS</td></tr>
  <tr class="col-hdr">
    <th style="width:12%;">Código</th>
    <th>Competencias Técnicas Requeridas</th>
    <th style="width:22%;">Nivel de Dominio</th>
   </tr>
  ${compTechRows}
</table>

<!-- Competencias Conductuales -->
<table class="t mt10">
  <tr><td colspan="2" style="text-align:center;border:1px solid #000;padding:4px 7px;font-weight:bold;">Competencias Conductuales</td></tr>
  ${compCondRows}
</td>

<!-- FIRMAS CORREGIDAS -->
<table class="firma-t mt10">
  <tr><td colspan="4" style="font-weight:bold;border:none;padding:4px 0;">FIRMAS</td></tr>
  <tr>
    <td class="firma-lbl">Nombre del Empleado:</td>
    <td class="firma-val">${d.titular || '_________________'}</td>
    <td class="firma-lbl2">Fecha y Firma:</td>
    <td class="firma-val2">${d.fechaFirmaCT ? new Date(d.fechaFirmaCT).toLocaleDateString('es-ES') : '_________'} ${getFirmaHtml(firmaCT)}</td>
  </tr>
  <tr>
    <td class="firma-lbl">Nombre de Jefatura:</td>
    <td class="firma-val">${d.creador || '_________________'}</td>
    <td class="firma-lbl2">Fecha y Firma:</td>
    <td class="firma-val2">${d.fechaFirmaJI ? new Date(d.fechaFirmaJI).toLocaleDateString('es-ES') : '_________'} ${getFirmaHtml(firmaJI)}</td>
  </tr>
  <tr>
    <td class="firma-lbl">Jefe de Talento Humano:</td>
    <td class="firma-val">_________________</td>
    <td class="firma-lbl2">Fecha y Firma:</td>
    <td class="firma-val2">${d.fechaFirmaJTH ? new Date(d.fechaFirmaJTH).toLocaleDateString('es-ES') : '_________'} ${getFirmaHtml(firmaJTH)}</td>
  </tr>
</table>

<div class="footer">Departamento de Talento Humano | 2025</div>
</div>

</body></html>`;
}

// Exportar función global
window.generarVersionCorta = generarVersionCorta;



// Generar versión extensa del descriptor
function generarVersionExtensa(id) {
    var descriptor = DescriptorService.getById(id);
    if (!descriptor) {
        Swal.fire('Error', 'No se encontró el descriptor', 'error');
        return;
    }
    
    // Generar el HTML para el PDF extenso
    var pdfHtml = generarHTMLVersionExtensa(descriptor);
    
    // Mostrar modal con previsualización
    Swal.fire({
        title: 'Descriptor de Puesto - Versión Extensa',
        html: '<div id="pdfPreviewContainer" style="max-height: 70vh; overflow-y: auto; background: #f0f2f5; padding: 10px; border-radius: 8px;">' +
              '<div id="pdfContent" style="background: white; padding: 20px; border-radius: 8px;">' + pdfHtml + '</div>' +
              '</div>' +
              '<div class="mt-3 d-flex justify-content-center gap-2">' +
              '<button id="btnDescargarPDFExtenso" class="btn btn-success"><i class="fas fa-download"></i> Descargar PDF</button>' +
              '<button id="btnImprimirPDFExtenso" class="btn btn-info"><i class="fas fa-print"></i> Imprimir</button>' +
              '</div>',
        width: '1000px',
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: 'Cerrar',
        didOpen: function() {
            $('#btnDescargarPDFExtenso').click(function() {
                var element = document.getElementById('pdfContent');
                var opt = {
                    margin: [0.5, 0.5, 0.5, 0.5],
                    filename: 'descriptor_extenso_' + descriptor.codigo + '.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, letterRendering: true, useCORS: true },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                };
                html2pdf().set(opt).from(element).save();
            });
            
            $('#btnImprimirPDFExtenso').click(function() {
                var element = document.getElementById('pdfContent');
                var opt = {
                    margin: [0.5, 0.5, 0.5, 0.5],
                    filename: 'descriptor_extenso_' + descriptor.codigo + '.pdf',
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

// Generar HTML para versión extensa
function generarHTMLVersionExtensa(d) {
    // Obtener firmas guardadas
    var firmasGuardadas = JSON.parse(localStorage.getItem('firmas') || '{}');
    var firmaJI = firmasGuardadas['ji_' + d.id] || d.firmaJI || null;
    var firmaJTH = firmasGuardadas['jth_' + d.id] || d.firmaJTH || null;
    var firmaCT = firmasGuardadas['ct_' + d.id] || d.firmaCT || null;
    
    function getFirmaHtml(firmaDataUrl) {
        if (firmaDataUrl) {
            return '<img src="' + firmaDataUrl + '" style="width: 100px; height: 35px;">';
        }
        return '_________________';
    }
    
    var fechaActual = new Date().toLocaleDateString('es-ES');
    var logoHtml = LOGO_PATH ? '<img src="' + LOGO_PATH + '" height="50">' : '';
    
    // ========== FUNCIONES CLAVES CON ACTIVIDADES ==========
    var funcionesClavesCompleto = '';
    if (d.funcionesClaves && d.funcionesClaves.length > 0) {
        for (var i = 0; i < d.funcionesClaves.length; i++) {
            var codigo = d.funcionesClaves[i].codigo || '';
            var nombre = d.funcionesClaves[i].nombre || '';
            funcionesClavesCompleto += '<strong>' + (i+1) + '. ' + codigo + ' - ' + nombre + '</strong><br>';
            
            // Buscar actividades para esta función
            if (d.actividadesPorFuncion && d.actividadesPorFuncion.length > 0) {
                for (var j = 0; j < d.actividadesPorFuncion.length; j++) {
                    if (d.actividadesPorFuncion[j].funcionNombre === nombre || 
                        d.actividadesPorFuncion[j].funcionNombre === codigo + ' - ' + nombre) {
                        var actividades = d.actividadesPorFuncion[j].actividades || [];
                        if (actividades.length > 0) {
                            funcionesClavesCompleto += '<ul style="margin-left:25px;">';
                            for (var k = 0; k < actividades.length; k++) {
                                funcionesClavesCompleto += '<li>' + actividades[k] + '</li>';
                            }
                            funcionesClavesCompleto += '</ul>';
                        }
                        break;
                    }
                }
            }
            funcionesClavesCompleto += '<br>';
        }
    } else {
        funcionesClavesCompleto = 'No registradas';
    }
    
    // ========== FUNCIONES SECUNDARIAS ==========
    var funcionesSecHtml = '';
    if (d.funcionesSecundarias && d.funcionesSecundarias.length > 0) {
        funcionesSecHtml = '<ul>';
        for (var i = 0; i < d.funcionesSecundarias.length; i++) {
            funcionesSecHtml += '<li>' + (d.funcionesSecundarias[i] || '') + '</li>';
        }
        funcionesSecHtml += '</ul>';
    } else {
        funcionesSecHtml = 'No registradas';
    }
    
    // ========== KPIs ==========
    var kpisHtml = '';
    if (d.kpis && d.kpis.length > 0) {
        kpisHtml = '<table border="1" cellpadding="5" style="width:100%;border-collapse:collapse;">' +
            '<tr bgcolor="#F0F0F0"><th width="50%">Indicador</th><th width="50%">Frecuencia / Meta</th></tr>';
        for (var i = 0; i < d.kpis.length; i++) {
            var freqMeta = '';
            if (d.kpis[i].frecuencia && d.kpis[i].meta) freqMeta = d.kpis[i].frecuencia + ' / ' + d.kpis[i].meta;
            else if (d.kpis[i].frecuencia) freqMeta = d.kpis[i].frecuencia;
            else freqMeta = d.kpis[i].meta || '';
            kpisHtml += '<tr><td>' + (d.kpis[i].indicador || '') + '</td><td>' + freqMeta + '</td></tr>';
        }
        kpisHtml += '</table>';
    } else {
        kpisHtml = 'No hay KPIs registrados';
    }
    
    // ========== RELACIONES LABORALES ==========
    var relacionesInternasHtml = '';
    if (d.relacionesLaborales && d.relacionesLaborales.internas && d.relacionesLaborales.internas.length > 0) {
        relacionesInternasHtml = '<ul>';
        for (var i = 0; i < d.relacionesLaborales.internas.length; i++) {
            relacionesInternasHtml += '<li><strong>' + (d.relacionesLaborales.internas[i].puesto || '') + '</strong>: ' + (d.relacionesLaborales.internas[i].razon || '') + '</li>';
        }
        relacionesInternasHtml += '</ul>';
    } else {
        relacionesInternasHtml = 'No registradas';
    }
    
    var relacionesExternasHtml = '';
    if (d.relacionesLaborales && d.relacionesLaborales.externas && d.relacionesLaborales.externas.length > 0) {
        relacionesExternasHtml = '<ul>';
        for (var i = 0; i < d.relacionesLaborales.externas.length; i++) {
            relacionesExternasHtml += '<li><strong>' + (d.relacionesLaborales.externas[i].entidad || '') + '</strong>: ' + (d.relacionesLaborales.externas[i].razon || '') + '</li>';
        }
        relacionesExternasHtml += '</ul>';
    } else {
        relacionesExternasHtml = 'No registradas';
    }
    
    // ========== REQUERIMIENTOS ORGANIZACIONALES ==========
    var requerimientosHtml = '';
    var requerimientosDefecto = ['Cumplir con los valores institucionales', 'Cumplir con los normativos institucionales', 'Cumplir con las competencias requeridas para el cargo'];
    var requerimientos = (d.requerimientosOrganizacionales && d.requerimientosOrganizacionales.length > 0) ? d.requerimientosOrganizacionales : requerimientosDefecto;
    requerimientosHtml = '<ul>';
    for (var i = 0; i < requerimientos.length; i++) {
        requerimientosHtml += '<li>' + requerimientos[i] + '</li>';
    }
    requerimientosHtml += '</ul>';
    
    // ========== RIESGOS FISICOS ==========
    var riesgosHtml = '';
    if (d.riesgosFisicos) {
        riesgosHtml = '<p><strong>Esfuerzo físico y mental:</strong> ' + (d.riesgosFisicos.esfuerzo || '-') + '</p>' +
            '<p><strong>Condiciones ambientales:</strong> ' + (d.riesgosFisicos.condiciones || '-') + '</p>' +
            '<p><strong>Riesgos profesionales:</strong></p><ul>';
        var riesgosLista = d.riesgosFisicos.riesgos || [];
        if (riesgosLista.length > 0) {
            for (var i = 0; i < riesgosLista.length; i++) {
                riesgosHtml += '<li>' + riesgosLista[i] + '</li>';
            }
        } else {
            riesgosHtml += '<li>No registrados</li>';
        }
        riesgosHtml += '</ul>';
    } else {
        riesgosHtml = 'No hay riesgos registrados';
    }
    
    // ========== EDUCACION ==========
    var educacionHtml = '';
    if (d.educacion && d.educacion.length > 0) {
        educacionHtml = '<table border="1" cellpadding="5" style="width:100%;border-collapse:collapse;">' +
            '<tr bgcolor="#F0F0F0"><th width="40%">Requisito</th><th width="40%">Especificaciones</th><th width="20%">Requerido</th></tr>';
        for (var i = 0; i < d.educacion.length; i++) {
            educacionHtml += '<tr><td>' + (d.educacion[i].requisito || '') + '</td><td>' + (d.educacion[i].especificaciones || '') + '</td><td>' + (d.educacion[i].requerido == 1 ? 'Requerido' : 'Deseable') + '</td></tr>';
        }
        educacionHtml += '</table>';
    } else {
        educacionHtml = 'No hay educación registrada';
    }
    
    // ========== EXPERIENCIA ==========
    var experienciaHtml = '';
    if (d.experiencia && d.experiencia.length > 0) {
        experienciaHtml = '<table border="1" cellpadding="5" style="width:100%;border-collapse:collapse;">' +
            '<tr bgcolor="#F0F0F0"><th width="70%">Requisito</th><th width="30%">Requerido</th></tr>';
        for (var i = 0; i < d.experiencia.length; i++) {
            experienciaHtml += '<tr><td>' + (d.experiencia[i].requisito || '') + '</td><td>' + (d.experiencia[i].requerido == 1 ? 'Requerido' : 'Deseable') + '</td></tr>';
        }
        experienciaHtml += '</table>';
    } else {
        experienciaHtml = 'No hay experiencia registrada';
    }
    
    // ========== COMPETENCIAS TECNICAS ==========
    var compTecnicasHtml = '';
    if (d.competenciasTecnicas && d.competenciasTecnicas.length > 0) {
        compTecnicasHtml = '<table border="1" cellpadding="5" style="width:100%;border-collapse:collapse;">' +
            '<tr bgcolor="#F0F0F0"><th width="15%">Código</th><th width="60%">Competencia Técnica</th><th width="25%">Nivel de Dominio</th></tr>';
        for (var i = 0; i < d.competenciasTecnicas.length; i++) {
            compTecnicasHtml += '<tr><td style="text-align:center;">' + (i+1) + '</td><td>' + (d.competenciasTecnicas[i].nombre || '') + '</td><td style="text-align:center;">' + (d.competenciasTecnicas[i].nivel || '') + '</td></tr>';
        }
        compTecnicasHtml += '</table>';
    } else {
        compTecnicasHtml = 'No hay competencias técnicas registradas';
    }
    
    // ========== COMPETENCIAS CONDUCTUALES ==========
    var compConductualesHtml = '';
    if (d.competenciasConductuales && d.competenciasConductuales.length > 0) {
        compConductualesHtml = '<table border="1" cellpadding="5" style="width:100%;border-collapse:collapse;">';
        for (var i = 0; i < d.competenciasConductuales.length; i++) {
            compConductualesHtml += '<tr><td style="width:30%;"><strong>' + (d.competenciasConductuales[i].nombre || '') + '</strong></td><td>' + (d.competenciasConductuales[i].descripcion || '') + '</td></tr>';
        }
        compConductualesHtml += '</table>';
    } else {
        compConductualesHtml = 'No hay competencias conductuales registradas';
    }
    
    // ========== AUDITORIA (opcional) ==========
    var auditoriaHtml = '';
    if (d.auditoria && d.auditoria.eventos && d.auditoria.eventos.length > 0) {
        var eventos = d.auditoria.eventos;
        eventos.sort(function(a,b) { return new Date(a.fecha) - new Date(b.fecha); });
        auditoriaHtml = '<table border="1" cellpadding="5" style="width:100%;border-collapse:collapse;">' +
            '<tr bgcolor="#F0F0F0"><th>Fecha</th><th>Acción</th><th>Usuario</th><th>Estado</th></tr>';
        for (var i = 0; i < eventos.length; i++) {
            var fecha = new Date(eventos[i].fecha).toLocaleString();
            auditoriaHtml += '<tr><td>' + fecha + '</td><td>' + (eventos[i].accion || '') + '</td><td>' + (eventos[i].usuario || '') + '</td><td>' + (eventos[i].estadoNuevo || eventos[i].estado || '') + '</td></tr>';
        }
        auditoriaHtml += '</table>';
    }
    
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>Descriptor Extenso ${d.codigo}</title></head>
    <body style="font-family:Arial;font-size:10pt;margin:0;padding:15px;">
    
    <!-- PAGINA 1 -->
    <div>
        <table style="width:100%;margin-bottom:10px;">
            <tr><td style="width:20%;">${logoHtml}</td><td style="width:80%;text-align:right;"><strong>Código:</strong> ${d.codigo || 'N/A'}<br><strong>Fecha de Emisión:</strong> ${d.fechaEmision || fechaActual}<br><strong>Versión:</strong> Extensa</td></tr>
        </table>
        <div style="text-align:center;margin:10px 0;">
            <h2 style="margin:0;">DEPARTAMENTO DE TALENTO HUMANO</h2>
            <h3 style="margin:0;">DESCRIPTOR Y PERFIL DE PUESTO - VERSIÓN EXTENSA</h3>
        </div>
        
        <!-- GENERALIDADES -->
        <table border="1" cellpadding="5" style="width:100%;border-collapse:collapse;">
            <tr bgcolor="#D9D9D9"><th colspan="4">GENERALIDADES DEL PUESTO</th></tr>
            <tr><td width="30%"><strong>TITULO DEL PUESTO:</strong></td><td width="40%">${d.puesto || 'N/A'}</td><td width="15%"><strong>CODIGO:</strong></td><td width="15%">${d.codigo || 'N/A'}</td></tr>
            <tr><td><strong>DIRECCION / DEPTO:</strong></td><td>${d.area || 'N/A'}</td><td><strong>FECHA DE EMISION:</strong></td><td>${d.fechaEmision || fechaActual}</td></tr>
            <tr><td><strong>PUESTO AL QUE SE REPORTA:</strong></td><td>${d.reportaA || 'N/A'}</td><td><strong>FECHA DE REVISION:</strong></td><td>${fechaActual}</td></tr>
            <tr><td><strong>N° de Personal a cargo:</strong></td><td>${d.entrenamiento?.personalCargo || 'N/A'}</td><td><strong>PAGINAS:</strong></td><td>1 de X</td></tr>
        </table>
        
        <!-- OBJETIVO -->
        <h4 style="background:#D9D9D9;padding:5px;margin:15px 0 5px 0;">Objetivo del Puesto</h4>
        <p>${d.objetivo || 'No especificado'}</p>
        
        <!-- FUNCIONES CLAVES CON ACTIVIDADES -->
        <h4 style="background:#D9D9D9;padding:5px;margin:15px 0 5px 0;">Funciones Claves y Actividades</h4>
        ${funcionesClavesCompleto}
        
        <!-- FUNCIONES SECUNDARIAS -->
        <h4 style="background:#D9D9D9;padding:5px;margin:15px 0 5px 0;">Funciones Secundarias</h4>
        ${funcionesSecHtml}
        
        <!-- KPIs -->
        <h4 style="background:#D9D9D9;padding:5px;margin:15px 0 5px 0;">Indicadores de Desempeño (KPIs)</h4>
        ${kpisHtml}
    </div>
    
    <!-- PAGINA 2 -->
    <div style="page-break-before:always;">
        <h4 style="background:#D9D9D9;padding:5px;margin:15px 0 5px 0;">RELACIONES LABORALES</h4>
        <p><strong>Relaciones Internas:</strong></p>
        ${relacionesInternasHtml}
        <p><strong>Relaciones Externas:</strong></p>
        ${relacionesExternasHtml}
        
        <h4 style="background:#D9D9D9;padding:5px;margin:15px 0 5px 0;">REQUERIMIENTOS ORGANIZACIONALES</h4>
        ${requerimientosHtml}
        
        <h4 style="background:#D9D9D9;padding:5px;margin:15px 0 5px 0;">RIESGOS FÍSICOS DEL PUESTO</h4>
        ${riesgosHtml}
        
        <h4 style="background:#D9D9D9;padding:5px;margin:15px 0 5px 0;">RESPONSABILIDADES</h4>
        <table border="1" cellpadding="5" style="width:100%;border-collapse:collapse;">
            <tr><td width="30%"><strong>Supervisa a:</strong></td><td>${d.responsabilidades?.equipo || 'N/A'}</td></tr>
            <tr><td><strong>De fondos o valores:</strong></td><td>${d.responsabilidades?.fondos || 'N/A'}</td></tr>
            <tr><td><strong>De documentos:</strong></td><td>${d.responsabilidades?.documentos || 'N/A'}</td></tr>
            <tr><td><strong>Toma de decisiones:</strong></td><td>${d.responsabilidades?.tomaDecisiones || 'N/A'}</td></tr>
            <tr><td><strong>De personal:</strong></td><td>${d.responsabilidades?.personal || 'N/A'}</td></tr>
            <tr><td><strong>Impacto Económico:</strong></td><td>${d.responsabilidades?.impactoEconomico || 'Poco significativo'}</td></tr>
        </table>
        
        <h4 style="background:#D9D9D9;padding:5px;margin:15px 0 5px 0;">ENTRENAMIENTO</h4>
        <table border="1" cellpadding="5" style="width:100%;border-collapse:collapse;">
            <tr><td width="30%"><strong>Personal a cargo:</strong></td><td>${d.entrenamiento?.personalCargo || '0'}</td></tr>
            <tr><td><strong>Tipo de entrenamiento:</strong></td><td>${d.entrenamiento?.tipoEntrenamiento || 'N/A'}</td></tr>
            <tr><td><strong>Duración de inducción:</strong></td><td>${d.entrenamiento?.duracion || 'N/A'}</td></tr>
            <tr><td><strong>Puestos responsables:</strong></td><td>${d.entrenamiento?.puestosResponsables || 'N/A'}</td></tr>
        </table>
    </div>
    
    <!-- PAGINA 3 -->
    <div style="page-break-before:always;">
        <h4 style="background:#D9D9D9;padding:5px;margin:15px 0 5px 0;">PERFIL DEL PUESTO</h4>
        <table border="1" cellpadding="5" style="width:100%;border-collapse:collapse;">
            <tr><td width="25%"><strong>Edad:</strong></td><td width="25%">${d.perfil?.edadMin || '18'} - ${d.perfil?.edadMax || '65'} años</td><td width="25%"><strong>Sexo:</strong></td><td width="25%">${d.perfil?.sexo === 'MASCULINO' ? 'Masculino' : (d.perfil?.sexo === 'FEMENINO' ? 'Femenino' : 'Indiferente')}</td></tr>
            <tr><td><strong>Modalidad de Trabajo:</strong></td><td>${d.perfil?.modalidadTrabajo || 'Presencial'}</td><td><strong>Disponibilidad:</strong></td><td>${d.perfil?.disponibilidadHorario || 'Tiempo Completo'}</td></tr>
            <tr><td><strong>Estado Familiar:</strong></td><td>${d.perfil?.estadoFamiliar || 'Indiferente'}</td><td><strong>Poseer Licencia:</strong></td><td>${d.perfil?.poseerLicencia == '1' ? 'Sí' : 'No'}</td></tr>
        </table>
        
        <h4 style="background:#D9D9D9;padding:5px;margin:15px 0 5px 0;">EDUCACIÓN</h4>
        ${educacionHtml}
        
        <h4 style="background:#D9D9D9;padding:5px;margin:15px 0 5px 0;">EXPERIENCIA</h4>
        ${experienciaHtml}
        
        <h4 style="background:#D9D9D9;padding:5px;margin:15px 0 5px 0;">COMPETENCIAS TÉCNICAS</h4>
        ${compTecnicasHtml}
        
        <h4 style="background:#D9D9D9;padding:5px;margin:15px 0 5px 0;">COMPETENCIAS CONDUCTUALES</h4>
        ${compConductualesHtml}
        
        <!-- FIRMAS -->
        <h4 style="background:#D9D9D9;padding:5px;margin:15px 0 5px 0;">FIRMAS</h4>
        <table border="1" cellpadding="8" style="width:100%;border-collapse:collapse;">
            <tr>
                <td style="width:33%;text-align:center;"><strong>${d.titular || '_________________'}</strong><br>Nombre del Empleado<br>${getFirmaHtml(firmaCT)}<br>Fecha: ${d.fechaFirmaCT ? new Date(d.fechaFirmaCT).toLocaleDateString() : '_________'}</td>
                <td style="width:33%;text-align:center;"><strong>${d.creador || '_________________'}</strong><br>Nombre de Jefatura<br>${getFirmaHtml(firmaJI)}<br>Fecha: ${d.fechaFirmaJI ? new Date(d.fechaFirmaJI).toLocaleDateString() : '_________'}</td>
                <td style="width:34%;text-align:center;"><strong>_________________</strong><br>Jefe de Talento Humano<br>${getFirmaHtml(firmaJTH)}<br>Fecha: ${d.fechaFirmaJTH ? new Date(d.fechaFirmaJTH).toLocaleDateString() : '_________'}</td>
            </tr>
        </table>
        
        <!-- AUDITORIA (opcional) -->
        ${auditoriaHtml ? '<h4 style="background:#D9D9D9;padding:5px;margin:15px 0 5px 0;">AUDITORÍA DEL DESCRIPTOR</h4>' + auditoriaHtml : ''}
        
        <div style="text-align:center;margin-top:20px;font-size:9pt;">Documento generado desde el Sistema de Gestión de Descriptor de Puesto - Versión Extensa</div>
    </div>
    </body>
    </html>
    `;
}

// Exportar función global
window.generarVersionExtensa = generarVersionExtensa;