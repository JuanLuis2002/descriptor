// App principal - Controlador de módulos
let currentUser = null;
let isMobile = window.innerWidth <= 768;

// Inicializar
$(document).ready(function() {
    checkAuth();
    applyDarkModePreference();
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
    
    $('#headerUserName').text(currentUser.nombre || '');
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

    $('#darkModeToggle').click(function() {
        const enabled = !$('body').hasClass('dark-mode');
        setDarkMode(enabled);
    });
    
    $('#sidebarOverlay').click(function() {
        closeMobileSidebar();
    });
    
    $('#btnLogout').click(function(e) {
        e.preventDefault();
        if (isMobile) {
            closeMobileSidebar();
        }
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

// Modo oscuro global
function applyDarkModePreference() {
    const savedTheme = localStorage.getItem('sgueesTheme');
    setDarkMode(savedTheme === 'dark', false);
}

function setDarkMode(enabled, persist = true) {
    $('body').toggleClass('dark-mode', enabled);
    $('#darkModeToggle')
        .attr('title', enabled ? 'Modo claro' : 'Modo oscuro')
        .attr('aria-label', enabled ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    $('#darkModeToggle i').attr('class', enabled ? 'fas fa-sun dark-mode-icon' : 'far fa-moon dark-mode-icon');

    if (persist) {
        localStorage.setItem('sgueesTheme', enabled ? 'dark' : 'light');
    }
}

// Cargar menú según el rol del usuario
function loadMenu() {
    const nav = $('#mainNav');
    nav.empty();
    let opciones = '';
    
    if (currentUser.rol === 'JEFE_INMEDIATO') {
        opciones += '<a href="#" class="submenu-link nav-link" data-modulo="nuevoDescriptor">Nuevo Descriptor</a>';
        opciones += '<a href="#" class="submenu-link nav-link" data-modulo="misDescriptores">Mis Descriptores</a>';
    } else if (currentUser.rol === 'JEFE_SUPERIOR') {
        opciones += '<a href="#" class="submenu-link nav-link" data-modulo="pendientesAprobar">Pendientes de Aprobación</a>';
    } else if (currentUser.rol === 'TH_GENERALISTA') {
        opciones += '<a href="#" class="submenu-link nav-link" data-modulo="revisionTH">Revisión Técnica</a>';
    } else if (currentUser.rol === 'JEFE_TH') {
        opciones += '<a href="#" class="submenu-link nav-link" data-modulo="firmasJTH">Firmas Pendientes</a>';
    } else if (currentUser.rol === 'COLABORADOR') {
        opciones += '<a href="#" class="submenu-link nav-link" data-modulo="firmasCT">Mi Firma</a>';
    }

    nav.append(`
        <a href="#" class="menu-link nav-link active" data-modulo="dashboard">
            <i class="fas fa-home"></i> <span>Home</span>
        </a>
        <div class="menu-group tree-toggle" data-target="#talentoHumanoTree">
            <i class="fas fa-chevron-down chevron"></i>
            <i class="far fa-id-card"></i>
            <span>Talento Humano</span>
        </div>
        <div id="talentoHumanoTree" class="tree-section">
            <div class="submenu-title tree-toggle" data-target="#tablasGeneralesTree">
                <i class="fas fa-chevron-down chevron"></i>
                <i class="fas fa-th"></i>
                <span>Tablas Generales</span>
            </div>
            <div id="tablasGeneralesTree" class="submenu-options">
                ${opciones}
            </div>
        </div>
    `);
    
    // Eventos de navegación
    $(document).off('click.mainNav').on('click.mainNav', '.nav-link[data-modulo]', function(e) {
        e.preventDefault();
        const modulo = $(this).data('modulo');
        
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
        
        if (isMobile) {
            closeMobileSidebar();
        }
        
        cargarModulo(modulo);
    });

    $(document).off('click.treeMenu').on('click.treeMenu', '.tree-toggle', function(e) {
        e.preventDefault();
        const target = $($(this).data('target'));
        const icon = $(this).find('.chevron').first();
        target.stop(true, true).slideToggle(160);
        icon.toggleClass('fa-chevron-down fa-chevron-right');
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
    } else {
        $('#sidebar').removeClass('collapsed');
        $('#mainContent').removeClass('expanded');
        closeMobileSidebar();
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
    
    var modalHtml = '<div class="text-center signature-modal"><p class="mb-2">Firme en el recuadro con el mouse o dedo:</p><div id="signature-pad" class="border rounded mx-auto signature-pad-box" style="width: 400px; height: 200px; background: white; border: 2px solid #ccc;"><canvas id="firmaCanvas" width="400" height="200" style="width:100%;height:100%;"></canvas></div><div class="mt-3"><button id="limpiarFirma" class="btn btn-secondary btn-sm"><i class="fas fa-eraser"></i> Limpiar</button><button id="descargarFirma" class="btn btn-info btn-sm"><i class="fas fa-download"></i> Descargar</button></div></div>';
    
    Swal.fire({
        title: 'Firma Digital - Jefe Inmediato',
        html: modalHtml,
        width: '500px',
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-save"></i> Guardar Firma',
        cancelButtonText: 'Cancelar',
        didOpen: function() {
            var canvas = document.getElementById('firmaCanvas');
            var signaturePad = new SignaturePad(canvas, {
                backgroundColor: 'rgb(255,255,255)',
                penColor: 'rgb(0,0,0)'
            });
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
// Generar versión corta del descriptor - Usando print en iframe oculto
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
              '<button id="btnImprimirPDF" class="btn btn-primary"><i class="fas fa-print"></i> Imprimir / Guardar PDF</button>' +
              '</div>',
        width: '950px',
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: 'Cerrar',
        didOpen: function() {
            $('#btnImprimirPDF').click(function() {
                // Crear un iframe oculto
                var iframe = document.createElement('iframe');
                iframe.style.position = 'absolute';
                iframe.style.width = '0';
                iframe.style.height = '0';
                iframe.style.border = '0';
                document.body.appendChild(iframe);
                
                // Escribir el contenido en el iframe
                var iframeDoc = iframe.contentWindow.document;
                iframeDoc.open();
                iframeDoc.write(pdfHtml);
                iframeDoc.close();
                
                // Esperar a que cargue y luego imprimir
                iframe.onload = function() {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                    
                    // Remover el iframe después de imprimir
                    setTimeout(function() {
                        document.body.removeChild(iframe);
                    }, 1000);
                };
                
                // Si el onload no se dispara, forzar impresión
                setTimeout(function() {
                    if (iframe.contentWindow) {
                        iframe.contentWindow.focus();
                        iframe.contentWindow.print();
                        setTimeout(function() {
                            if (document.body.contains(iframe)) {
                                document.body.removeChild(iframe);
                            }
                        }, 1000);
                    }
                }, 500);
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

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function hasText(value) {
        return value !== null && value !== undefined && String(value).trim() !== '';
    }

    function text(value) {
        return hasText(value) ? escapeHtml(value) : '';
    }

    function enumText(value) {
        if (!hasText(value)) return '';
        return String(value).toLowerCase().split('_').map(function(part) {
            return part.charAt(0).toUpperCase() + part.slice(1);
        }).join(' ');
    }

    function isFilledObject(item, keys) {
        if (!item) return false;
        for (var i = 0; i < keys.length; i++) {
            if (hasText(item[keys[i]])) return true;
        }
        return false;
    }

    function filtrarObjetos(items, keys) {
        var resultado = [];
        items = items || [];
        for (var i = 0; i < items.length; i++) {
            if (isFilledObject(items[i], keys)) resultado.push(items[i]);
        }
        return resultado;
    }

    function filtrarTextos(items) {
        var resultado = [];
        items = items || [];
        for (var i = 0; i < items.length; i++) {
            if (hasText(items[i])) resultado.push(items[i]);
        }
        return resultado;
    }

    function emptyRow(colspan) {
        return '<tr><td colspan="' + colspan + '" class="empty-cell">Sin información registrada</td></tr>';
    }

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
    <td>${(d.responsabilidades && d.responsabilidades.impactoEconomico) ? d.responsabilidades.impactoEconomico : 'Rango 1: Poco significativo - menor a $50,000'}</td>
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
    <td class="firma-val">Ing. Juan Pérez</td>
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
    <td class="firma-val">Lic. Carlos Gómez</td>
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
        html: '<div id="pdfPreviewContainer" style="height: 72vh; overflow: auto; background: #e9ecef; padding: 12px; border-radius: 8px; text-align: center;">' +
              '<iframe id="pdfPreviewFrame" scrolling="no" title="Vista previa versión extensa" style="width: 8.5in; height: auto; min-height: 11in; max-width: 100%; border: 0; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.18); overflow: hidden;"></iframe>' +
              '</div>' +
              '<div class="mt-3 d-flex justify-content-center gap-2">' +
              '<button id="btnImprimirPDFExtenso" class="btn btn-primary"><i class="fas fa-print"></i> Imprimir / Guardar PDF</button>' +
              '</div>',
        width: '980px',
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: 'Cerrar',
        didOpen: function() {
            var previewFrame = document.getElementById('pdfPreviewFrame');
            var previewDoc = previewFrame.contentWindow.document;
            previewDoc.open();
            previewDoc.write(pdfHtml);
            previewDoc.close();

            function ajustarAlturaPreviewExtenso() {
                var doc = previewFrame.contentWindow.document;
                var height = Math.max(
                    doc.body.scrollHeight,
                    doc.documentElement.scrollHeight,
                    doc.body.offsetHeight,
                    doc.documentElement.offsetHeight
                );
                previewFrame.style.height = height + 'px';
            }
            previewFrame.onload = ajustarAlturaPreviewExtenso;
            setTimeout(ajustarAlturaPreviewExtenso, 250);
            
            $('#btnImprimirPDFExtenso').click(function() {
                previewFrame.contentWindow.focus();
                previewFrame.contentWindow.print();
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
            <tr><td><strong>Impacto Económico:</strong></td><td>${d.responsabilidades?.impactoEconomico || 'Rango 1: Poco significativo - menor a $50,000'}</td></tr>
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

// Restauración: la versión corta mantiene su formato propio.
function generarHTMLVersionCorta(d) {
    var firmasGuardadas = JSON.parse(localStorage.getItem('firmas') || '{}');
    var firmaJI  = firmasGuardadas['ji_'  + d.id] || d.firmaJI  || null;
    var firmaJTH = firmasGuardadas['jth_' + d.id] || d.firmaJTH || null;
    var firmaCT  = firmasGuardadas['ct_'  + d.id] || d.firmaCT  || null;

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function hasText(value) {
        return value !== null && value !== undefined && String(value).trim() !== '';
    }

    function text(value) {
        return hasText(value) ? escapeHtml(value) : '';
    }

    function enumText(value) {
        if (!hasText(value)) return '';
        return String(value).toLowerCase().split('_').map(function(part) {
            return part.charAt(0).toUpperCase() + part.slice(1);
        }).join(' ');
    }

    function isFilledObject(item, keys) {
        if (!item) return false;
        for (var i = 0; i < keys.length; i++) {
            if (hasText(item[keys[i]])) return true;
        }
        return false;
    }

    function filtrarObjetos(items, keys) {
        var resultado = [];
        items = items || [];
        for (var i = 0; i < items.length; i++) {
            if (isFilledObject(items[i], keys)) resultado.push(items[i]);
        }
        return resultado;
    }

    function filtrarTextos(items) {
        var resultado = [];
        items = items || [];
        for (var i = 0; i < items.length; i++) {
            if (hasText(items[i])) resultado.push(items[i]);
        }
        return resultado;
    }

    function emptyRow(colspan) {
        return '<tr><td colspan="' + colspan + '" class="empty-cell">Sin información registrada</td></tr>';
    }

    function getFirmaHtml(firmaDataUrl) {
        if (firmaDataUrl) return '<img src="' + firmaDataUrl + '" style="width:100px;height:35px;vertical-align:middle;margin-left:8px;">';
        return '';
    }

    var fechaActual = new Date().toLocaleDateString('es-ES');
    var logoHtml = LOGO_PATH ? '<img src="' + LOGO_PATH + '" height="45">' : '';

    var funcionesClavesRows = '';
    var funcionesClaves = filtrarObjetos(d.funcionesClaves, ['codigo', 'nombre']);
    for (var i = 0; i < funcionesClaves.length; i++) {
        var codigo = hasText(funcionesClaves[i].codigo) ? '[' + text(funcionesClaves[i].codigo) + '] ' : '';
        funcionesClavesRows += '<tr><td style="padding:2px 6px;border:none;">' + (i + 1) + '. ' + codigo + text(funcionesClaves[i].nombre) + '</td></tr>';
    }
    if (!funcionesClavesRows) funcionesClavesRows = '<tr><td style="padding:2px 6px;border:none;" class="empty-cell">Sin información registrada</td></tr>';

    var funcionesSecRows = '';
    var funcionesSecundarias = filtrarTextos(d.funcionesSecundarias);
    for (var i = 0; i < funcionesSecundarias.length; i++) {
        funcionesSecRows += '<tr><td style="padding:2px 6px;border:none;">' + (i + 1) + '. ' + text(funcionesSecundarias[i]) + '</td></tr>';
    }
    if (!funcionesSecRows) funcionesSecRows = '<tr><td style="padding:2px 6px;border:none;" class="empty-cell">Sin información registrada</td></tr>';

    var kpisRows = '';
    var kpis = filtrarObjetos(d.kpis, ['indicador', 'frecuencia', 'meta']);
    for (var i = 0; i < kpis.length; i++) {
        var indicador  = text(kpis[i].indicador);
        var frecuencia = text(kpis[i].frecuencia);
        var meta       = text(kpis[i].meta);
        var freqMeta   = (frecuencia && meta) ? frecuencia + ' / ' + meta : (frecuencia || meta);
        kpisRows += '<tr>'
            + '<td style="border:1px solid #000;padding:5px 6px;height:18px;">' + indicador + '</td>'
            + '<td style="border:1px solid #000;padding:5px 6px;">'             + freqMeta  + '</td>'
            + '</tr>';
    }
    if (!kpisRows) kpisRows = emptyRow(2);

    var eduRows = '';
    var educacion = filtrarObjetos(d.educacion, ['requisito', 'especificaciones']);
    for (var i = 0; i < educacion.length; i++) {
        var req  = text(educacion[i].requisito);
        var esp  = text(educacion[i].especificaciones);
        var reqd = hasText(educacion[i].requerido) ? (educacion[i].requerido == 1 ? 'Requerido' : 'Deseable') : '';
        eduRows += '<tr>'
            + '<td style="border:1px solid #000;padding:5px 6px;height:18px;">' + req  + '</td>'
            + '<td style="border:1px solid #000;padding:5px 6px;">' + esp  + '</td>'
            + '<td style="border:1px solid #000;padding:5px 6px;text-align:center;width:18%;">' + reqd + '</td>'
            + '</tr>';
    }
    if (!eduRows) eduRows = emptyRow(3);

    var expRows = '';
    var experiencia = filtrarObjetos(d.experiencia, ['requisito']);
    for (var i = 0; i < experiencia.length; i++) {
        var reqExp  = text(experiencia[i].requisito);
        var reqdExp = hasText(experiencia[i].requerido) ? (experiencia[i].requerido == 1 ? 'Requerido' : 'Deseable') : '';
        expRows += '<tr>'
            + '<td style="border:1px solid #000;padding:5px 6px;height:18px;">' + reqExp  + '</td>'
            + '<td style="border:1px solid #000;padding:5px 6px;text-align:center;width:22%;">' + reqdExp + '</td>'
            + '</tr>';
    }
    if (!expRows) expRows = emptyRow(2);

    var compTechRows = '';
    var competenciasTecnicas = filtrarObjetos(d.competenciasTecnicas, ['nombre', 'nivel']);
    for (var i = 0; i < competenciasTecnicas.length; i++) {
        var nom = text(competenciasTecnicas[i].nombre);
        var niv = text(competenciasTecnicas[i].nivel);
        compTechRows += '<tr>'
            + '<td style="border:1px solid #000;padding:5px 6px;text-align:center;width:12%;height:18px;">' + (i + 1) + '</td>'
            + '<td style="border:1px solid #000;padding:5px 6px;">' + nom + '</td>'
            + '<td style="border:1px solid #000;padding:5px 6px;text-align:center;width:22%;">' + niv + '</td>'
            + '</tr>';
    }
    if (!compTechRows) compTechRows = emptyRow(3);

    var compCondRows = '';
    var competenciasConductuales = filtrarObjetos(d.competenciasConductuales, ['nombre', 'descripcion']);
    for (var i = 0; i < competenciasConductuales.length; i++) {
        var nomCond  = text(competenciasConductuales[i].nombre);
        var descCond = text(competenciasConductuales[i].descripcion);
        compCondRows += '<tr>'
            + '<td style="border:1px solid #000;padding:5px 6px;width:40%;height:22px;">' + nomCond  + '</td>'
            + '<td style="border:1px solid #000;padding:5px 6px;">' + descCond + '</td>'
            + '</tr>';
    }
    if (!compCondRows) compCondRows = emptyRow(2);

    var perfil = d.perfil || {};
    var responsabilidades = d.responsabilidades || {};
    var entrenamiento = d.entrenamiento || {};
    var titularNombre = text(d.titular);
    var eventosAuditoria = (d.auditoria && d.auditoria.eventos) ? d.auditoria.eventos : [];
    if (!titularNombre) {
        for (var i = 0; i < eventosAuditoria.length; i++) {
            if (eventosAuditoria[i].accion === 'FIRMA DEL COLABORADOR/TITULAR' && hasText(eventosAuditoria[i].usuario)) {
                titularNombre = text(eventosAuditoria[i].usuario);
                break;
            }
        }
    }
    if (!titularNombre && firmaCT) {
        titularNombre = 'Ing. Juan Pérez';
    }
    var sexoDisplay = enumText(perfil.sexo);
    var edadDisplay = text(perfil.edadMin) + (hasText(perfil.edadMax) ? ' - ' + text(perfil.edadMax) + ' años' : '');
    var induccionText = (hasText(entrenamiento.duracion) ? 'Duración: ' + text(entrenamiento.duracion) : '') +
        (hasText(entrenamiento.puestosResponsables) ? '<br>Responsable: ' + text(entrenamiento.puestosResponsables) : '');

    var CSS = `
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Arial, sans-serif; font-size: 10pt; color: #000; padding: 20px 25px; }
      table { border-collapse: collapse; width: 100%; }
      td, th { font-size: 10pt; }
      .hdr td { border: 1.5px solid #000; padding: 5px 8px; vertical-align: middle; }
      .hdr-logo  { width: 16%; text-align: center; }
      .hdr-title { width: 52%; text-align: center; font-weight: bold; font-size: 11pt; border-left: none !important; border-right: none !important; }
      .hdr-meta  { width: 32%; font-size: 9pt; }
      .sec { font-weight: bold; border: 1px solid #000; padding: 4px 7px; background: #fff; }
      .t td  { border: 1px solid #000; padding: 4px 7px; vertical-align: top; }
      .lbl   { font-weight: bold; }
      .mt6   { margin-top: 6px; }
      .mt10  { margin-top: 10px; }
      .col-hdr th { border: 1px solid #000; padding: 4px 7px; font-weight: bold; background: #fff; text-align: left; }
      .firma-t td { border: 1px solid #000; padding: 5px 8px; vertical-align: middle; }
      .firma-lbl  { width: 22%; font-size: 9.5pt; }
      .firma-val  { width: 28%; }
      .firma-lbl2 { width: 20%; font-size: 9.5pt; }
      .firma-val2 { width: 30%; }
      .page-break { page-break-before: always; }
      .footer { text-align: right; font-size: 8pt; color: #444; margin-top: 12px; }
      .empty-cell { color: #777; font-style: italic; text-align: center; }
    </style>`;

    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Descriptor ${d.codigo || ''}</title>${CSS}</head>
<body>
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
<table class="t">
  <tr><td colspan="4" class="sec">GENERALIDADES DEL PUESTO</td></tr>
  <tr><td class="lbl" style="width:22%;">TITULO DEL PUESTO:</td><td style="width:30%;">${text(d.puesto)}</td><td class="lbl" style="width:20%;">CODIGO:</td><td>${text(d.codigo)}</td></tr>
  <tr><td class="lbl">DIRECCION / DEPTO:</td><td>${text(d.area)}</td><td class="lbl">FECHA DE EMISION:</td><td>${text(d.fechaEmision) || fechaActual}</td></tr>
  <tr><td class="lbl">PUESTO AL QUE SE REPORTA:</td><td>${text(d.reportaA)}</td><td class="lbl">FECHA DE REVISION:</td><td>${fechaActual}</td></tr>
  <tr><td class="lbl">N° de Personal a cargo:</td><td>${text(entrenamiento.personalCargo)}</td><td class="lbl">PAGINAS:</td><td>1 de 2</td></tr>
</table>
<table class="t mt6">
  <tr><td class="lbl" style="width:22%;vertical-align:top;">Objetivo del Puesto</td><td colspan="3">${text(d.objetivo)}</td></tr>
  <tr><td class="lbl" style="vertical-align:top;">Funciones Claves</td><td colspan="3" style="padding:0;"><table style="width:100%;border-collapse:collapse;">${funcionesClavesRows}</table></td></tr>
  <tr><td class="lbl" style="vertical-align:top;">Funciones<br>Secundarias</td><td colspan="3" style="padding:0;"><table style="width:100%;border-collapse:collapse;">${funcionesSecRows}</table></td></tr>
</table>
<table class="t mt6"><tr><td colspan="2" class="sec">Indicadores de Desempeño</td></tr><tr class="col-hdr"><th style="width:55%;">Indicador</th><th>Frecuencia / Meta</th></tr>${kpisRows}</table>
<table class="t mt6">
  <tr><td class="lbl" style="width:22%;vertical-align:top;">Supervisa a:</td><td>${text(responsabilidades.personal)}</td></tr>
  <tr><td class="lbl" style="vertical-align:top;">Inducción Específica<br>al Puesto</td><td>${induccionText}</td></tr>
  <tr><td class="lbl" style="vertical-align:top;">Impacto Económico<br>Institucional:</td><td>${text(responsabilidades.impactoEconomico)}</td></tr>
</table>
<table class="t mt6">
  <tr><td colspan="4" class="sec">PERFIL DE PUESTO</td></tr>
  <tr><td class="lbl" style="width:14%;">Edad:</td><td colspan="3">${edadDisplay}</td></tr>
  <tr><td class="lbl">Sexo:</td><td colspan="3">${sexoDisplay}</td></tr>
  <tr><td class="lbl">Modalidad de Trabajo:</td><td style="width:36%;">${enumText(perfil.modalidadTrabajo)}</td><td class="lbl" style="width:14%;">Otros:</td><td>${enumText(perfil.disponibilidadHorario)}</td></tr>
</table>
<table class="t mt6"><tr><td colspan="3" class="sec">EDUCACION</td></tr><tr class="col-hdr"><th style="width:36%;">Requisito</th><th style="width:46%;">Especificaciones</th><th style="width:18%;">Requerido</th></tr>${eduRows}</table>
<div class="page-break">
<table class="t"><tr><td colspan="2" class="sec">EXPERIENCIA</td></tr><tr class="col-hdr"><th>Requisito</th><th style="width:22%;">Requerido</th></tr>${expRows}</table>
<table class="t mt10"><tr><td colspan="3" class="sec">COMPETENCIAS TÉCNICAS</td></tr><tr class="col-hdr"><th style="width:12%;">Código</th><th>Competencias Técnicas Requeridas</th><th style="width:22%;">Nivel de Dominio</th></tr>${compTechRows}</table>
<table class="t mt10"><tr><td colspan="2" style="text-align:center;border:1px solid #000;padding:4px 7px;font-weight:bold;">Competencias Conductuales</td></tr>${compCondRows}</table>
<table class="firma-t mt10">
  <tr><td colspan="4" style="font-weight:bold;border:none;padding:4px 0;">FIRMAS</td></tr>
  <tr><td class="firma-lbl">Nombre del Empleado:</td><td class="firma-val">${titularNombre}</td><td class="firma-lbl2">Fecha y Firma:</td><td class="firma-val2">${d.fechaFirmaCT ? new Date(d.fechaFirmaCT).toLocaleDateString('es-ES') : '_________'} ${getFirmaHtml(firmaCT)}</td></tr>
  <tr><td class="firma-lbl">Nombre de Jefatura:</td><td class="firma-val">${d.creador || '_________________'}</td><td class="firma-lbl2">Fecha y Firma:</td><td class="firma-val2">${d.fechaFirmaJI ? new Date(d.fechaFirmaJI).toLocaleDateString('es-ES') : '_________'} ${getFirmaHtml(firmaJI)}</td></tr>
  <tr><td class="firma-lbl">Jefe de Talento Humano:</td><td class="firma-val">Lic. Carlos Gómez</td><td class="firma-lbl2">Fecha y Firma:</td><td class="firma-val2">${d.fechaFirmaJTH ? new Date(d.fechaFirmaJTH).toLocaleDateString('es-ES') : '_________'} ${getFirmaHtml(firmaJTH)}</td></tr>
</table>
<div class="footer">Departamento de Talento Humano | 2025</div>
</div>
</body></html>`;
}

// La versión extensa usa el formato integrado oficial con paginación dinámica.
function generarHTMLVersionExtensa(d) {
    var firmasGuardadas = JSON.parse(localStorage.getItem('firmas') || '{}');
    var firmaJI  = firmasGuardadas['ji_'  + d.id] || d.firmaJI  || null;
    var firmaJTH = firmasGuardadas['jth_' + d.id] || d.firmaJTH || null;
    var firmaCT  = firmasGuardadas['ct_'  + d.id] || d.firmaCT  || null;

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function hasText(value) {
        return value !== null && value !== undefined && String(value).trim() !== '';
    }

    function text(value) {
        return hasText(value) ? escapeHtml(value) : '';
    }

    function enumText(value) {
        if (!hasText(value)) return '';
        return String(value).toLowerCase().split('_').map(function(part) {
            return part.charAt(0).toUpperCase() + part.slice(1);
        }).join(' ');
    }

    function isFilledObject(item, keys) {
        if (!item) return false;
        for (var i = 0; i < keys.length; i++) {
            if (hasText(item[keys[i]])) return true;
        }
        return false;
    }

    function filtrarObjetos(items, keys) {
        var resultado = [];
        items = items || [];
        for (var i = 0; i < items.length; i++) {
            if (isFilledObject(items[i], keys)) resultado.push(items[i]);
        }
        return resultado;
    }

    function filtrarTextos(items) {
        var resultado = [];
        items = items || [];
        for (var i = 0; i < items.length; i++) {
            if (hasText(items[i])) resultado.push(items[i]);
        }
        return resultado;
    }

    function getFirmaHtml(firmaDataUrl) {
        if (firmaDataUrl) return '<img src="' + firmaDataUrl + '" class="firma-img">';
        return '';
    }

    var fechaActual = new Date().toLocaleDateString('es-ES');
    var logoHtml = LOGO_PATH ? '<img src="' + LOGO_PATH + '" class="logo-img">' : '';
    var funciones = filtrarObjetos(d.funcionesClaves, ['codigo', 'nombre']);
    var actividadesPorFuncion = d.actividadesPorFuncion || [];
    var responsabilidades = d.responsabilidades || {};
    var entrenamiento = d.entrenamiento || {};
    var perfil = d.perfil || {};
    var relaciones = d.relacionesLaborales || {};
    var riesgos = d.riesgosFisicos || {};
    var requerimientos = filtrarTextos(d.requerimientosOrganizacionales);
    var relacionesInternas = filtrarObjetos(relaciones.internas, ['puesto', 'razon']);
    var relacionesExternas = filtrarObjetos(relaciones.externas, ['entidad', 'razon']);
    var riesgosLista = filtrarTextos(riesgos.riesgos);
    var educacion = filtrarObjetos(d.educacion, ['requisito', 'especificaciones']);
    var experiencia = filtrarObjetos(d.experiencia, ['requisito']);
    var competenciasTecnicas = filtrarObjetos(d.competenciasTecnicas, ['nombre', 'nivel']);
    var competenciasConductuales = filtrarObjetos(d.competenciasConductuales, ['nombre', 'descripcion']);
    var titularNombre = text(d.titular);
    var eventosAuditoria = (d.auditoria && d.auditoria.eventos) ? d.auditoria.eventos : [];
    if (!titularNombre) {
        for (var i = 0; i < eventosAuditoria.length; i++) {
            if (eventosAuditoria[i].accion === 'FIRMA DEL COLABORADOR/TITULAR' && hasText(eventosAuditoria[i].usuario)) {
                titularNombre = text(eventosAuditoria[i].usuario);
                break;
            }
        }
    }
    if (!titularNombre && firmaCT) {
        titularNombre = 'Ing. Juan Pérez';
    }

    function getActividades(funcion) {
        var nombre = String(funcion.nombre || '').trim().toLowerCase();
        var codigoNombre = String((funcion.codigo ? funcion.codigo + ' - ' : '') + funcion.nombre).trim().toLowerCase();
        for (var i = 0; i < actividadesPorFuncion.length; i++) {
            var itemNombre = String(actividadesPorFuncion[i].funcionNombre || '').trim().toLowerCase();
            if (itemNombre === nombre || itemNombre === codigoNombre) {
                return filtrarTextos(actividadesPorFuncion[i].actividades);
            }
        }
        return [];
    }

    function headerPagina() {
        return '<table class="header-tabla"><tr><td class="header-logo">' + logoHtml + '</td><td class="header-title">DEPARTAMENTO DE TALENTO HUMANO</td><td class="header-doc-title">DESCRIPTOR Y PERFIL DE PUESTO</td></tr></table>' +
            '<table class="tabla generalidades">' +
            '<tr><th colspan="4">GENERALIDADES DEL PUESTO</th></tr>' +
            '<tr><td class="label">TITULO DEL PUESTO:</td><td>' + text(d.puesto) + '</td><td class="label">CODIGO:</td><td>' + text(d.codigo) + '</td></tr>' +
            '<tr><td class="label">DIRECCION / DEPTO:</td><td>' + text(d.area) + '</td><td class="label">FECHA DE EMISION:</td><td>' + text(d.fechaEmision) + '</td></tr>' +
            '<tr><td class="label">PUESTO AL QUE SE REPORTA:</td><td>' + text(d.reportaA) + '</td><td class="label">FECHA DE REVISION:</td><td>' + fechaActual + '</td></tr>' +
            '<tr><td class="label">N° de Personal a cargo:</td><td>' + text(entrenamiento.personalCargo) + '</td><td class="label">PAGINAS:</td><td><span class="page-number">1</span> de <span class="page-total">1</span></td></tr>' +
            '</table>';
    }

    function footerPagina() {
        return '<div class="page-footer">DEPARTAMENTO DE TALENTO HUMANO | 2025</div>';
    }

    function renderFuncionesResponsabilidad() {
        if (funciones.length === 0) return '';
        var rows = '';
        for (var i = 0; i < funciones.length; i++) {
            rows += '<tr><td class="center code-col">' + text(funciones[i].codigo) + '</td><td>' + text(funciones[i].nombre) + '</td></tr>';
        }
        return '<div class="flow-block"><div class="section-label indent">II. &nbsp; FUNCIONES CLAVES CON RESPONSABILIDAD</div><table class="tabla compacta"><tr><th class="code-col">Código</th><th>Nombre</th></tr>' + rows + '</table></div>';
    }

    function renderActividadBlock(funcion) {
        var actividades = getActividades(funcion);
        if (actividades.length === 0) return '';
        var rows = '<tr><th class="funcion-col">Función Clave</th><th>' + text(funcion.nombre) + '</th></tr>';
        for (var i = 0; i < actividades.length; i++) {
            rows += '<tr><td class="center">' + (i + 1) + '</td><td>' + text(actividades[i]) + '</td></tr>';
        }
        return '<table class="tabla compacta actividad-tabla flow-block">' + rows + '</table>';
    }

    function renderActividades(start, end) {
        var html = '';
        for (var i = start; i < end && i < funciones.length; i++) {
            html += renderActividadBlock(funciones[i]);
        }
        return html;
    }

    function renderResponsabilidades() {
        var items = [
            ['De equipo', responsabilidades.equipo],
            ['De fondos o valores', responsabilidades.fondos],
            ['De documentos e información', responsabilidades.documentos],
            ['Toma de decisiones', responsabilidades.tomaDecisiones],
            ['De personal', responsabilidades.personal],
            ['Impacto Económico Institucional', responsabilidades.impactoEconomico]
        ];
        var html = '';
        for (var i = 0; i < items.length; i++) {
            if (hasText(items[i][1])) html += '<li><strong>' + items[i][0] + ':</strong> ' + text(items[i][1]) + '</li>';
        }
        if (!html) return '';
        return '<div class="flow-block"><div class="section-label">IV. RESPONSABILIDADES A CARGO</div><div class="border-box"><ul class="plain-list">' + html + '</ul></div></div>';
    }

    function renderRelaciones() {
        if (relacionesInternas.length === 0 && relacionesExternas.length === 0) return '';
        var html = '<div class="flow-block"><div class="section-label">V. &nbsp; RELACIONES LABORALES</div>';
        if (relacionesInternas.length > 0) {
            html += '<div class="sub-label">INTERNAS:</div><table class="tabla compacta"><tr><th>Puesto/área</th><th>Razón</th></tr>';
            for (var i = 0; i < relacionesInternas.length; i++) html += '<tr><td>' + text(relacionesInternas[i].puesto) + '</td><td>' + text(relacionesInternas[i].razon) + '</td></tr>';
            html += '</table>';
        }
        if (relacionesExternas.length > 0) {
            html += '<div class="sub-label">EXTERNAS:</div><table class="tabla compacta"><tr><th>Puesto/área</th><th>Razón</th></tr>';
            for (var j = 0; j < relacionesExternas.length; j++) html += '<tr><td>' + text(relacionesExternas[j].entidad) + '</td><td>' + text(relacionesExternas[j].razon) + '</td></tr>';
            html += '</table>';
        }
        return html + '</div>';
    }

    function renderRequerimientos() {
        if (requerimientos.length === 0) return '';
        var html = '';
        for (var i = 0; i < requerimientos.length; i++) html += '<div>' + (i + 1) + '.&nbsp; ' + text(requerimientos[i]) + '</div>';
        return '<div class="flow-block"><div class="section-label center">VI. &nbsp; REQUERIMIENTOS ORGANIZACIONALES</div><div class="border-box small-pad">' + html + '</div></div>';
    }

    function renderRiesgos() {
        var hasRiesgos = hasText(riesgos.esfuerzo) || hasText(riesgos.condiciones) || riesgosLista.length > 0;
        if (!hasRiesgos) return '';
        var html = '<div class="flow-block"><div class="section-label">VII. RIESGOS FISICOS DEL PUESTO</div><div class="border-box small-pad">';
        if (hasText(riesgos.esfuerzo)) html += '<div><strong>Esfuerzo físico y mental:</strong> ' + text(riesgos.esfuerzo) + '</div>';
        if (hasText(riesgos.condiciones)) html += '<div><strong>Condiciones ambientales:</strong> ' + text(riesgos.condiciones) + '</div>';
        if (riesgosLista.length > 0) {
            html += '<div><strong>Riesgos de accidente y/o enfermedad profesional:</strong></div>';
            for (var i = 0; i < riesgosLista.length; i++) html += '<div>- ' + text(riesgosLista[i]) + '</div>';
        }
        return html + '</div></div>';
    }

    function renderEntrenamiento() {
        if (!hasText(entrenamiento.tipoEntrenamiento) && !hasText(entrenamiento.duracion) && !hasText(entrenamiento.puestosResponsables)) return '';
        return '<div class="flow-block"><div class="section-label center">VIII. &nbsp; ENTRENAMIENTO INICIAL EN EL PUESTO</div><table class="tabla compacta"><tr><th>ENTRENAMIENTOS</th><th>DURACIÓN</th><th>PUESTOS RESPONSABLES</th></tr><tr><td>' + text(entrenamiento.tipoEntrenamiento) + '</td><td class="center">' + text(entrenamiento.duracion) + '</td><td>' + text(entrenamiento.puestosResponsables) + '</td></tr></table></div>';
    }

    function renderPerfil() {
        var hasPerfil = hasText(perfil.edadMin) || hasText(perfil.edadMax) || hasText(perfil.sexo) || hasText(perfil.estadoFamiliar) || hasText(perfil.disponibilidadHorario) || hasText(perfil.modalidadTrabajo) || hasText(perfil.poseerLicencia);
        if (!hasPerfil) return '';
        var licencia = perfil.poseerLicencia == '1' ? 'Sí' : (hasText(perfil.poseerLicencia) ? 'No' : '');
        return '<div class="flow-block"><div class="bar-title mt14">PERFIL DEL PUESTO</div><table class="tabla perfil"><tr><th>EDAD</th><th>SEXO</th><th>ESTADO FAMILIAR</th></tr><tr><td><strong>Mínima:</strong> ' + text(perfil.edadMin) + ' &nbsp;&nbsp;&nbsp; <strong>Máxima:</strong> ' + text(perfil.edadMax) + '</td><td>' + enumText(perfil.sexo) + '</td><td>' + enumText(perfil.estadoFamiliar) + '</td></tr><tr><th>Disponibilidad de<br>Horario</th><th>Modalidad de Trabajo</th><th>Poseer Licencia<br>(de conducir)</th></tr><tr><td>' + enumText(perfil.disponibilidadHorario) + '</td><td>' + enumText(perfil.modalidadTrabajo) + '</td><td>' + licencia + '</td></tr></table></div>';
    }

    function renderEducacion() {
        if (educacion.length === 0) return '';
        var rows = '';
        for (var i = 0; i < educacion.length; i++) rows += '<tr><td>' + text(educacion[i].requisito) + '</td><td>' + text(educacion[i].especificaciones) + '</td><td class="center">' + (hasText(educacion[i].requerido) ? (educacion[i].requerido == 1 ? 'Requerido' : 'Deseable') : '') + '</td></tr>';
        return '<div class="flow-block"><div class="section-label mt14">EDUCACION</div><table class="tabla compacta"><tr><th>Requisito</th><th>Especificaciones</th><th>Requerido</th></tr>' + rows + '</table></div>';
    }

    function renderExperiencia() {
        if (experiencia.length === 0) return '';
        var rows = '';
        for (var i = 0; i < experiencia.length; i++) rows += '<tr><td>' + text(experiencia[i].requisito) + '</td><td class="center">' + (hasText(experiencia[i].requerido) ? (experiencia[i].requerido == 1 ? 'Requerido' : 'Deseable') : '') + '</td></tr>';
        return '<div class="flow-block"><div class="section-label mt10">EXPERIENCIA</div><table class="tabla compacta"><tr><th>Requisito</th><th>Requerido</th></tr>' + rows + '</table></div>';
    }

    function renderCompetenciasTecnicas() {
        if (competenciasTecnicas.length === 0) return '';
        var rows = '';
        for (var i = 0; i < competenciasTecnicas.length; i++) rows += '<tr><td class="center">' + (i + 1) + '</td><td>' + text(competenciasTecnicas[i].nombre) + '</td><td class="center">' + text(competenciasTecnicas[i].nivel) + '</td></tr>';
        return '<table class="tabla compacta mt14 flow-block"><tr><th class="code-col">CÓDIGO</th><th>COMPETENCIAS TÉCNICAS REQUERIDAS</th><th>NIVEL DE DOMINIO</th></tr>' + rows + '</table>';
    }

    function renderCompetenciasConductuales() {
        if (competenciasConductuales.length === 0) return '';
        var rows = '';
        for (var i = 0; i < competenciasConductuales.length; i++) rows += '<tr><td class="conductual-label">' + text(competenciasConductuales[i].nombre) + '</td><td>' + text(competenciasConductuales[i].descripcion) + '</td></tr>';
        return '<table class="tabla conductual-tabla flow-block"><tr><th class="conductual-label">COMPETENCIAS<br>CONDUCTUALES</th><th></th></tr>' + rows + '</table>';
    }

    function renderFirmas() {
        return '<table class="firmas flow-block"><tr>' +
            '<td>' + getFirmaHtml(firmaCT) + '<div class="linea-firma"></div><div>Titular del Puesto</div><div class="nombre-firma"><strong>Nombre:</strong> ' + titularNombre + '</div></td>' +
            '<td>' + getFirmaHtml(firmaJI) + '<div class="linea-firma"></div><div>Jefe Inmediato</div><div class="nombre-firma"><strong>Nombre:</strong> ' + text(d.creador) + '</div></td>' +
            '</tr></table>';
    }

    var actividadesHtml = renderActividades(0, funciones.length);
    var objetivoHtml = hasText(d.objetivo) ? '<div class="flow-block"><div class="section-label indent">I. &nbsp; OBJETIVO DEL PUESTO</div><div class="objective-box">' + text(d.objetivo) + '</div></div>' : '';
    var actividadesTitulo = actividadesHtml ? '<div class="section-label indent">III. FUNCIONES CLAVES Y ACTIVIDADES</div>' : '';

    var CSS = `<style>
        @page { size: letter; margin: 0.13in 0.24in 0.38in 0.24in; }
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #fff; color: #000; }
        body { font-family: "Arial Narrow", Arial, Helvetica, sans-serif; font-size: 8pt; font-stretch: condensed; }
        .report-page { width: 8.02in; margin: 0 auto; background: #fff; }
        .print-shell { width: 100%; border-collapse: collapse; }
        .print-shell > thead { display: table-header-group; }
        .print-shell > tfoot { display: table-footer-group; }
        .print-shell > thead > tr > td,
        .print-shell > tbody > tr > td,
        .print-shell > tfoot > tr > td { border: none; padding: 0; }
        .report-content { padding: 0 0 0.08in 0; }
        .header-tabla, .tabla { width: 100%; border-collapse: collapse; }
        .header-tabla { border: 1px solid #002060; margin-bottom: 7px; }
        .header-tabla td { border-left: 1px solid #002060; padding: 4px 8px; height: 38px; vertical-align: middle; font-weight: 700; }
        .header-tabla td:first-child { border-left: none; }
        .header-logo { width: 13%; text-align: center; }
        .logo-img { max-height: 30px; max-width: 38px; }
        .header-title { width: 55%; font-size: 7.6pt; }
        .header-doc-title { width: 32%; text-align: center; font-size: 7.6pt; }
        .tabla th, .tabla td { border: 0.8px solid #000; padding: 2px 5px; vertical-align: top; height: 16px; line-height: 1.08; }
        .tabla th { font-weight: 700; background: #f1f1f1; }
        .generalidades th { text-align: left; color: #0b2e6d; background: #f1f1f1; }
        .generalidades .label { width: 28%; font-weight: 700; }
        .generalidades td:nth-child(2) { width: 36%; }
        .generalidades td:nth-child(4) { width: 21%; }
        .bar-title { background: #595959; color: #fff; font-weight: 700; padding: 4px 8px; margin-top: 10px; font-size: 9.5pt; }
        .section-label { font-weight: 700; padding: 3px 5px; line-height: 1.05; }
        .indent { padding-left: 33px; }
        .objective-box { border: 0.8px solid #000; min-height: 24px; padding: 4px 6px; margin-bottom: 4px; }
        .compacta th, .compacta td { padding: 2px 5px; height: 16px; }
        .code-col { width: 18%; }
        .funcion-col { width: 18%; }
        .actividad-tabla { margin-bottom: 0; }
        .border-box { border: 0.8px solid #000; padding: 3px 8px; }
        .small-pad { padding: 3px 5px; }
        .plain-list { margin: 0 0 0 18px; padding: 0; }
        .plain-list li { margin: 1px 0; }
        .sub-label { border: 0.8px solid #000; border-bottom: none; padding: 2px 5px; font-weight: 700; margin-top: 2px; }
        .perfil th, .perfil td { text-align: center; }
        .mt10 { margin-top: 10px; }
        .mt14 { margin-top: 14px; }
        .conductual-tabla { margin-top: 10px; }
        .conductual-tabla th { text-align: center; }
        .conductual-label { width: 32%; text-align: center; font-weight: 700; }
        .conductual-tabla td { min-height: 34px; height: 34px; }
        .firmas { width: 100%; margin-top: 46px; border-collapse: collapse; }
        .firmas td { width: 50%; text-align: center; vertical-align: bottom; padding: 0 36px; }
        .linea-firma { border-top: 1px solid #000; height: 8px; margin-top: 14px; }
        .nombre-firma { text-align: left; margin-top: 9px; }
        .firma-img { max-width: 145px; max-height: 46px; object-fit: contain; display: inline-block; }
        .page-footer { text-align: right; color: #0b2e6d; font-weight: 700; font-size: 8.2pt; padding-top: 8px; }
        @media print {
            .page-number,
            .page-total { font-size: 0; }
            .page-number::after {
                content: counter(page);
                font-size: 8pt;
            }
            .page-total::after {
                content: counter(pages);
                font-size: 8pt;
            }
        }
        .center { text-align: center; }
        .flow-block { break-inside: avoid; page-break-inside: avoid; }
        .section-label,
        .bar-title,
        .objective-box,
        .actividad-tabla,
        .border-box,
        .sub-label,
        .perfil,
        .conductual-tabla,
        .firmas { break-inside: avoid; page-break-inside: avoid; }
        @media screen {
            body { background: #fff; }
            .report-page { width: 8.5in; min-height: 11in; padding: 0.13in 0.24in 0.38in 0.24in; }
        }
    </style>`;

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Descriptor ${text(d.codigo)}</title>${CSS}</head><body>
    <div class="report-page">
        <table class="print-shell">
            <thead><tr><td>${headerPagina()}</td></tr></thead>
            <tbody><tr><td class="report-content">
                <div class="flow-block"><div class="bar-title">DESCRIPTOR DE PUESTO</div></div>
                ${objetivoHtml}
                ${renderFuncionesResponsabilidad()}
                ${actividadesTitulo ? '<div class="flow-block">' + actividadesTitulo + '</div>' : ''}
                ${actividadesHtml}
                ${renderResponsabilidades()}
                ${renderRelaciones()}
                ${renderRequerimientos()}
                ${renderRiesgos()}
                ${renderEntrenamiento()}
                ${renderPerfil()}
                ${renderEducacion()}
                ${renderExperiencia()}
                ${renderCompetenciasTecnicas()}
                ${renderCompetenciasConductuales()}
                ${renderFirmas()}
            </td></tr></tbody>
            <tfoot><tr><td>${footerPagina()}</td></tr></tfoot>
        </table>
    </div>
    <script>
        (function() {
            function actualizarPaginacion() {
                var page = document.querySelector('.report-page');
                if (!page) return;
                var pageHeight = 1056;
                var total = Math.max(1, Math.ceil(page.scrollHeight / pageHeight));
                var totals = document.querySelectorAll('.page-total');
                var numbers = document.querySelectorAll('.page-number');
                for (var i = 0; i < totals.length; i++) totals[i].textContent = total;
                for (var j = 0; j < numbers.length; j++) numbers[j].textContent = j + 1;
            }
            window.addEventListener('load', actualizarPaginacion);
            setTimeout(actualizarPaginacion, 100);
            setTimeout(actualizarPaginacion, 500);
        })();
    <\/script>
</body></html>`;
}