// Controlador de Firmas - Jefe de Talento Humano
var JTHController = {
    currentUser: null,
    currentPage: 1,
    pageSize: 5,
    navigationToken: null,
    
    init: function(user, options) {
        this.currentUser = user;
        this.navigationToken = options && options.navigationToken ? options.navigationToken : (window._currentNavigationToken || null);
        console.log('JTHController iniciado para:', user.nombre);
        this.loadView();
    },
    
    loadView: function() {
        var self = this;
        var token = this.navigationToken;
        $('#pageTitle').text('Aprobación Jefe de Talento Humano');
        $('#contentContainer').empty();
        $.get('modulos/frmFirmaJTH/view/jthView.html', function(html) {
            if (token && typeof window.isCurrentNavigationToken === 'function' && !window.isCurrentNavigationToken(token)) return;
            $('#contentContainer').html(html);
            self.cargarPendientes();
            self.cargarFirmados();
        }).fail(function() {
            if (token && typeof window.isCurrentNavigationToken === 'function' && !window.isCurrentNavigationToken(token)) return;
            $('#contentContainer').html('<div class="alert alert-danger">Error al cargar la vista de firmas JTH</div>');
        });
    },
    
    cargarPendientes: function() {
        var pendientes = JTHService.getPendientesFirma();
        var firmados = JTHService.getFirmados();
        var unificados = {};
        for (var p = 0; p < pendientes.length; p++) unificados[pendientes[p].id] = pendientes[p];
        for (var f = 0; f < firmados.length; f++) unificados[firmados[f].id] = firmados[f];
        var lista = Object.keys(unificados).map(function(id) { return unificados[id]; });
        
        if (lista.length === 0) {
            $('#pendientesContainer').html('<div class="alert alert-info text-center"><i class="fas fa-inbox fa-3x mb-3 d-block"></i><h5>No hay descriptores para mostrar</h5></div>');
            if (typeof actualizarContador === 'function') {
                actualizarContador();
            }
            return;
        }
        
        var totalPages = Math.max(1, Math.ceil(lista.length / this.pageSize));
        if (this.currentPage > totalPages) this.currentPage = totalPages;
        var start = (this.currentPage - 1) * this.pageSize;
        var pageItems = lista.slice(start, start + this.pageSize);
        var end = Math.min(start + this.pageSize, lista.length);

        var html = '<div class="workflow-table-card"><div class="table-responsive"><table class="table table-hover align-middle"><thead class="table-light"><tr>' +
            '<th>Opciones</th><th>Código</th><th>Puesto</th><th>Área</th><th>Versión</th><th>Formato</th><th>Estado</th><th>Creador</th><th>Fecha</th></tr></thead><tbody>';
        for (var i = 0; i < pageItems.length; i++) {
            var d = pageItems[i];
            var fecha = d.fechaEmision || (d.fechaCreacion ? d.fechaCreacion.split('T')[0] : '-');
            var tieneFirma = JTHService.getFirma(d.id) || d.firmaJTH;
            var badgeClass = tieneFirma ? 'bg-success' : 'bg-warning';
            var badgeText = tieneFirma ? 'Aprobado' : 'Pendiente';
            var esExtensa = (d.tipoFormato || 'CORTA') === 'EXTENSA';
            var formatoBadge = esExtensa
                ? '<span class="badge rounded-pill bg-secondary-subtle text-secondary border border-secondary-subtle"><i class="fas fa-file-lines me-1"></i>Extensa</span>'
                : '<span class="badge rounded-pill bg-success-subtle text-success border border-success-subtle"><i class="fas fa-file-alt me-1"></i>Corta</span>';
            var puedeAprobar = !tieneFirma && d.estado === 'FIRMADO_JI';
            var btnText = tieneFirma ? 'Ver Aprobación' : 'Aprobar Documento';
            var accionFirma = tieneFirma
                ? '<li><button class="dropdown-item" onclick="JTHController.verFirma(' + d.id + ')"><i class="fas fa-check-circle me-2 text-success"></i>' + btnText + '</button></li>'
                : (puedeAprobar
                    ? '<li><button class="dropdown-item" onclick="JTHController.firmar(' + d.id + ')"><i class="fas fa-check me-2 text-warning"></i>' + btnText + '</button></li>'
                    : '<li><span class="dropdown-item text-muted"><i class="fas fa-clock me-2"></i>Fuera de turno</span></li>');
            var reportes = '';
            if (d.estado === 'ACTIVO') {
                reportes = (d.tipoFormato || 'CORTA') === 'EXTENSA'
                    ? '<li><button class="dropdown-item" onclick="generarVersionExtensa(' + d.id + ')"><i class="fas fa-file-pdf me-2 text-secondary"></i>Versión Extensa</button></li>'
                    : '<li><button class="dropdown-item" onclick="generarVersionCorta(' + d.id + ')"><i class="fas fa-file-pdf me-2 text-success"></i>Versión Corta</button></li>';
            }
            
            html += '<tr>' +
                '<td><div class="dropdown workflow-actions"><button class="btn btn-sm btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-boundary="viewport" data-bs-display="static"><i class="fas fa-ellipsis-v"></i></button>' +
                '<ul class="dropdown-menu dropdown-menu-end" style="z-index: 5000;">' +
                '<li><button class="dropdown-item" onclick="JTHController.verDetalle(' + d.id + ')"><i class="fas fa-eye me-2 text-info"></i>Ver detalle</button></li>' +
                accionFirma +
                '<li><button class="dropdown-item" onclick="JTHController.verAuditoriaCompleta(' + d.id + ')"><i class="fas fa-list me-2 text-primary"></i>Auditoría completa</button></li>' +
                '<li><button class="dropdown-item" onclick="JTHController.verMisAcciones(' + d.id + ')"><i class="fas fa-user-clock me-2 text-secondary"></i>Mis acciones</button></li>' +
                reportes + '</ul></div></td>' +
                '<td><strong>' + (d.codigo || 'DES-' + d.id) + '</strong></td>' +
                '<td class="workflow-table-title">' + (d.puesto || 'Sin título') + '</td>' +
                '<td>' + (d.area || 'N/A') + '</td>' +
                '<td><span class="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle"><i class="fas fa-code-branch me-1"></i>Versión ' + (d.version || 1) + '</span></td>' +
                '<td>' + formatoBadge + '</td>' +
                '<td><span class="badge ' + badgeClass + '">' + badgeText + '</span></td>' +
                '<td>' + (d.creador || 'N/A') + '</td>' +
                '<td>' + fecha + '</td>' +
                '</tr>';
        }
        html += '</tbody></table></div>' + this.renderPagination(lista.length, start, end, totalPages) + '</div>';
        $('#pendientesContainer').html(html);
        $('#firmadosContainer').empty();
        if (typeof actualizarContador === 'function') {
            actualizarContador();
        }
        this.initDropdowns();
    },

    initDropdowns: function() {
        $('.workflow-actions .dropdown-menu').css({ width: '220px', minWidth: '220px', maxWidth: '220px', zIndex: 5000 });
        $('.workflow-actions .dropdown-toggle').off('shown.bs.dropdown.workflowMenu').on('shown.bs.dropdown.workflowMenu', function() {
            var buttonRect = this.getBoundingClientRect();
            var menu = $(this).siblings('.dropdown-menu')[0];
            if (!menu) return;
            menu.style.position = 'fixed';
            menu.style.width = '220px';
            menu.style.minWidth = '220px';
            menu.style.maxWidth = '220px';
            menu.style.top = (buttonRect.bottom + 4) + 'px';
            menu.style.left = Math.max(8, Math.min(buttonRect.left, window.innerWidth - 228)) + 'px';
            menu.style.zIndex = '5000';
        });
        $('.workflow-actions .dropdown-toggle').off('hidden.bs.dropdown.workflowMenu').on('hidden.bs.dropdown.workflowMenu', function() {
            var menu = $(this).siblings('.dropdown-menu')[0];
            if (!menu) return;
            menu.style.position = '';
            menu.style.width = '';
            menu.style.minWidth = '';
            menu.style.maxWidth = '';
            menu.style.top = '';
            menu.style.left = '';
            menu.style.zIndex = '';
        });
    },

    renderPagination: function(total, start, end, totalPages) {
        var html = '<div class="workflow-pagination-footer">' +
            '<div class="workflow-page-size-options">' +
            '<button class="workflow-page-size-btn ' + (this.pageSize === 5 ? 'active' : '') + '" onclick="JTHController.cambiarPageSize(5)">5</button>' +
            '<button class="workflow-page-size-btn ' + (this.pageSize === 10 ? 'active' : '') + '" onclick="JTHController.cambiarPageSize(10)">10</button>' +
            '<button class="workflow-page-size-btn ' + (this.pageSize === 25 ? 'active' : '') + '" onclick="JTHController.cambiarPageSize(25)">25</button>' +
            '</div><div class="small text-muted">Mostrando ' + (start + 1) + ' a ' + end + ' de ' + total + ' registros</div>' +
            '<nav><ul class="pagination pagination-sm mb-0">' +
            '<li class="page-item ' + (this.currentPage === 1 ? 'disabled' : '') + '"><button class="page-link" onclick="JTHController.cambiarPagina(' + (this.currentPage - 1) + ')"><i class="fas fa-chevron-left"></i></button></li>';
        for (var p = 1; p <= totalPages; p++) {
            html += '<li class="page-item ' + (p === this.currentPage ? 'active' : '') + '"><button class="page-link" onclick="JTHController.cambiarPagina(' + p + ')">' + p + '</button></li>';
        }
        html += '<li class="page-item ' + (this.currentPage === totalPages ? 'disabled' : '') + '"><button class="page-link" onclick="JTHController.cambiarPagina(' + (this.currentPage + 1) + ')"><i class="fas fa-chevron-right"></i></button></li>' +
            '</ul></nav></div>';
        return html;
    },

    cambiarPagina: function(page) {
        this.currentPage = page;
        this.cargarPendientes();
    },

    cambiarPageSize: function(size) {
        this.pageSize = size;
        this.currentPage = 1;
        this.cargarPendientes();
    },
    
    cargarFirmados: function() {
        $('#firmadosContainer').empty();
    },

    getAccionTexto: function(accion) {
        var acciones = {
            'APROBACIÓN SIMPLE DEL JEFE DE TALENTO HUMANO': 'APROBACIÓN DEL JEFE DE TALENTO HUMANO',
            'APROBACIÓN SIMPLE DEL COLABORADOR/TITULAR': 'APROBACIÓN DEL COLABORADOR/TITULAR',
            'APROBACIÓN SIMPLE DEL JEFE INMEDIATO': 'APROBACIÓN DEL JEFE INMEDIATO'
        };
        return acciones[accion] || accion || 'Evento';
    },

    verDetalle: function(id) {
        var descriptor = JTHService.getById(id);
        if (!descriptor) return;
        if (typeof DescriptorController === 'undefined') {
            Swal.fire('Error', 'No se puede abrir el detalle del descriptor', 'error');
            return;
        }

        $('#pageTitle').text('Detalle del Descriptor');
        var token = typeof window.beginNavigation === 'function' ? window.beginNavigation() : this.navigationToken;
        this.navigationToken = token;
        var firmasGuardadas = JSON.parse(localStorage.getItem('firmas') || '{}');
        var firmaJTH = descriptor.firmaJTH || firmasGuardadas['jth_' + id];
        var estadosFirma = ['FIRMADO_JI'];
        var puedeEditarDescriptor = estadosFirma.indexOf(descriptor.estado) !== -1 && !firmaJTH;
        DescriptorController.init(this.currentUser, id, {
            readOnly: !puedeEditarDescriptor,
            thReview: true,
            canEditThComplements: puedeEditarDescriptor,
            navigationToken: token,
            afterSaveModule: 'JTH'
        });

        var self = this;
        var intentos = 0;
        function insertarPanelFirmas() {
            if (token && typeof window.isCurrentNavigationToken === 'function' && !window.isCurrentNavigationToken(token)) return;
            intentos++;
            if ($('#descriptorForm').length === 0 && intentos < 20) {
                setTimeout(insertarPanelFirmas, 150);
                return;
            }
            self.renderPanelFirmas(id, JTHService.getById(id) || descriptor);
        }
        setTimeout(insertarPanelFirmas, 150);
    },

    renderPanelFirmas: function(id, descriptor) {
        $('#jthFirmaStatusPanel').remove();

        var firmasGuardadas = JSON.parse(localStorage.getItem('firmas') || '{}');
        var firmaJTH = descriptor.firmaJTH || firmasGuardadas['jth_' + id];
        var firmaCT = descriptor.firmaCT || firmasGuardadas['ct_' + id];
        var firmaJI = descriptor.firmaJI || firmasGuardadas['ji_' + id];
        var puedeFirmar = !firmaJTH && descriptor.estado === 'FIRMADO_JI';

        function firmaItem(nombre, firmada, fecha) {
            return '<div class="firma-status-item">' +
                '<div><i class="fas ' + (firmada ? 'fa-check-circle text-success' : 'fa-clock text-warning') + ' me-1"></i><strong>' + nombre + '</strong></div>' +
                '<span class="badge ' + (firmada ? 'bg-success' : 'bg-warning text-dark') + '">' + (firmada ? 'Aprobado' : 'Pendiente') + '</span>' +
                (firmada && fecha ? '<small class="text-muted d-block mt-1">' + new Date(fecha).toLocaleString() + '</small>' : '') +
                '</div>';
        }

        var panel = '<style>' +
            '.firma-status-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:12px;}' +
            '.firma-status-item{border:1px solid #d9e6f8;border-radius:12px;background:#f8fbff;padding:10px 12px;min-height:76px;}' +
            'body.dark-mode .firma-status-item{background:#111827;border-color:#374151;color:#e5e7eb;}' +
            '@media(max-width:768px){.firma-status-grid{grid-template-columns:1fr;}}' +
            '</style>' +
            '<div id="jthFirmaStatusPanel" class="alert alert-primary border-primary-subtle mb-3">' +
            '<div class="d-flex flex-wrap align-items-start justify-content-between gap-3">' +
            '<div>' +
            '<h6 class="mb-1"><i class="fas fa-check-circle me-1"></i> Estado de aprobaciones del descriptor</h6>' +
            '<div class="small">Descriptor <strong>' + (descriptor.codigo || 'DES-' + id) + '</strong> | Puesto: <strong>' + (descriptor.puesto || '-') + '</strong> | Estado: <strong>' + (descriptor.estado || '-') + '</strong></div>' +
            '</div>' +
            '<div class="d-flex flex-wrap gap-2 justify-content-end">' +
            '<button type="button" class="btn btn-outline-secondary" onclick="JTHController.loadView()"><i class="fas fa-arrow-left me-1"></i> Volver</button>' +
            (firmaJTH ? '<button type="button" class="btn btn-outline-success" onclick="JTHController.verFirma(' + id + ')"><i class="fas fa-check-circle me-1"></i> Ver aprobación</button>' : '') +
            (puedeFirmar ? '<button type="button" class="btn btn-success" onclick="JTHController.firmar(' + id + ')"><i class="fas fa-check me-1"></i> Aprobar documento</button>' : '') +
            '</div>' +
            '</div>' +
            '<div class="firma-status-grid">' +
            firmaItem('Colaborador / Titular', !!firmaCT, descriptor.fechaFirmaCT) +
            firmaItem('Jefe Inmediato', !!firmaJI, descriptor.fechaFirmaJI) +
            firmaItem('Jefe de Talento Humano', !!firmaJTH, descriptor.fechaFirmaJTH) +
            '</div>' +
            '</div>';

        var $alert = $('#readOnlyDescriptorAlert');
        if ($alert.length) {
            $alert.after(panel);
        } else {
            $('.descriptor-save-top').after(panel);
        }
    },

    verAuditoriaCompleta: function(id) {
        var descriptor = JTHService.getById(id);
        if (!descriptor) return;
        var eventos = (descriptor.auditoria && descriptor.auditoria.eventos) ? descriptor.auditoria.eventos.slice() : [];
        this.mostrarEventosAuditoria('Auditoría completa', descriptor, eventos);
    },

    verMisAcciones: function(id) {
        var descriptor = JTHService.getById(id);
        if (!descriptor) return;
        var usuario = this.currentUser.nombre;
        var eventos = ((descriptor.auditoria && descriptor.auditoria.eventos) ? descriptor.auditoria.eventos : []).filter(function(ev) {
            return ev.usuario === usuario;
        });
        this.mostrarEventosAuditoria('Mis acciones', descriptor, eventos);
    },

    mostrarEventosAuditoria: function(titulo, descriptor, eventos) {
        var html = '<div class="text-start" style="max-height:520px;overflow-y:auto;">';
        html += '<div class="alert alert-info"><strong>Descriptor:</strong> ' + (descriptor.codigo || 'DES-' + descriptor.id) + '<br><strong>Puesto:</strong> ' + (descriptor.puesto || '-') + '<br><strong>Estado actual:</strong> ' + (descriptor.estado || '-') + '</div>';
        if (!eventos || eventos.length === 0) {
            html += '<p class="text-muted">No hay eventos registrados.</p>';
        } else {
            eventos.sort(function(a, b) { return new Date(a.fecha) - new Date(b.fecha); });
            for (var i = 0; i < eventos.length; i++) {
                html += '<div class="border-bottom py-2"><strong>' + this.getAccionTexto(eventos[i].accion) + '</strong><br><small class="text-muted">' + new Date(eventos[i].fecha).toLocaleString() + ' | ' + (eventos[i].usuario || 'Sistema') + ' - ' + (eventos[i].rol || '') + '</small></div>';
            }
        }
        html += '</div>';
        Swal.fire({ title: titulo, html: html, width: '700px', confirmButtonText: 'Cerrar', confirmButtonColor: '#0d6efd' });
    },
    
    verFirma: function(id) {
        var descriptor = JTHService.getById(id);
        if (!descriptor) return;
        
        var firma = JTHService.getFirma(id) || descriptor.firmaJTH;
        if (!firma) {
            Swal.fire('Sin aprobación', 'No se encontró una aprobación registrada para este descriptor.', 'info');
            return;
        }

        var nombre = firma.nombre || 'Lic. Carlos Gómez';
        var fecha = firma.fecha || descriptor.fechaFirmaJTH;
        var modalHtml = '<div class="text-start">' +
            '<div class="alert alert-success"><i class="fas fa-check-circle me-1"></i> Aprobación registrada correctamente.</div>' +
            '<p><strong>Descriptor:</strong> ' + (descriptor.codigo || 'DES-' + id) + '</p>' +
            '<p><strong>Puesto:</strong> ' + (descriptor.puesto || '-') + '</p>' +
            '<p><strong>Aprobado por:</strong> ' + nombre + '</p>' +
            '<p><strong>Fecha:</strong> ' + (fecha ? new Date(fecha).toLocaleString() : '-') + '</p>' +
            '</div>';
        
        Swal.fire({
            title: 'Aprobación - Jefe de Talento Humano',
            html: modalHtml,
            width: '520px',
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#0d6efd'
        });
    },
    
    firmar: function(id) {
        var descriptor = JTHService.getById(id);
        if (!descriptor) return;
        if (descriptor.estado !== 'FIRMADO_JI' || descriptor.firmaJTH || JTHService.getFirma(id)) {
            Swal.fire('Fuera de turno', 'El Jefe de Talento Humano solo puede aprobar después del colaborador y del jefe inmediato.', 'info');
            return;
        }

        Swal.fire({
            title: '¿Aprobar descriptor?',
            html: '<div class="text-start"><p>Se registrará la aprobación del Jefe de Talento Humano.</p><p><strong>Descriptor:</strong> ' + (descriptor.codigo || 'DES-' + id) + '</p><p><strong>Puesto:</strong> ' + (descriptor.puesto || '-') + '</p></div>',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-check"></i> Aprobar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#198754'
        }).then(function(result) {
            if (result.isConfirmed) {
                var aprobacion = {
                    aprobado: true,
                    nombre: JTHController.currentUser.nombre,
                    rol: JTHController.currentUser.rolNombre,
                    fecha: new Date().toISOString(),
                    tipo: 'APROBACION_SIMPLE'
                };
                JTHService.guardarFirma(id, aprobacion);
                var descriptorActualizado = JTHService.getById(id);
                var estadoFirma = descriptorActualizado ? descriptorActualizado.estado : 'FIRMA_JTH';
                DescriptorService.registrarEvento(id, {
                    accion: 'APROBACIÓN DEL JEFE DE TALENTO HUMANO',
                    usuario: JTHController.currentUser.nombre,
                    rol: JTHController.currentUser.rolNombre,
                    estadoNuevo: 'FIRMADO_JTH',
                    estado: estadoFirma
                });
                var mensaje = estadoFirma === 'ACTIVO' ? 'Descriptor aprobado y activado correctamente' : 'Descriptor aprobado exitosamente. Aún quedan aprobaciones pendientes.';
                Swal.fire('Aprobado', mensaje, 'success').then(function() {
                    if ($('#jthFirmaStatusPanel').length > 0) {
                        JTHController.renderPanelFirmas(id, descriptorActualizado);
                    } else {
                        JTHController.cargarPendientes();
                        JTHController.cargarFirmados();
                    }
                });
            }
        });
    }
};

window.JTHController = JTHController;