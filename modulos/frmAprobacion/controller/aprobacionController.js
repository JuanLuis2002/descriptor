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
            $('#contentContainer').html(`
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Error al cargar la vista de aprobación.<br>
                    Verifique: <strong>modulos/frmAprobacion/view/aprobacionView.html</strong>
                </div>
            `);
        });
    },
    
    cargarPendientes: function() {
        var pendientes = AprobacionService.getPendientesAprobacion();
        
        if (pendientes.length === 0) {
            $('#pendientesContainer').html(`
                <div class="alert alert-info text-center">
                    <i class="fas fa-inbox fa-3x mb-3 d-block"></i>
                    <h5>No hay descriptores pendientes de aprobación</h5>
                    <p>Cuando un Jefe Inmediato envíe un descriptor, aparecerá aquí.</p>
                </div>
            `);
            return;
        }
        
        var html = '<div class="row">';
        for (var i = 0; i < pendientes.length; i++) {
            var d = pendientes[i];
            var fecha = d.fechaEmision || (d.fechaCreacion ? d.fechaCreacion.split('T')[0] : '-');
            html += `
                <div class="col-12 col-md-6 col-lg-4 mb-3">
                    <div class="card h-100">
                        <div class="card-header bg-warning text-dark">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="fw-bold">${d.codigo || 'DES-' + d.id}</span>
                                <span class="badge bg-warning text-dark">Pendiente</span>
                            </div>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">${d.puesto || 'Sin título'}</h5>
                            <p class="card-text text-muted small">
                                <i class="fas fa-building"></i> ${d.area || 'N/A'}<br>
                                <i class="fas fa-user"></i> Creador: ${d.creador || 'N/A'}<br>
                                <i class="fas fa-calendar"></i> Fecha: ${fecha}<br>
                                <i class="fas fa-chart-line"></i> Reporta a: ${d.reportaA || 'N/A'}
                            </p>
                        </div>
                        <div class="card-footer bg-white">
                            <button class="btn btn-sm btn-info w-100" onclick="AprobacionController.verDetalle(${d.id})">
                                <i class="fas fa-eye"></i> Revisar Descriptor
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        html += '</div>';
        $('#pendientesContainer').html(html);
    },
    
    verDetalle: function(id) {
        var self = this;
        var descriptor = AprobacionService.getDetalle(id);
        if (!descriptor) return;
        
        var isAprobado = AprobacionService.isAprobadoPendienteEnvio(id);
        
        var funcionesHtml = '';
        if (descriptor.funcionesClaves && descriptor.funcionesClaves.length > 0) {
            funcionesHtml = '<ul class="mb-0">';
            for (var i = 0; i < descriptor.funcionesClaves.length; i++) {
                funcionesHtml += '<li><strong>' + (descriptor.funcionesClaves[i].codigo || '') + '</strong> - ' + (descriptor.funcionesClaves[i].nombre || '') + '</li>';
            }
            funcionesHtml += '</ul>';
        } else {
            funcionesHtml = '<p class="text-muted">No registradas</p>';
        }
        
        var actividadesHtml = '';
        if (descriptor.actividadesPorFuncion && descriptor.actividadesPorFuncion.length > 0) {
            for (var i = 0; i < descriptor.actividadesPorFuncion.length; i++) {
                var func = descriptor.actividadesPorFuncion[i];
                actividadesHtml += '<div class="mb-2"><strong>' + (func.funcionNombre || 'Función ' + (i+1)) + ':</strong><ul>';
                if (func.actividades && func.actividades.length > 0) {
                    for (var j = 0; j < func.actividades.length; j++) {
                        actividadesHtml += '<li>' + func.actividades[j] + '</li>';
                    }
                } else {
                    actividadesHtml += '<li class="text-muted">No hay actividades registradas</li>';
                }
                actividadesHtml += '</ul></div>';
            }
        } else {
            actividadesHtml = '<p class="text-muted">No hay actividades registradas</p>';
        }
        
        var kpisHtml = '';
        if (descriptor.kpis && descriptor.kpis.length > 0) {
            kpisHtml = '<table class="table table-sm"><thead><tr><th>Indicador</th><th>Frecuencia</th><th>Meta</th></tr></thead><tbody>';
            for (var i = 0; i < descriptor.kpis.length; i++) {
                kpisHtml += '<tr>' +
                    '<td>' + (descriptor.kpis[i].indicador || '-') + '</td>' +
                    '<td>' + (descriptor.kpis[i].frecuencia || '-') + '</td>' +
                    '<td>' + (descriptor.kpis[i].meta || '-') + '</td>' +
                    '</tr>';
            }
            kpisHtml += '</tbody></table>';
        } else {
            kpisHtml = '<p class="text-muted">No hay KPIs registrados</p>';
        }
        
        var perfilHtml = '';
        if (descriptor.perfil) {
            perfilHtml = '<table class="table table-sm"><tr><th>Edad:</th><td>' + (descriptor.perfil.edadMin || '-') + ' - ' + (descriptor.perfil.edadMax || '-') + ' años</td><th>Sexo:</th><td>' + (descriptor.perfil.sexo || '-') + '</td></tr>' +
                '<tr><th>Estado Familiar:</th><td>' + (descriptor.perfil.estadoFamiliar || '-') + '</td><th>Disponibilidad:</th><td>' + (descriptor.perfil.disponibilidadHorario || '-') + 'NonNulloNonNull' +
                '<tr><th>Modalidad:</th><td>' + (descriptor.perfil.modalidadTrabajo || '-') + 'NonNulloNonNull<th>Licencia:</th><td>' + (descriptor.perfil.poseerLicencia == '1' ? 'Sí' : 'No') + 'NonNulloNonNull' +
                '</tr></table>';
        } else {
            perfilHtml = '<p class="text-muted">No hay perfil registrado</p>';
        }
        
        var modalHtml = `
            <div class="text-start" style="max-height: 500px; overflow-y: auto;">
                <h6 class="border-bottom pb-2">Información General</h6>
                <p><strong>Código:</strong> ${descriptor.codigo || 'DES-' + id}</p>
                <p><strong>Puesto:</strong> ${descriptor.puesto || '-'}</p>
                <p><strong>Área:</strong> ${descriptor.area || '-'}</p>
                <p><strong>Reporta a:</strong> ${descriptor.reportaA || '-'}</p>
                <p><strong>Creador:</strong> ${descriptor.creador || '-'}</p>
                <p><strong>Fecha de Emisión:</strong> ${descriptor.fechaEmision || '-'}</p>
                <hr>
                <h6 class="border-bottom pb-2">Objetivo del Puesto</h6>
                <p>${descriptor.objetivo || '-'}</p>
                <hr>
                <h6 class="border-bottom pb-2">Funciones Claves</h6>
                ${funcionesHtml}
                <hr>
                <h6 class="border-bottom pb-2">Actividades por Función</h6>
                ${actividadesHtml}
                <hr>
                <h6 class="border-bottom pb-2">Funciones Secundarias</h6>
                <ul>${(descriptor.funcionesSecundarias || []).map(function(f) { return '<li>' + f + '</li>'; }).join('') || '<li class="text-muted">No registradas</li>'}</ul>
                <hr>
                <h6 class="border-bottom pb-2">Indicadores de Desempeño (KPIs)</h6>
                ${kpisHtml}
                <hr>
                <h6 class="border-bottom pb-2">Perfil del Puesto</h6>
                ${perfilHtml}
                <hr>
                <h6 class="border-bottom pb-2">Responsabilidades a Cargo</h6>
                <p><strong>De equipo:</strong> ${descriptor.responsabilidades?.equipo || '-'}</p>
                <p><strong>De fondos:</strong> ${descriptor.responsabilidades?.fondos || '-'}</p>
                <p><strong>De documentos:</strong> ${descriptor.responsabilidades?.documentos || '-'}</p>
                <p><strong>Toma de decisiones:</strong> ${descriptor.responsabilidades?.tomaDecisiones || '-'}</p>
                <p><strong>De personal:</strong> ${descriptor.responsabilidades?.personal || '-'}</p>
                <p><strong>Impacto económico:</strong> ${descriptor.responsabilidades?.impactoEconomico || '-'}</p>
                <hr>
                <h6 class="border-bottom pb-2">Entrenamiento</h6>
                <p><strong>Personal a cargo:</strong> ${descriptor.entrenamiento?.personalCargo || '0'}</p>
                <p><strong>Tipo:</strong> ${descriptor.entrenamiento?.tipoEntrenamiento || '-'}</p>
                <p><strong>Duración:</strong> ${descriptor.entrenamiento?.duracion || '-'}</p>
                <p><strong>Responsables:</strong> ${descriptor.entrenamiento?.puestosResponsables || '-'}</p>
            </div>
        `;
        
        var confirmButtonText = '<i class="fas fa-check"></i> Aprobar';
        var denyButtonText = '<i class="fas fa-times"></i> Observar';
        var confirmButtonColor = '#198754';
        var denyButtonColor = '#ffc107';
        
        if (isAprobado) {
            confirmButtonText = '<i class="fas fa-paper-plane"></i> Enviar a TH';
            denyButtonText = '<i class="fas fa-undo"></i> Volver';
            confirmButtonColor = '#0d6efd';
            denyButtonColor = '#6c757d';
        }
        
        Swal.fire({
            title: `Revisar Descriptor: ${descriptor.puesto}`,
            html: modalHtml,
            width: '700px',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: confirmButtonText,
            denyButtonText: denyButtonText,
            cancelButtonText: 'Cancelar',
            confirmButtonColor: confirmButtonColor,
            denyButtonColor: denyButtonColor,
            cancelButtonColor: '#6c757d',
            preConfirm: function() {
                if (isAprobado) {
                    return Swal.fire({
                        title: 'Enviar a Talento Humano',
                        text: '¿Está seguro de enviar este descriptor a Talento Humano para revisión técnica?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Sí, enviar',
                        cancelButtonText: 'Cancelar'
                    }).then(function(result) {
                        if (result.isConfirmed) {
                            AprobacionService.enviarATH(id);
                            var currentUserGlobal = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
                            DescriptorService.registrarEvento(id, {
                                accion: 'ENVÍO A TALENTO HUMANO (DESDE JF)',
                                usuario: currentUserGlobal.nombre,
                                rol: currentUserGlobal.rolNombre,
                                estado: 'ENVIADO_TH'
                            });
                            Swal.fire('Enviado', 'Descriptor enviado a Talento Humano', 'success');
                            location.reload();
                        }
                        return false;
                    });
                } else {
                    return Swal.fire({
                        title: 'Aprobar Descriptor',
                        text: '¿Está seguro de aprobar este descriptor?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Sí, aprobar',
                        cancelButtonText: 'Cancelar'
                    }).then(function(result) {
                        if (result.isConfirmed) {
                            AprobacionService.aprobar(id, 'Aprobado por Jefe Superior');
                            var currentUserGlobal = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
                            DescriptorService.registrarEvento(id, {
                                accion: 'APROBACIÓN POR JEFE SUPERIOR',
                                usuario: currentUserGlobal.nombre,
                                rol: currentUserGlobal.rolNombre,
                                estado: 'APROBADO_POR_JF'
                            });
                            Swal.fire('Aprobado', 'Descriptor aprobado. Ahora puede enviarlo a Talento Humano.', 'success');
                            location.reload();
                        }
                        return false;
                    });
                }
            },
            preDeny: function() {
                if (isAprobado) {
                    return Swal.fire({
                        title: 'Volver a pendiente',
                        text: '¿Desea devolver este descriptor a estado pendiente?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Sí, devolver',
                        cancelButtonText: 'Cancelar'
                    }).then(function(result) {
                        if (result.isConfirmed) {
                            DescriptorService.update(id, { estado: 'ENVIADO_JF' });
                            var currentUserGlobal = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
                            DescriptorService.registrarEvento(id, {
                                accion: 'DEVOLUCIÓN A PENDIENTE',
                                usuario: currentUserGlobal.nombre,
                                rol: currentUserGlobal.rolNombre,
                                estado: 'ENVIADO_JF'
                            });
                            Swal.fire('Devuelto', 'Descriptor vuelve a estado pendiente', 'info');
                            location.reload();
                        }
                        return false;
                    });
                } else {
                    return Swal.fire({
                        title: 'Observaciones',
                        html: '<textarea id="observaciones" class="swal2-textarea" placeholder="Escriba aquí las observaciones o correcciones necesarias..." rows="4"></textarea>',
                        showCancelButton: true,
                        confirmButtonText: 'Enviar observaciones',
                        cancelButtonText: 'Cancelar',
                        preConfirm: function() {
                            var obs = document.getElementById('observaciones').value;
                            if (!obs || obs.trim() === '') {
                                Swal.showValidationMessage('Debe ingresar observaciones');
                                return false;
                            }
                            return obs;
                        }
                    }).then(function(result) {
                        if (result.isConfirmed && result.value) {
                            AprobacionService.observar(id, result.value);
                            var currentUserGlobal = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
                            DescriptorService.registrarEvento(id, {
                                accion: 'OBSERVACIÓN POR JEFE SUPERIOR',
                                usuario: currentUserGlobal.nombre,
                                rol: currentUserGlobal.rolNombre,
                                estado: 'OBSERVADO',
                                observacion: result.value
                            });
                            Swal.fire('Observado', 'Descriptor devuelto al Jefe Inmediato con observaciones', 'warning');
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