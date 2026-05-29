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
        }).fail(function() {
            $('#contentContainer').html('<div class="alert alert-danger">Error al cargar la vista de firmas CT</div>');
        });
    },
    
    cargarPendientes: function() {
        var pendientes = CTService.getPendientesFirma(this.currentUser.nombre);
        
        if (pendientes.length === 0) {
            $('#pendientesContainer').html('<div class="alert alert-info text-center"><i class="fas fa-inbox fa-3x mb-3 d-block"></i><h5>No hay descriptores pendientes de su firma</h5></div>');
            return;
        }
        
        var html = '<div class="row">';
        for (var i = 0; i < pendientes.length; i++) {
            var d = pendientes[i];
            var fecha = d.fechaEmision || (d.fechaCreacion ? d.fechaCreacion.split('T')[0] : '-');
            var tieneFirma = CTService.getFirma(d.id);
            html += '<div class="col-12 col-md-6 col-lg-4 mb-3"><div class="card h-100">' +
                '<div class="card-header bg-primary text-white"><div class="d-flex justify-content-between"><span class="fw-bold">' + (d.codigo || 'DES-' + d.id) + '</span><span class="badge ' + (tieneFirma ? 'bg-success' : 'bg-warning') + '">' + (tieneFirma ? 'Firmado' : 'Pendiente') + '</span></div></div>' +
                '<div class="card-body"><h5 class="card-title">' + (d.puesto || 'Sin título') + '</h5>' +
                '<p class="card-text text-muted small"><i class="fas fa-building"></i> ' + (d.area || 'N/A') + '<br><i class="fas fa-calendar"></i> Fecha: ' + fecha + '</p></div>' +
                '<div class="card-footer bg-white"><button class="btn btn-sm ' + (tieneFirma ? 'btn-success' : 'btn-warning') + ' w-100" onclick="CTController.firmar(' + d.id + ')"><i class="fas fa-signature"></i> ' + (tieneFirma ? 'Ver Firma' : 'Firmar Documento') + '</button></div></div></div>';
        }
        html += '</div>';
        $('#pendientesContainer').html(html);
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
                Swal.fire('Firmado', 'Descriptor firmado exitosamente', 'success');
                CTController.cargarPendientes();
            }
        });
    }
};

window.CTController = CTController;