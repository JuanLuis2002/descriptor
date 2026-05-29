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
            console.log('Vista de firmas JTH cargada correctamente');
            self.cargarPendientes();
        }).fail(function() {
            $('#contentContainer').html(`
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Error al cargar la vista de firmas JTH.
                </div>
            `);
        });
    },
    
    cargarPendientes: function() {
        var pendientes = JTHService.getPendientesFirma();
        
        if (pendientes.length === 0) {
            $('#pendientesContainer').html(`
                <div class="alert alert-info text-center">
                    <i class="fas fa-inbox fa-3x mb-3 d-block"></i>
                    <h5>No hay descriptores pendientes de firma</h5>
                    <p>Cuando un descriptor sea aprobado por TH, aparecerá aquí.</p>
                </div>
            `);
            return;
        }
        
        var html = '<div class="row">';
        for (var i = 0; i < pendientes.length; i++) {
            var d = pendientes[i];
            var fecha = d.fechaEmision || (d.fechaCreacion ? d.fechaCreacion.split('T')[0] : '-');
            var tieneFirma = JTHService.getFirma(d.id) ? true : false;
            html += `
                <div class="col-12 col-md-6 col-lg-4 mb-3">
                    <div class="card h-100">
                        <div class="card-header bg-primary text-white">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="fw-bold">${d.codigo || 'DES-' + d.id}</span>
                                <span class="badge ${tieneFirma ? 'bg-success' : 'bg-warning'}">${tieneFirma ? 'Firmado' : 'Pendiente'}</span>
                            </div>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">${d.puesto || 'Sin título'}</h5>
                            <p class="card-text text-muted small">
                                <i class="fas fa-building"></i> ${d.area || 'N/A'}<br>
                                <i class="fas fa-user"></i> Creador: ${d.creador || 'N/A'}<br>
                                <i class="fas fa-calendar"></i> Fecha: ${fecha}
                            </p>
                        </div>
                        <div class="card-footer bg-white">
                            <button class="btn btn-sm ${tieneFirma ? 'btn-success' : 'btn-warning'} w-100" onclick="JTHController.firmar(${d.id})">
                                <i class="fas fa-signature"></i> ${tieneFirma ? 'Ver Firma' : 'Firmar Descriptor'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        html += '</div>';
        $('#pendientesContainer').html(html);
    },
    
    firmar: function(id) {
        var descriptor = JTHService.getById(id);
        if (!descriptor) return;
        
        var firmaExistente = JTHService.getFirma(id);
        
        var modalHtml = `
            <div class="text-center">
                <div id="signature-pad" class="signature-pad border rounded mx-auto" style="width: 400px; height: 200px; border: 2px solid #ccc;">
                    <canvas id="firmaCanvas" width="400" height="200" style="width: 100%; height: 100%;"></canvas>
                </div>
                <div class="mt-3">
                    <button id="limpiarFirma" class="btn btn-secondary btn-sm"><i class="fas fa-eraser"></i> Limpiar</button>
                    <button id="descargarFirma" class="btn btn-info btn-sm"><i class="fas fa-download"></i> Descargar Firma</button>
                </div>
            </div>
        `;
        
        Swal.fire({
            title: `Firma Digital - Jefe de TH`,
            html: modalHtml,
            width: '500px',
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-save"></i> Guardar Firma',
            cancelButtonText: 'Cancelar',
            didOpen: function() {
                var canvas = document.getElementById('firmaCanvas');
                var signaturePad = new SignaturePad(canvas);
                
                // Si ya existe una firma, cargarla
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
                var firmaDataURL = window.currentSignaturePad.toDataURL('image/png');
                return firmaDataURL;
            }
        }).then(function(result) {
            if (result.isConfirmed && result.value) {
                JTHService.guardarFirma(id, result.value);
                Swal.fire('Firmado', 'Descriptor firmado exitosamente', 'success');
                JTHController.cargarPendientes();
            }
        });
    }
};

window.JTHController = JTHController;