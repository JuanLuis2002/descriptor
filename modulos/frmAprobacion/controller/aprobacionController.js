// Controlador de Aprobación
var AprobacionController = {
    currentUser: null,
    
    init: function(user) {
        this.currentUser = user;
        console.log('AprobacionController iniciado para:', user.nombre);
        this.loadView();
    },
    
    loadView: function() {
        var self = this;
        $('#contentContainer').empty();
        $.get('modulos/frmAprobacion/view/aprobacionView.html', function(html) {
            $('#contentContainer').html(html);
            console.log('Vista de aprobación cargada correctamente');
            self.cargarPendientes();
        }).fail(function() {
            $('#contentContainer').html('<div class="alert alert-danger">Error al cargar la vista de aprobación.</div>');
        });
    },
    
    cargarPendientes: function() {
        var pendientes = AprobacionService.getPendientesAprobacion();
        
        if (pendientes.length === 0) {
            $('#pendientesContainer').html('<div class="alert alert-info text-center"><i class="fas fa-inbox fa-3x mb-3 d-block"></i><h5>No hay descriptores pendientes de aprobación</h5></div>');
            return;
        }
        
        var html = '<div class="row">';
        for (var i = 0; i < pendientes.length; i++) {
            var d = pendientes[i];
            var fecha = d.fechaEmision || (d.fechaCreacion ? d.fechaCreacion.split('T')[0] : '-');
            html += '<div class="col-12 col-md-6 col-lg-4 mb-3"><div class="card h-100">' +
                '<div class="card-header bg-warning text-dark"><div class="d-flex justify-content-between"><span class="fw-bold">' + (d.codigo || 'DES-' + d.id) + '</span><span class="badge bg-warning">Pendiente</span></div></div>' +
                '<div class="card-body"><h5 class="card-title">' + (d.puesto || 'Sin título') + '</h5>' +
                '<p class="card-text text-muted small"><i class="fas fa-building"></i> ' + (d.area || 'N/A') + '<br><i class="fas fa-user"></i> Creador: ' + (d.creador || 'N/A') + '<br><i class="fas fa-calendar"></i> Fecha: ' + fecha + '<br><i class="fas fa-chart-line"></i> Reporta a: ' + (d.reportaA || 'N/A') + '</p></div>' +
                '<div class="card-footer bg-white"><button class="btn btn-sm btn-info w-100" onclick="AprobacionController.verDetalle(' + d.id + ')"><i class="fas fa-eye"></i> Revisar Descriptor</button></div></div></div>';
        }
        html += '</div>';
        $('#pendientesContainer').html(html);
    },
    
    verDetalle: function(id) {
        var descriptor = AprobacionService.getDetalle(id);
        if (!descriptor) return;
        
        var isAprobado = AprobacionService.isAprobadoPendienteEnvio(id);
        
        var funcionesHtml = '<ul>' + (descriptor.funcionesClaves || []).map(function(f) { return '<li><strong>' + (f.codigo || '') + '</strong> - ' + (f.nombre || '') + '</li>'; }).join('') + '</ul>';
        
        var actividadesHtml = '';
        if (descriptor.actividadesPorFuncion) {
            for (var i = 0; i < descriptor.actividadesPorFuncion.length; i++) {
                var func = descriptor.actividadesPorFuncion[i];
                actividadesHtml += '<div class="mb-2"><strong>' + (func.funcionNombre || 'Función ' + (i+1)) + ':</strong><ul>';
                if (func.actividades) {
                    for (var j = 0; j < func.actividades.length; j++) {
                        actividadesHtml += '<li>' + func.actividades[j] + '</li>';
                    }
                }
                actividadesHtml += '</ul></div>';
            }
        }
        
        var kpisHtml = '<table class="table table-sm"><thead><tr><th>Indicador</th><th>Frecuencia</th><th>Meta</th></tr></thead><tbody>';
        if (descriptor.kpis) {
            for (var i = 0; i < descriptor.kpis.length; i++) {
                kpisHtml += '<td>' + (descriptor.kpis[i].indicador || '-') + '</td><td>' + (descriptor.kpis[i].frecuencia || '-') + 'NonNulloNonNull' + (descriptor.kpis[i].meta || '-') + 'NonNulloNonNull' + '';
            }
        }
        kpisHtml += '</tbody></table>';
        
        var perfilHtml = '<table class="table table-sm">' +
            '<tr><th>Edad:</th><td>' + (descriptor.perfil?.edadMin || '-') + ' - ' + (descriptor.perfil?.edadMax || '-') + ' años</td><th>Sexo:</th><td>' + (descriptor.perfil?.sexo || '-') + 'NonNulloNonNull' +
            '<tr><th>Estado Familiar:</th><td>' + (descriptor.perfil?.estadoFamiliar || '-') + 'NonNulloNonNull<th>Disponibilidad:</th><td>' + (descriptor.perfil?.disponibilidadHorario || '-') + 'NonNulloNonNull' +
            '<tr><th>Modalidad:</th><td>' + (descriptor.perfil?.modalidadTrabajo || '-') + 'NonNulloNonNull<th>Licencia:</th><td>' + (descriptor.perfil?.poseerLicencia == '1' ? 'Sí' : 'No') + 'NonNulloNonNull' +
            '</table>';
        
        var modalHtml = '<div class="text-start" style="max-height: 500px; overflow-y: auto;">' +
            '<h6 class="border-bottom pb-2">Información General</h6>' +
            '<p><strong>Código:</strong> ' + (descriptor.codigo || 'DES-' + id) + '</p>' +
            '<p><strong>Puesto:</strong> ' + (descriptor.puesto || '-') + '</p>' +
            '<p><strong>Área:</strong> ' + (descriptor.area || '-') + '</p>' +
            '<p><strong>Reporta a:</strong> ' + (descriptor.reportaA || '-') + '</p>' +
            '<p><strong>Creador:</strong> ' + (descriptor.creador || '-') + '</p>' +
            '<p><strong>Fecha de Emisión:</strong> ' + (descriptor.fechaEmision || '-') + '</p><hr>' +
            '<h6 class="border-bottom pb-2">Objetivo</h6><p>' + (descriptor.objetivo || '-') + '</p><hr>' +
            '<h6 class="border-bottom pb-2">Funciones Claves</h6>' + funcionesHtml + '<hr>' +
            '<h6 class="border-bottom pb-2">Actividades</h6>' + actividadesHtml + '<hr>' +
            '<h6 class="border-bottom pb-2">Indicadores (KPIs)</h6>' + kpisHtml + '<hr>' +
            '<h6 class="border-bottom pb-2">Perfil del Puesto</h6>' + perfilHtml + '<hr>' +
            '<h6 class="border-bottom pb-2">Responsabilidades</h6>' +
            '<p><strong>De equipo:</strong> ' + (descriptor.responsabilidades?.equipo || '-') + '</p>' +
            '<p><strong>Impacto económico:</strong> ' + (descriptor.responsabilidades?.impactoEconomico || '-') + '</p><hr>' +
            '<h6 class="border-bottom pb-2">Entrenamiento</h6>' +
            '<p><strong>Personal a cargo:</strong> ' + (descriptor.entrenamiento?.personalCargo || '0') + '</p>' +
            '<p><strong>Duración:</strong> ' + (descriptor.entrenamiento?.duracion || '-') + '</p>' +
            '</div>';
        
        var confirmButtonText = isAprobado ? '<i class="fas fa-paper-plane"></i> Enviar a TH' : '<i class="fas fa-check"></i> Aprobar';
        var denyButtonText = isAprobado ? '<i class="fas fa-undo"></i> Volver' : '<i class="fas fa-times"></i> Observar';
        var confirmButtonColor = isAprobado ? '#0d6efd' : '#198754';
        var denyButtonColor = isAprobado ? '#6c757d' : '#ffc107';
        
        Swal.fire({
            title: 'Revisar Descriptor: ' + descriptor.puesto,
            html: modalHtml,
            width: '700px',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: confirmButtonText,
            denyButtonText: denyButtonText,
            cancelButtonText: 'Cancelar',
            confirmButtonColor: confirmButtonColor,
            denyButtonColor: denyButtonColor,
            preConfirm: function() {
                if (isAprobado) {
                    return Swal.fire({ title: 'Enviar a Talento Humano', text: '¿Está seguro de enviar este descriptor a Talento Humano?', icon: 'question', showCancelButton: true, confirmButtonText: 'Sí' })
                        .then(function(result) {
                            if (result.isConfirmed) {
                                AprobacionService.enviarATH(id);
                                DescriptorService.registrarEvento(id, {
                                    accion: 'ENVÍO A TALENTO HUMANO',
                                    usuario: AprobacionController.currentUser.nombre,
                                    rol: AprobacionController.currentUser.rolNombre,
                                    estado: 'ENVIADO_TH'
                                });
                                Swal.fire('Enviado', 'Descriptor enviado a Talento Humano', 'success');
                                location.reload();
                            }
                            return false;
                        });
                } else {
                    return Swal.fire({ title: 'Aprobar Descriptor', text: '¿Está seguro de aprobar este descriptor?', icon: 'question', showCancelButton: true, confirmButtonText: 'Sí' })
                        .then(function(result) {
                            if (result.isConfirmed) {
                                AprobacionService.aprobar(id);
                                DescriptorService.registrarEvento(id, {
                                    accion: 'APROBACIÓN POR JEFE SUPERIOR',
                                    usuario: AprobacionController.currentUser.nombre,
                                    rol: AprobacionController.currentUser.rolNombre,
                                    estado: 'APROBADO_POR_JF'
                                });
                                Swal.fire('Aprobado', 'Descriptor aprobado', 'success');
                                location.reload();
                            }
                            return false;
                        });
                }
            },
            preDeny: function() {
                if (isAprobado) {
                    return Swal.fire({ title: 'Volver a pendiente', text: '¿Desea devolver este descriptor a estado pendiente?', icon: 'question', showCancelButton: true, confirmButtonText: 'Sí' })
                        .then(function(result) {
                            if (result.isConfirmed) {
                                DescriptorService.update(id, { estado: 'ENVIADO_JF' });
                                DescriptorService.registrarEvento(id, {
                                    accion: 'DEVOLUCIÓN A PENDIENTE',
                                    usuario: AprobacionController.currentUser.nombre,
                                    rol: AprobacionController.currentUser.rolNombre,
                                    estado: 'ENVIADO_JF'
                                });
                                Swal.fire('Devuelto', 'Descriptor vuelve a pendiente', 'info');
                                location.reload();
                            }
                            return false;
                        });
                } else {
                    return Swal.fire({
                        title: 'Observaciones',
                        html: '<textarea id="observaciones" class="swal2-textarea" placeholder="Escriba las observaciones..." rows="4"></textarea>',
                        showCancelButton: true,
                        confirmButtonText: 'Enviar',
                        preConfirm: function() {
                            var obs = document.getElementById('observaciones').value;
                            if (!obs || obs.trim() === '') { Swal.showValidationMessage('Debe ingresar observaciones'); return false; }
                            return obs;
                        }
                    }).then(function(result) {
                        if (result.isConfirmed && result.value) {
                            AprobacionService.observar(id, result.value);
                            DescriptorService.registrarEvento(id, {
                                accion: 'OBSERVACIÓN POR JEFE SUPERIOR',
                                usuario: AprobacionController.currentUser.nombre,
                                rol: AprobacionController.currentUser.rolNombre,
                                estado: 'OBSERVADO_JF',
                                observacion: result.value
                            });
                            Swal.fire('Observado', 'Descriptor devuelto con observaciones', 'warning');
                            location.reload();
                        }
                        return false;
                    });
                }
            }
        });
    }
};

window.AprobacionController = AprobacionController;