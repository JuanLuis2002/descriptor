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
var LOGO_PATH = ''; // Colocar aquí la ruta del logo

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

// Generar HTML para versión corta
function generarHTMLVersionCorta(d) {
    // Funciones Claves
    var funcionesClavesHtml = '';
    if (d.funcionesClaves && d.funcionesClaves.length > 0) {
        funcionesClavesHtml = '<ol style="margin-top: 5px; padding-left: 20px;">';
        for (var i = 0; i < d.funcionesClaves.length; i++) {
            var nombre = d.funcionesClaves[i].nombre || '';
            var codigo = d.funcionesClaves[i].codigo ? '[' + d.funcionesClaves[i].codigo + '] ' : '';
            funcionesClavesHtml += '<li>' + codigo + nombre + '</li>';
        }
        funcionesClavesHtml += '</ol>';
    } else {
        funcionesClavesHtml = '<p>No registradas</p>';
    }
    
    // Funciones Secundarias
    var funcionesSecHtml = '';
    if (d.funcionesSecundarias && d.funcionesSecundarias.length > 0) {
        funcionesSecHtml = '<ol style="margin-top: 5px; padding-left: 20px;">';
        for (var i = 0; i < d.funcionesSecundarias.length; i++) {
            funcionesSecHtml += '<li>' + d.funcionesSecundarias[i] + '</li>';
        }
        funcionesSecHtml += '</ol>';
    } else {
        funcionesSecHtml = '<p>No registradas</p>';
    }
    
    // KPIs
    var kpisHtml = '';
    if (d.kpis && d.kpis.length > 0) {
        kpisHtml = '<table style="width: 100%; border-collapse: collapse; margin-top: 5px;">' +
            '<thead>' +
            '<tr style="background: #0d6efd; color: white;">' +
            '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Indicador</th>' +
            '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Frecuencia / Meta</th>' +
            '</tr>' +
            '</thead><tbody>';
        for (var i = 0; i < d.kpis.length; i++) {
            kpisHtml += '<tr>' +
                '<td style="border: 1px solid #ddd; padding: 8px;">' + (d.kpis[i].indicador || '-') + '</td>' +
                '<td style="border: 1px solid #ddd; padding: 8px;">' + (d.kpis[i].frecuencia || '-') + ' / ' + (d.kpis[i].meta || '-') + '</td>' +
                '</tr>';
        }
        kpisHtml += '</tbody></table>';
    } else {
        kpisHtml = '<p>No hay KPIs registrados</p>';
    }
    
    // Educación
    var educacionHtml = '';
    if (d.educacion && d.educacion.length > 0) {
        educacionHtml = '<table style="width: 100%; border-collapse: collapse; margin-top: 5px;">' +
            '<thead>' +
            '<tr style="background: #0d6efd; color: white;">' +
            '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Requisito</th>' +
            '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Especificaciones</th>' +
            '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Requerido</th>' +
            '</tr>' +
            '</thead><tbody>';
        for (var i = 0; i < d.educacion.length; i++) {
            educacionHtml += '<tr>' +
                '<td style="border: 1px solid #ddd; padding: 8px;">' + (d.educacion[i].requisito || '-') + '</td>' +
                '<td style="border: 1px solid #ddd; padding: 8px;">' + (d.educacion[i].especificaciones || '-') + '</td>' +
                '<td style="border: 1px solid #ddd; padding: 8px;">' + (d.educacion[i].requerido == 1 ? 'Requerido' : 'Deseable') + '</td>' +
                '</tr>';
        }
        educacionHtml += '</tbody></table>';
    } else {
        educacionHtml = '<p>No hay educación registrada</p>';
    }
    
    // Experiencia
    var experienciaHtml = '';
    if (d.experiencia && d.experiencia.length > 0) {
        experienciaHtml = '<table style="width: 100%; border-collapse: collapse; margin-top: 5px;">' +
            '<thead>' +
            '<tr style="background: #0d6efd; color: white;">' +
            '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Requisito</th>' +
            '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Requerido</th>' +
            '</tr>' +
            '</thead><tbody>';
        for (var i = 0; i < d.experiencia.length; i++) {
            experienciaHtml += '<tr>' +
                '<td style="border: 1px solid #ddd; padding: 8px;">' + (d.experiencia[i].requisito || '-') + '</td>' +
                '<td style="border: 1px solid #ddd; padding: 8px;">' + (d.experiencia[i].requerido == 1 ? 'Requerido' : 'Deseable') + '</td>' +
                '</tr>';
        }
        experienciaHtml += '</tbody></table>';
    } else {
        experienciaHtml = '<p>No hay experiencia registrada</p>';
    }
    
    // Competencias Técnicas
    var compTecnicasHtml = '';
    if (d.competenciasTecnicas && d.competenciasTecnicas.length > 0) {
        compTecnicasHtml = '<table style="width: 100%; border-collapse: collapse; margin-top: 5px;">' +
            '<thead>' +
            '<tr style="background: #0d6efd; color: white;">' +
            '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Código</th>' +
            '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Competencia Técnica</th>' +
            '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Nivel de Dominio</th>' +
            '</tr>' +
            '</thead><tbody>';
        for (var i = 0; i < d.competenciasTecnicas.length; i++) {
            compTecnicasHtml += '<tr>' +
                '<td style="border: 1px solid #ddd; padding: 8px;">' + (i + 1) + '</td>' +
                '<td style="border: 1px solid #ddd; padding: 8px;">' + (d.competenciasTecnicas[i].nombre || '-') + '</td>' +
                '<td style="border: 1px solid #ddd; padding: 8px;">' + (d.competenciasTecnicas[i].nivel || '-') + '</td>' +
                '</tr>';
        }
        compTecnicasHtml += '</tbody></table>';
    } else {
        compTecnicasHtml = '<p>No hay competencias técnicas registradas</p>';
    }
    
    // Competencias Conductuales
    var compConductualesHtml = '';
    if (d.competenciasConductuales && d.competenciasConductuales.length > 0) {
        compConductualesHtml = '<ul style="margin-top: 5px;">';
        for (var i = 0; i < d.competenciasConductuales.length; i++) {
            compConductualesHtml += '<li><strong>' + (d.competenciasConductuales[i].nombre || '-') + '</strong>: ' + (d.competenciasConductuales[i].descripcion || '-') + '</li>';
        }
        compConductualesHtml += '</ul>';
    } else {
        compConductualesHtml = '<p>No hay competencias conductuales registradas</p>';
    }
    
    // Logo HTML (con ruta configurable)
    var logoHtml = LOGO_PATH ? '<img src="' + LOGO_PATH + '" style="height: 60px; float: left;">' : '<div style="width: 80px; height: 60px; background: #e9ecef; float: left; text-align: center; line-height: 60px; font-size: 10px; color: #6c757d;">LOGO</div>';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Descriptor ${d.codigo}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 11px;
                line-height: 1.4;
                color: #333;
            }
            .header {
                text-align: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 2px solid #0d6efd;
            }
            .header h2 {
                color: #0d6efd;
                font-size: 16px;
                margin: 5px 0;
            }
            .header h3 {
                font-size: 14px;
                margin: 3px 0;
            }
            .logo-area {
                overflow: hidden;
                margin-bottom: 10px;
            }
            .section {
                margin-bottom: 12px;
                page-break-inside: avoid;
            }
            .section-title {
                background: #0d6efd;
                color: white;
                padding: 5px 8px;
                font-size: 12px;
                font-weight: bold;
                margin-bottom: 8px;
                border-radius: 4px;
            }
            .info-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 10px;
            }
            .info-table td, .info-table th {
                border: 1px solid #ddd;
                padding: 6px;
                vertical-align: top;
            }
            .info-table th {
                background: #f8f9fa;
                width: 30%;
                font-weight: 600;
            }
            .signature-area {
                margin-top: 20px;
                display: flex;
                justify-content: space-between;
                flex-wrap: wrap;
            }
            .signature-box {
                width: 32%;
                border-top: 1px solid #333;
                padding-top: 5px;
                text-align: center;
                font-size: 10px;
            }
            .footer {
                margin-top: 15px;
                text-align: center;
                font-size: 9px;
                color: #6c757d;
                border-top: 1px solid #dee2e6;
                padding-top: 8px;
            }
            @media print {
                body { margin: 0; padding: 0; }
                .no-print { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="logo-area">
            ${logoHtml}
            <div style="float: right; text-align: right;">
                <div style="font-size: 10px; color: #6c757d;">Código: ${d.codigo || 'N/A'}</div>
                <div style="font-size: 10px; color: #6c757d;">Fecha: ${d.fechaEmision || new Date().toLocaleDateString()}</div>
            </div>
            <div style="clear: both;"></div>
        </div>
        
        <div class="header">
            <h2>DEPARTAMENTO DE TALENTO HUMANO</h2>
            <h3>DESCRIPTOR Y PERFIL DE PUESTO</h3>
            <h3 style="color: #0d6efd;">VERSIÓN CORTA</h3>
        </div>
        
        <table class="info-table">
            <tr><th>TITULO DEL PUESTO:</th><td colspan="3"><strong>${d.puesto || 'N/A'}</strong></td></tr>
            <tr><th>DIRECCION / DEPTO:</th><td>${d.area || 'N/A'}</td><th>FECHA DE EMISION:</th><td>${d.fechaEmision || new Date().toLocaleDateString()}</td></tr>
            <tr><th>PUESTO AL QUE SE REPORTA:</th><td>${d.reportaA || 'N/A'}</td><th>N° PERSONAL A CARGO:</th><td>${d.entrenamiento?.personalCargo || '0'}</td></tr>
        </table>
        
        <div class="section">
            <div class="section-title">OBJETIVO DEL PUESTO</div>
            <p style="margin: 5px 0; text-align: justify;">${d.objetivo || 'No especificado'}</p>
        </div>
        
        <div class="section">
            <div class="section-title">FUNCIONES CLAVES</div>
            ${funcionesClavesHtml}
        </div>
        
        <div class="section">
            <div class="section-title">FUNCIONES SECUNDARIAS</div>
            ${funcionesSecHtml}
        </div>
        
        <div class="section">
            <div class="section-title">INDICADORES DE DESEMPEÑO (KPIs)</div>
            ${kpisHtml}
        </div>
        
        <div class="section">
            <div class="section-title">PERFIL DEL PUESTO</div>
            <table class="info-table">
                <tr><th>Edad:</th><td>${d.perfil?.edadMin || '18'} - ${d.perfil?.edadMax || '65'} años</td>
                    <th>Sexo:</th><td>${d.perfil?.sexo === 'MASCULINO' ? 'Masculino' : (d.perfil?.sexo === 'FEMENINO' ? 'Femenino' : 'Indiferente')}</td></tr>
                <tr><th>Modalidad de Trabajo:</th><td>${d.perfil?.modalidadTrabajo || 'Presencial'}</td>
                    <th>Disponibilidad:</th><td>${d.perfil?.disponibilidadHorario || 'Tiempo Completo'}</td></tr>
            </table>
        </div>
        
        <div class="section">
            <div class="section-title">EDUCACIÓN</div>
            ${educacionHtml}
        </div>
        
        <div class="section">
            <div class="section-title">EXPERIENCIA</div>
            ${experienciaHtml}
        </div>
        
        <div class="section">
            <div class="section-title">COMPETENCIAS TÉCNICAS</div>
            ${compTecnicasHtml}
        </div>
        
        <div class="section">
            <div class="section-title">COMPETENCIAS CONDUCTUALES</div>
            ${compConductualesHtml}
        </div>
        
        <div class="section">
            <div class="section-title">RESPONSABILIDADES</div>
            <table class="info-table">
                <tr><th>Supervisa a:</th><td colspan="3">${d.responsabilidades?.equipo || 'N/A'}</td></tr>
                <tr><th>Impacto Económico:</th><td colspan="3">${d.responsabilidades?.impactoEconomico || 'Poco significativo'}</td></tr>
                <tr><th>Inducción Específica:</th><td colspan="3">Duración: ${d.entrenamiento?.duracion || '2 semanas'} | Responsable: ${d.entrenamiento?.puestosResponsables || 'Jefe Inmediato'}</td></tr>
            </table>
        </div>
        
        <div class="signature-area">
            <div class="signature-box">
                <strong>${d.titular || '_________________'}</strong><br>
                Nombre del Empleado<br>
                <span style="font-size: 9px;">Fecha y Firma: _________________</span>
            </div>
            <div class="signature-box">
                <strong>${d.creador || '_________________'}</strong><br>
                Nombre de Jefatura<br>
                <span style="font-size: 9px;">Fecha y Firma: _________________</span>
            </div>
            <div class="signature-box">
                <strong>_________________</strong><br>
                Jefe de Talento Humano<br>
                <span style="font-size: 9px;">Fecha y Firma: _________________</span>
            </div>
        </div>
        
        <div class="footer">
            Documento generado desde el Sistema de Gestión de Descriptor de Puesto<br>
            Página 1 de 1
        </div>
    </body>
    </html>
    `;
}

// Exportar función global
window.generarVersionCorta = generarVersionCorta;