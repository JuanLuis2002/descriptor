// Controlador de Firmas - Colaborador / Titular
var CTController = {
    currentUser: null,
    currentPage: 1,
    pageSize: 5,
    
    init: function(user) {
        this.currentUser = user;
        console.log('CTController iniciado para:', user.nombre);
        this.loadView();
    },
    
    loadView: function() {
        var self = this;
        $('#contentContainer').empty();
        $.get('modulos/frmFirmaCT/view/ctView.html', function(html) {
            $('#contentContainer').html(html);
            self.cargarPendientes();
            self.cargarFirmados();
        }).fail(function() {
            $('#contentContainer').html('<div class="alert alert-danger">Error al cargar la vista de firmas CT</div>');
        });
    },
    
    cargarPendientes: function() {
        var pendientes = CTService.getPendientesFirma(this.currentUser.nombre);
        var firmados = CTService.getFirmados(this.currentUser.nombre);
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
            '<th>Opciones</th><th>Código</th><th>Puesto</th><th>Área</th><th>Estado</th><th>Titular</th><th>Fecha</th></tr></thead><tbody>';
        for (var i = 0; i < pageItems.length; i++) {
            var d = pageItems[i];
            var fecha = d.fechaEmision || (d.fechaCreacion ? d.fechaCreacion.split('T')[0] : '-');
            var tieneFirma = CTService.getFirma(d.id) || d.firmaCT;
            var estadoBadge = tieneFirma ? '<span class="badge bg-success">Firmado</span>' : '<span class="badge bg-warning text-dark">Pendiente</span>';
            var accionFirma = tieneFirma
                ? '<li><button class="dropdown-item" onclick="CTController.verFirma(' + d.id + ')"><i class="fas fa-signature me-2 text-success"></i>Ver Firma</button></li>'
                : '<li><button class="dropdown-item" onclick="CTController.firmar(' + d.id + ')"><i class="fas fa-signature me-2 text-warning"></i>Firmar Documento</button></li>';
            
            html += '<tr>' +
                '<td><div class="dropdown workflow-actions"><button class="btn btn-sm btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-boundary="viewport" data-bs-display="static"><i class="fas fa-ellipsis-v"></i></button>' +
                '<ul class="dropdown-menu dropdown-menu-end" style="z-index: 5000;">' + accionFirma +
                '<li><button class="dropdown-item" onclick="CTController.verAuditoriaCompleta(' + d.id + ')"><i class="fas fa-list me-2 text-primary"></i>Auditoría completa</button></li>' +
                '<li><button class="dropdown-item" onclick="CTController.verMisAcciones(' + d.id + ')"><i class="fas fa-user-clock me-2 text-secondary"></i>Mis acciones</button></li>' +
                '</ul></div></td>' +
                '<td><strong>' + (d.codigo || 'DES-' + d.id) + '</strong></td>' +
                '<td class="workflow-table-title">' + (d.puesto || 'Sin título') + '</td>' +
                '<td>' + (d.area || 'N/A') + '</td>' +
                '<td>' + estadoBadge + '</td>' +
                '<td>' + (d.titular || 'No asignado') + '</td>' +
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
            '<button class="workflow-page-size-btn ' + (this.pageSize === 5 ? 'active' : '') + '" onclick="CTController.cambiarPageSize(5)">5</button>' +
            '<button class="workflow-page-size-btn ' + (this.pageSize === 10 ? 'active' : '') + '" onclick="CTController.cambiarPageSize(10)">10</button>' +
            '<button class="workflow-page-size-btn ' + (this.pageSize === 25 ? 'active' : '') + '" onclick="CTController.cambiarPageSize(25)">25</button>' +
            '</div><div class="small text-muted">Mostrando ' + (start + 1) + ' a ' + end + ' de ' + total + ' registros</div>' +
            '<nav><ul class="pagination pagination-sm mb-0">' +
            '<li class="page-item ' + (this.currentPage === 1 ? 'disabled' : '') + '"><button class="page-link" onclick="CTController.cambiarPagina(' + (this.currentPage - 1) + ')"><i class="fas fa-chevron-left"></i></button></li>';
        for (var p = 1; p <= totalPages; p++) {
            html += '<li class="page-item ' + (p === this.currentPage ? 'active' : '') + '"><button class="page-link" onclick="CTController.cambiarPagina(' + p + ')">' + p + '</button></li>';
        }
        html += '<li class="page-item ' + (this.currentPage === totalPages ? 'disabled' : '') + '"><button class="page-link" onclick="CTController.cambiarPagina(' + (this.currentPage + 1) + ')"><i class="fas fa-chevron-right"></i></button></li>' +
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

    verAuditoriaCompleta: function(id) {
        var descriptor = CTService.getById(id);
        if (!descriptor) return;
        var eventos = (descriptor.auditoria && descriptor.auditoria.eventos) ? descriptor.auditoria.eventos.slice() : [];
        this.mostrarEventosAuditoria('Auditoría completa', descriptor, eventos);
    },

    verMisAcciones: function(id) {
        var descriptor = CTService.getById(id);
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
                html += '<div class="border-bottom py-2"><strong>' + (eventos[i].accion || 'Evento') + '</strong><br><small class="text-muted">' + new Date(eventos[i].fecha).toLocaleString() + ' | ' + (eventos[i].usuario || 'Sistema') + ' - ' + (eventos[i].rol || '') + '</small></div>';
            }
        }
        html += '</div>';
        Swal.fire({ title: titulo, html: html, width: '700px', confirmButtonText: 'Cerrar', confirmButtonColor: '#0d6efd' });
    },
    
    verFirma: function(id) {
        var descriptor = CTService.getById(id);
        if (!descriptor) return;
        
        var firma = CTService.getFirma(id) || descriptor.firmaCT;
        if (!firma) {
            Swal.fire('Sin firma', 'No se encontró una firma digital para este descriptor.', 'info');
            return;
        }
        
        var modalHtml = '<div class="text-center signature-modal">' +
            '<div class="alert alert-info text-start"><strong>Descriptor:</strong> ' + (descriptor.codigo || 'DES-' + id) + '<br><strong>Puesto:</strong> ' + (descriptor.puesto || '-') + '<br><strong>Fecha de firma:</strong> ' + (descriptor.fechaFirmaCT ? new Date(descriptor.fechaFirmaCT).toLocaleString() : '-') + '</div>' +
            '<div class="border rounded mx-auto p-3 bg-white signature-preview-box" style="max-width: 430px;"><img src="' + firma + '" alt="Firma CT" style="max-width:100%; max-height:220px;"></div>' +
            '<button id="descargarFirmaCT" class="btn btn-info btn-sm mt-3"><i class="fas fa-download"></i> Descargar Firma</button>' +
            '</div>';
        
        Swal.fire({
            title: 'Firma Digital - ' + (descriptor.titular || 'Colaborador'),
            html: modalHtml,
            width: '520px',
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#0d6efd',
            didOpen: function() {
                $('#descargarFirmaCT').click(function() {
                    var link = document.createElement('a');
                    link.download = 'firma_ct_' + id + '.png';
                    link.href = firma;
                    link.click();
                });
            }
        });
    },
    
    firmar: function(id) {
        var descriptor = CTService.getById(id);
        if (!descriptor) return;
        
        var firmaExistente = CTService.getFirma(id);
        
        var modalHtml = '<div class="text-center signature-modal">' +
            '<p class="mb-2">Firme en el recuadro con el mouse o dedo:</p>' +
            '<div id="signature-pad" class="border rounded mx-auto signature-pad-box" style="width: 400px; height: 200px; background: white; border: 2px solid #ccc;">' +
            '<canvas id="firmaCanvas" width="400" height="200" style="width:100%;height:100%;"></canvas>' +
            '</div>' +
            '<div class="mt-3 signature-actions">' +
            '<button id="limpiarFirma" class="btn btn-secondary btn-sm mx-1"><i class="fas fa-eraser"></i> Limpiar</button>' +
            '<button id="descargarFirma" class="btn btn-info btn-sm mx-1"><i class="fas fa-download"></i> Descargar</button>' +
            '</div>' +
            '</div>';
        
        Swal.fire({
            title: 'Firma Digital - ' + (descriptor.titular || 'Colaborador'),
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
                function resizeSignatureCanvas() {
                    var ratio = Math.max(window.devicePixelRatio || 1, 1);
                    var box = canvas.parentElement;
                    canvas.width = box.offsetWidth * ratio;
                    canvas.height = box.offsetHeight * ratio;
                    canvas.getContext('2d').scale(ratio, ratio);
                    signaturePad.clear();
                    if (firmaExistente) {
                        signaturePad.fromDataURL(firmaExistente);
                    }
                }
                resizeSignatureCanvas();
                $(window).off('resize.signatureCT').on('resize.signatureCT', resizeSignatureCanvas);
                
                if (firmaExistente) {
                    signaturePad.fromDataURL(firmaExistente);
                }
                
                $('#limpiarFirma').click(function() {
                    signaturePad.clear();
                });
                
                $('#descargarFirma').click(function() {
                    if (signaturePad.isEmpty()) {
                        Swal.fire('Advertencia', 'No hay firma para descargar', 'warning');
                        return;
                    }
                    var dataURL = signaturePad.toDataURL('image/png');
                    var link = document.createElement('a');
                    link.download = 'firma_ct_' + id + '.png';
                    link.href = dataURL;
                    link.click();
                });
                
                window.currentSignaturePad = signaturePad;
            },
            willClose: function() {
                $(window).off('resize.signatureCT');
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
                CTService.guardarFirma(id, result.value);
                var descriptorActualizado = CTService.getById(id);
                var estadoFirma = descriptorActualizado ? descriptorActualizado.estado : 'FIRMA_JTH';
                DescriptorService.registrarEvento(id, {
                    accion: 'FIRMA DEL COLABORADOR/TITULAR',
                    usuario: CTController.currentUser.nombre,
                    rol: CTController.currentUser.rolNombre,
                    estadoNuevo: 'FIRMADO_CT',
                    estado: estadoFirma
                });
                var mensaje = estadoFirma === 'ACTIVO' ? 'Descriptor firmado y activado correctamente' : 'Descriptor firmado exitosamente. Aún quedan firmas pendientes.';
                Swal.fire('Firmado', mensaje, 'success').then(function() {
                    CTController.cargarPendientes();
                    CTController.cargarFirmados();
                });
            }
        });
    }
};

window.CTController = CTController;