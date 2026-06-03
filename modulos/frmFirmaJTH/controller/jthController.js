// Controlador de Firmas - Jefe de Talento Humano
var JTHController = {
    currentUser: null,
    
    init: function(user) {
        this.currentUser = user;
        console.log('JTHController iniciado para:', user.nombre);
        this.loadView();
    },
    
    loadView: function() {
        var self = this;
        $('#contentContainer').empty();
        $.get('modulos/frmFirmaJTH/view/jthView.html', function(html) {
            $('#contentContainer').html(html);
            self.cargarPendientes();
            self.cargarFirmados();
        }).fail(function() {
            $('#contentContainer').html('<div class="alert alert-danger">Error al cargar la vista de firmas JTH</div>');
        });
    },
    
    cargarPendientes: function() {
        // Buscar descriptores con estado FIRMA_JTH
        var todos = DescriptorService.getAll();
        var pendientes = [];
        for (var i = 0; i < todos.length; i++) {
            if (todos[i].estado === 'FIRMA_JTH') {
                pendientes.push(todos[i]);
            }
        }
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
        
        var html = '<div class="table-responsive" style="overflow: visible;"><table class="table table-hover align-middle mb-0"><thead class="table-light"><tr>' +
            '<th>Opciones</th><th>Código</th><th>Puesto</th><th class="d-none d-md-table-cell">Área</th><th>Estado</th><th class="d-none d-lg-table-cell">Creador</th><th class="d-none d-lg-table-cell">Fecha</th></tr></thead><tbody>';
        for (var i = 0; i < lista.length; i++) {
            var d = lista[i];
            var fecha = d.fechaEmision || (d.fechaCreacion ? d.fechaCreacion.split('T')[0] : '-');
            var tieneFirma = JTHService.getFirma(d.id);
            var badgeClass = tieneFirma ? 'bg-success' : 'bg-warning';
            var badgeText = tieneFirma ? 'Firmado' : 'Pendiente';
            var btnText = tieneFirma ? 'Ver Firma' : 'Firmar Documento';
            var accionFirma = tieneFirma
                ? '<li><button class="dropdown-item" onclick="JTHController.verFirma(' + d.id + ')"><i class="fas fa-signature me-2 text-success"></i>Ver Firma</button></li>'
                : '<li><button class="dropdown-item" onclick="JTHController.firmar(' + d.id + ')"><i class="fas fa-signature me-2 text-warning"></i>' + btnText + '</button></li>';
            var reportes = d.estado === 'ACTIVO'
                ? '<li><button class="dropdown-item" onclick="generarVersionCorta(' + d.id + ')"><i class="fas fa-file-pdf me-2 text-success"></i>Versión Corta</button></li>' +
                  '<li><button class="dropdown-item" onclick="generarVersionExtensa(' + d.id + ')"><i class="fas fa-file-pdf me-2 text-secondary"></i>Versión Extensa</button></li>'
                : '';
            
            html += '<tr>' +
                '<td><div class="dropdown"><button class="btn btn-sm btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></button>' +
                '<ul class="dropdown-menu dropdown-menu-end" style="z-index: 2100;">' + accionFirma +
                '<li><button class="dropdown-item" onclick="JTHController.verAuditoriaCompleta(' + d.id + ')"><i class="fas fa-list me-2 text-primary"></i>Auditoría completa</button></li>' +
                '<li><button class="dropdown-item" onclick="JTHController.verMisAcciones(' + d.id + ')"><i class="fas fa-user-clock me-2 text-secondary"></i>Mis acciones</button></li>' +
                reportes + '</ul></div></td>' +
                '<td><strong>' + (d.codigo || 'DES-' + d.id) + '</strong></td>' +
                '<td>' + (d.puesto || 'Sin título') + '</td>' +
                '<td class="d-none d-md-table-cell">' + (d.area || 'N/A') + '</td>' +
                '<td><span class="badge ' + badgeClass + '">' + badgeText + '</span></td>' +
                '<td class="d-none d-lg-table-cell">' + (d.creador || 'N/A') + '</td>' +
                '<td class="d-none d-lg-table-cell">' + fecha + '</td>' +
                '</tr>';
        }
        html += '</tbody></table></div>';
        $('#pendientesContainer').html(html);
        $('#firmadosContainer').empty();
        if (typeof actualizarContador === 'function') {
            actualizarContador();
        }
    },
    
    cargarFirmados: function() {
        $('#firmadosContainer').empty();
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
                html += '<div class="border-bottom py-2"><strong>' + (eventos[i].accion || 'Evento') + '</strong><br><small class="text-muted">' + new Date(eventos[i].fecha).toLocaleString() + ' | ' + (eventos[i].usuario || 'Sistema') + ' - ' + (eventos[i].rol || '') + '</small></div>';
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
            Swal.fire('Sin firma', 'No se encontró una firma digital para este descriptor.', 'info');
            return;
        }
        
        var modalHtml = '<div class="text-center">' +
            '<div class="alert alert-info text-start"><strong>Descriptor:</strong> ' + (descriptor.codigo || 'DES-' + id) + '<br><strong>Puesto:</strong> ' + (descriptor.puesto || '-') + '<br><strong>Fecha de firma:</strong> ' + (descriptor.fechaFirmaJTH ? new Date(descriptor.fechaFirmaJTH).toLocaleString() : '-') + '</div>' +
            '<div class="border rounded mx-auto p-3 bg-white" style="max-width: 430px;"><img src="' + firma + '" alt="Firma JTH" style="max-width:100%; max-height:220px;"></div>' +
            '<button id="descargarFirmaJTH" class="btn btn-info btn-sm mt-3"><i class="fas fa-download"></i> Descargar Firma</button>' +
            '</div>';
        
        Swal.fire({
            title: 'Firma Digital - Jefe de Talento Humano',
            html: modalHtml,
            width: '520px',
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#0d6efd',
            didOpen: function() {
                $('#descargarFirmaJTH').click(function() {
                    var link = document.createElement('a');
                    link.download = 'firma_jth_' + id + '.png';
                    link.href = firma;
                    link.click();
                });
            }
        });
    },
    
    firmar: function(id) {
        var descriptor = JTHService.getById(id);
        if (!descriptor) return;
        
        var firmaExistente = JTHService.getFirma(id);
        
        var modalHtml = '<div class="text-center">' +
            '<p class="mb-2">Firme en el recuadro con el mouse o dedo:</p>' +
            '<div id="signature-pad" class="border rounded mx-auto" style="width: 400px; height: 200px; background: white; border: 2px solid #ccc;">' +
            '<canvas id="firmaCanvas" width="400" height="200" style="width:100%;height:100%;"></canvas>' +
            '</div>' +
            '<div class="mt-3">' +
            '<button id="limpiarFirma" class="btn btn-secondary btn-sm mx-1"><i class="fas fa-eraser"></i> Limpiar</button>' +
            '<button id="descargarFirma" class="btn btn-info btn-sm mx-1"><i class="fas fa-download"></i> Descargar</button>' +
            '</div>' +
            '</div>';
        
        Swal.fire({
            title: 'Firma Digital - Jefe de Talento Humano',
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
                    link.download = 'firma_jth_' + id + '.png';
                    link.href = dataURL;
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
                JTHService.guardarFirma(id, result.value);
                DescriptorService.registrarEvento(id, {
                    accion: 'FIRMA DEL JEFE DE TALENTO HUMANO',
                    usuario: JTHController.currentUser.nombre,
                    rol: JTHController.currentUser.rolNombre,
                    estado: 'FIRMADO_JTH'
                });
                Swal.fire('Firmado', 'Descriptor firmado exitosamente', 'success').then(function() {
                    JTHController.cargarPendientes();
                    JTHController.cargarFirmados();
                });
            }
        });
    }
};

window.JTHController = JTHController;