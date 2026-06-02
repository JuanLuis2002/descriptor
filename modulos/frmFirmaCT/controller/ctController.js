// Controlador de Firmas - Colaborador / Titular
var CTController = {
    currentUser: null,
    
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
        
        if (pendientes.length === 0) {
            $('#pendientesContainer').html('<div class="alert alert-info text-center"><i class="fas fa-inbox fa-3x mb-3 d-block"></i><h5>No hay descriptores pendientes de su firma</h5><p>Cuando el Jefe de TH firme un descriptor, aparecerá aquí para que usted firme como titular.</p></div>');
            if (typeof actualizarContador === 'function') {
                actualizarContador();
            }
            return;
        }
        
        var html = '<div class="row">';
        for (var i = 0; i < pendientes.length; i++) {
            var d = pendientes[i];
            var fecha = d.fechaEmision || (d.fechaCreacion ? d.fechaCreacion.split('T')[0] : '-');
            
            html += '<div class="col-12 col-md-6 col-lg-4 mb-3"><div class="card h-100">' +
                '<div class="card-header bg-primary text-white"><div class="d-flex justify-content-between"><span class="fw-bold">' + (d.codigo || 'DES-' + d.id) + '</span><span class="badge bg-warning text-dark">Pendiente</span></div></div>' +
                '<div class="card-body"><h5 class="card-title">' + (d.puesto || 'Sin título') + '</h5>' +
                '<p class="card-text text-muted small"><i class="fas fa-building"></i> ' + (d.area || 'N/A') + '<br><i class="fas fa-calendar"></i> Fecha: ' + fecha + '<br><i class="fas fa-user"></i> Titular: ' + (d.titular || 'No asignado') + '</p></div>' +
                '<div class="card-footer bg-white"><button class="btn btn-sm btn-warning w-100" onclick="CTController.firmar(' + d.id + ')"><i class="fas fa-signature"></i> Firmar Documento</button></div></div></div>';
        }
        html += '</div>';
        $('#pendientesContainer').html(html);
        if (typeof actualizarContador === 'function') {
            actualizarContador();
        }
    },
    
    cargarFirmados: function() {
        var firmados = CTService.getFirmados(this.currentUser.nombre);
        
        if (firmados.length === 0) {
            $('#firmadosContainer').html('<div class="alert alert-info text-center">Aún no ha firmado descriptores.</div>');
            return;
        }
        
        var html = '<div class="row">';
        for (var i = 0; i < firmados.length; i++) {
            var d = firmados[i];
            var fechaFirma = d.fechaFirmaCT ? new Date(d.fechaFirmaCT).toLocaleString() : '-';
            html += '<div class="col-12 col-md-6 col-lg-4 mb-3"><div class="card h-100">' +
                '<div class="card-header bg-success text-white"><div class="d-flex justify-content-between"><span class="fw-bold">' + (d.codigo || 'DES-' + d.id) + '</span><span class="badge bg-light text-success">Firmado</span></div></div>' +
                '<div class="card-body"><h5 class="card-title">' + (d.puesto || 'Sin título') + '</h5>' +
                '<p class="card-text text-muted small"><i class="fas fa-building"></i> ' + (d.area || 'N/A') + '<br><i class="fas fa-calendar-check"></i> Firma: ' + fechaFirma + '<br><i class="fas fa-info-circle"></i> Estado actual: ' + (d.estado || '-') + '</p></div>' +
                '<div class="card-footer bg-white"><button class="btn btn-sm btn-success w-100" onclick="CTController.verFirma(' + d.id + ')"><i class="fas fa-signature"></i> Ver Firma</button></div></div></div>';
        }
        html += '</div>';
        $('#firmadosContainer').html(html);
    },
    
    verFirma: function(id) {
        var descriptor = CTService.getById(id);
        if (!descriptor) return;
        
        var firma = CTService.getFirma(id) || descriptor.firmaCT;
        if (!firma) {
            Swal.fire('Sin firma', 'No se encontró una firma digital para este descriptor.', 'info');
            return;
        }
        
        var modalHtml = '<div class="text-center">' +
            '<div class="alert alert-info text-start"><strong>Descriptor:</strong> ' + (descriptor.codigo || 'DES-' + id) + '<br><strong>Puesto:</strong> ' + (descriptor.puesto || '-') + '<br><strong>Fecha de firma:</strong> ' + (descriptor.fechaFirmaCT ? new Date(descriptor.fechaFirmaCT).toLocaleString() : '-') + '</div>' +
            '<div class="border rounded mx-auto p-3 bg-white" style="max-width: 430px;"><img src="' + firma + '" alt="Firma CT" style="max-width:100%; max-height:220px;"></div>' +
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
                DescriptorService.registrarEvento(id, {
                    accion: 'FIRMA DEL COLABORADOR/TITULAR',
                    usuario: CTController.currentUser.nombre,
                    rol: CTController.currentUser.rolNombre,
                    estado: 'FIRMADO_CT'
                });
                Swal.fire('Firmado', 'Descriptor firmado exitosamente', 'success').then(function() {
                    CTController.cargarPendientes();
                    CTController.cargarFirmados();
                });
            }
        });
    }
};

window.CTController = CTController;