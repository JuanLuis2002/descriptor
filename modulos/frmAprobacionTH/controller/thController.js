// Controlador de Aprobación TH
var THController = {
    currentUser: null,
    
    init: function(user) {
        this.currentUser = user;
        console.log('THController iniciado para:', user.nombre);
        this.loadView();
    },
    
    loadView: function() {
        var self = this;
        $('#contentContainer').empty();
        $.get('modulos/frmAprobacionTH/view/thView.html', function(html) {
            $('#contentContainer').html(html);
            console.log('Vista de TH cargada correctamente');
            self.cargarPendientes();
        }).fail(function() {
            $('#contentContainer').html('<div class="alert alert-danger">Error al cargar la vista de TH.</div>');
        });
    },
    
    cargarPendientes: function() {
        var pendientes = THService.getPendientesRevision();
        
        if (pendientes.length === 0) {
            $('#pendientesContainer').html('<div class="alert alert-info text-center"><i class="fas fa-inbox fa-3x mb-3 d-block"></i><h5>No hay descriptores pendientes de revisión</h5></div>');
            return;
        }
        
        var html = '<div class="row">';
        for (var i = 0; i < pendientes.length; i++) {
            var d = pendientes[i];
            var fecha = d.fechaEmision || (d.fechaCreacion ? d.fechaCreacion.split('T')[0] : '-');
            html += '<div class="col-12 col-md-6 col-lg-4 mb-3"><div class="card h-100">' +
                '<div class="card-header bg-primary text-white"><div class="d-flex justify-content-between"><span class="fw-bold">' + (d.codigo || 'DES-' + d.id) + '</span><span class="badge bg-warning">Pendiente</span></div></div>' +
                '<div class="card-body"><h5 class="card-title">' + (d.puesto || 'Sin título') + '</h5>' +
                '<p class="card-text text-muted small"><i class="fas fa-building"></i> ' + (d.area || 'N/A') + '<br><i class="fas fa-user"></i> Creador: ' + (d.creador || 'N/A') + '<br><i class="fas fa-calendar"></i> Fecha: ' + fecha + '<br><i class="fas fa-chart-line"></i> Reporta a: ' + (d.reportaA || 'N/A') + '</p></div>' +
                '<div class="card-footer bg-white"><button class="btn btn-sm btn-info w-100" onclick="THController.verDetalle(' + d.id + ')"><i class="fas fa-eye"></i> Revisar</button></div></div></div>';
        }
        html += '</div>';
        $('#pendientesContainer').html(html);
    },
    
    verDetalle: function(id) {
        var descriptor = THService.getById(id);
        if (!descriptor) return;
        
        // Funciones Claves
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
        
        // KPIs - CORREGIDO
        var kpisHtml = '';
        if (descriptor.kpis && descriptor.kpis.length > 0) {
            kpisHtml = '<table class="table table-sm table-bordered">' +
                '<thead class="table-light">' +
                '<tr><th>Indicador</th><th>Frecuencia</th><th>Meta</th></tr>' +
                '</thead><tbody>';
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
        
        // Perfil del Puesto - CORREGIDO
        var perfilHtml = '';
        if (descriptor.perfil) {
            perfilHtml = '<table class="table table-sm">' +
                '<tr><th style="width: 35%;">Edad Mínima:</th><td>' + (descriptor.perfil.edadMin || '-') + ' años</td><th style="width: 35%;">Edad Máxima:</th><td>' + (descriptor.perfil.edadMax || '-') + ' años</td></tr>' +
                '<tr><th>Sexo:</th><td>' + (descriptor.perfil.sexo === 'INDIFERENTE' ? 'Indiferente' : (descriptor.perfil.sexo === 'MASCULINO' ? 'Masculino' : 'Femenino')) + '</td><th>Estado Familiar:</th><td>' + (descriptor.perfil.estadoFamiliar === 'INDIFERENTE' ? 'Indiferente' : (descriptor.perfil.estadoFamiliar || '-')) + '</td></tr>' +
                '<tr><th>Disponibilidad Horaria:</th><td>' + (descriptor.perfil.disponibilidadHorario === 'TIEMPO_COMPLETO' ? 'Tiempo Completo' : (descriptor.perfil.disponibilidadHorario === 'MEDIO_TIEMPO' ? 'Medio Tiempo' : descriptor.perfil.disponibilidadHorario || '-')) + '</td><th>Modalidad de Trabajo:</th><td>' + (descriptor.perfil.modalidadTrabajo === 'PRESENCIAL' ? 'Presencial' : (descriptor.perfil.modalidadTrabajo === 'HIBRIDO' ? 'Híbrido' : (descriptor.perfil.modalidadTrabajo === 'REMOTO' ? 'Remoto' : descriptor.perfil.modalidadTrabajo || '-'))) + '</td></tr>' +
                '<tr><th>Poseer Licencia:</th><td colspan="3">' + (descriptor.perfil.poseerLicencia == '1' ? 'Sí' : 'No') + '</td></tr>' +
                '</table>';
        } else {
            perfilHtml = '<p class="text-muted">No hay perfil registrado</p>';
        }
        
        // Requerimientos por defecto
        var requerimientosPorDefecto = [
            'Cumplir con los valores institucionales',
            'Cumplir con los normativos institucionales',
            'Cumplir con las competencias requeridas para el cargo'
        ];
        var requerimientos = descriptor.requerimientosOrganizacionales && descriptor.requerimientosOrganizacionales.length > 0 
            ? descriptor.requerimientosOrganizacionales 
            : requerimientosPorDefecto;
        
        var requerimientosHtml = '';
        if (requerimientos && requerimientos.length > 0) {
            requerimientosHtml = '<ul>';
            for (var i = 0; i < requerimientos.length; i++) {
                requerimientosHtml += '<li>' + requerimientos[i] + '</li>';
            }
            requerimientosHtml += '</ul>';
        } else {
            requerimientosHtml = '<p class="text-muted">No hay requerimientos registrados</p>';
        }
        
        // Relaciones Laborales
        var relacionesInternasHtml = '';
        if (descriptor.relacionesLaborales && descriptor.relacionesLaborales.internas && descriptor.relacionesLaborales.internas.length > 0) {
            relacionesInternasHtml = '<ul>';
            for (var i = 0; i < descriptor.relacionesLaborales.internas.length; i++) {
                relacionesInternasHtml += '<li><strong>' + (descriptor.relacionesLaborales.internas[i].puesto || '') + '</strong> - ' + (descriptor.relacionesLaborales.internas[i].razon || '') + '</li>';
            }
            relacionesInternasHtml += '</ul>';
        } else {
            relacionesInternasHtml = '<p class="text-muted text-center">No hay relaciones internas registradas</p>';
        }
        
        var relacionesExternasHtml = '';
        if (descriptor.relacionesLaborales && descriptor.relacionesLaborales.externas && descriptor.relacionesLaborales.externas.length > 0) {
            relacionesExternasHtml = '<ul>';
            for (var i = 0; i < descriptor.relacionesLaborales.externas.length; i++) {
                relacionesExternasHtml += '<li><strong>' + (descriptor.relacionesLaborales.externas[i].entidad || '') + '</strong> - ' + (descriptor.relacionesLaborales.externas[i].razon || '') + '</li>';
            }
            relacionesExternasHtml += '</ul>';
        } else {
            relacionesExternasHtml = '<p class="text-muted text-center">No hay relaciones externas registradas</p>';
        }
        
        // Riesgos
        var riesgosHtml = '';
        if (descriptor.riesgosFisicos) {
            riesgosHtml = '<p><strong>Esfuerzo físico y mental:</strong> ' + (descriptor.riesgosFisicos.esfuerzo || '-') + '</p>' +
                '<p><strong>Condiciones ambientales:</strong> ' + (descriptor.riesgosFisicos.condiciones || '-') + '</p>' +
                '<p><strong>Riesgos profesionales:</strong></p><ul>' + ((descriptor.riesgosFisicos.riesgos || []).map(function(r) { return '<li>' + r + '</li>'; }).join('') || '<li>No registrados</li>') + '</ul>';
        } else {
            riesgosHtml = '<p class="text-muted text-center">No hay riesgos registrados</p>';
        }
        
        var modalHtml = '<div class="text-start" style="max-height: 550px; overflow-y: auto;">' +
            '<div class="alert alert-info mb-3"><i class="fas fa-info-circle"></i> <strong>Descriptor:</strong> ' + (descriptor.codigo || 'DES-' + id) + '<br><strong>Puesto:</strong> ' + (descriptor.puesto || '-') + '<br><strong>Creador:</strong> ' + (descriptor.creador || '-') + '<br><strong>Fecha:</strong> ' + (descriptor.fechaEmision || '-') + '</div>' +
            
            '<h6 class="border-bottom pb-2">Información General</h6>' +
            '<p><strong>Área:</strong> ' + (descriptor.area || '-') + '<br><strong>Reporta a:</strong> ' + (descriptor.reportaA || '-') + '</p>' +
            
            '<h6 class="border-bottom pb-2 mt-3">Objetivo del Puesto</h6>' +
            '<p>' + (descriptor.objetivo || '-') + '</p>' +
            
            '<h6 class="border-bottom pb-2 mt-3">Funciones Claves</h6>' +
            funcionesHtml +
            
            '<h6 class="border-bottom pb-2 mt-3">Indicadores de Desempeño (KPIs)</h6>' +
            kpisHtml +
            
            '<h6 class="border-bottom pb-2 mt-3 text-primary">V. RELACIONES LABORALES <small>(Editable por TH)</small></h6>' +
            '<div class="mb-3"><label class="fw-bold">Relaciones Internas</label>' +
            '<div id="modalRelacionesInternas">' + relacionesInternasHtml + '</div>' +
            '<button class="btn btn-sm btn-outline-primary mt-2" onclick="THController.editarRelacionesInternas(' + id + ')"><i class="fas fa-edit"></i> Editar Relaciones Internas</button></div>' +
            
            '<div class="mb-3"><label class="fw-bold">Relaciones Externas</label>' +
            '<div id="modalRelacionesExternas">' + relacionesExternasHtml + '</div>' +
            '<button class="btn btn-sm btn-outline-primary mt-2" onclick="THController.editarRelacionesExternas(' + id + ')"><i class="fas fa-edit"></i> Editar Relaciones Externas</button></div>' +
            
            '<h6 class="border-bottom pb-2 mt-3 text-primary">VI. REQUERIMIENTOS ORGANIZACIONALES <small>(Editable por TH)</small></h6>' +
            '<div><div id="modalRequerimientos">' + requerimientosHtml + '</div>' +
            '<button class="btn btn-sm btn-outline-primary mt-2" onclick="THController.editarRequerimientos(' + id + ')"><i class="fas fa-edit"></i> Editar Requerimientos</button></div>' +
            
            '<h6 class="border-bottom pb-2 mt-3 text-primary">VII. RIESGOS FISICOS DEL PUESTO <small>(Editable por TH)</small></h6>' +
            '<div><div id="modalRiesgos">' + riesgosHtml + '</div>' +
            '<button class="btn btn-sm btn-outline-primary mt-2" onclick="THController.editarRiesgos(' + id + ')"><i class="fas fa-edit"></i> Editar Riesgos</button></div>' +
            
            '<h6 class="border-bottom pb-2 mt-3">Responsabilidades a Cargo</h6>' +
            '<p><strong>De equipo:</strong> ' + (descriptor.responsabilidades?.equipo || '-') + '</p>' +
            '<p><strong>De fondos:</strong> ' + (descriptor.responsabilidades?.fondos || '-') + '</p>' +
            '<p><strong>De documentos:</strong> ' + (descriptor.responsabilidades?.documentos || '-') + '</p>' +
            '<p><strong>Toma de decisiones:</strong> ' + (descriptor.responsabilidades?.tomaDecisiones || '-') + '</p>' +
            '<p><strong>De personal:</strong> ' + (descriptor.responsabilidades?.personal || '-') + '</p>' +
            '<p><strong>Impacto económico:</strong> ' + (descriptor.responsabilidades?.impactoEconomico || '-') + '</p>' +
            
            '<h6 class="border-bottom pb-2 mt-3">Entrenamiento</h6>' +
            '<p><strong>Personal a cargo:</strong> ' + (descriptor.entrenamiento?.personalCargo || '0') + '</p>' +
            '<p><strong>Tipo de entrenamiento:</strong> ' + (descriptor.entrenamiento?.tipoEntrenamiento || '-') + '</p>' +
            '<p><strong>Duración:</strong> ' + (descriptor.entrenamiento?.duracion || '-') + '</p>' +
            '<p><strong>Puestos responsables:</strong> ' + (descriptor.entrenamiento?.puestosResponsables || '-') + '</p>' +
            '</div>';
        
        Swal.fire({
            title: 'Revisar Descriptor: ' + descriptor.puesto,
            html: modalHtml,
            width: '800px',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: '<i class="fas fa-check"></i> Aprobar',
            denyButtonText: '<i class="fas fa-times"></i> Observar',
            cancelButtonText: 'Cerrar',
            confirmButtonColor: '#198754',
            denyButtonColor: '#ffc107',
            preConfirm: function() {
                return Swal.fire({ title: 'Aprobar Descriptor', text: '¿Está seguro de aprobar este descriptor? Se enviará para firmas.', icon: 'question', showCancelButton: true, confirmButtonText: 'Sí' })
                    .then(function(result) {
                        if (result.isConfirmed) {
                            THService.aprobar(id);
                            DescriptorService.registrarEvento(id, {
                                accion: 'APROBACIÓN POR TH GENERALISTA',
                                usuario: THController.currentUser.nombre,
                                rol: THController.currentUser.rolNombre,
                                estado: 'FIRMA_JTH'
                            });
                            Swal.fire('Aprobado', 'Descriptor enviado para firmas', 'success');
                            location.reload();
                        }
                        return false;
                    });
            },
            preDeny: function() {
                return Swal.fire({
                    title: 'Observaciones',
                    html: '<textarea id="observacionesTH" class="swal2-textarea" placeholder="Escriba las observaciones..." rows="4" style="width:100%"></textarea>',
                    showCancelButton: true,
                    confirmButtonText: 'Enviar',
                    preConfirm: function() {
                        var obs = document.getElementById('observacionesTH').value;
                        if (!obs || obs.trim() === '') { Swal.showValidationMessage('Debe ingresar observaciones'); return false; }
                        return obs;
                    }
                }).then(function(result) {
                    if (result.isConfirmed && result.value) {
                        THService.observar(id, result.value);
                        DescriptorService.registrarEvento(id, {
                            accion: 'OBSERVACIÓN POR TH GENERALISTA',
                            usuario: THController.currentUser.nombre,
                            rol: THController.currentUser.rolNombre,
                            estado: 'OBSERVADO_TH',
                            observacion: result.value
                        });
                        Swal.fire('Observado', 'Descriptor devuelto con observaciones', 'warning');
                        location.reload();
                    }
                    return false;
                });
            }
        });
    },
    
    editarRelacionesInternas: function(id) {
        var descriptor = THService.getById(id);
        var relaciones = descriptor.relacionesLaborales?.internas || [];
        var html = '<div class="text-start" id="relacionesInternasEditor">';
        
        for (var i = 0; i < relaciones.length; i++) {
            html += '<div class="row mb-2"><div class="col-5"><input type="text" class="form-control" name="relInternaPuesto" value="' + (relaciones[i].puesto || '') + '" placeholder="Puesto/Área"></div>' +
                '<div class="col-5"><input type="text" class="form-control" name="relInternaRazon" value="' + (relaciones[i].razon || '') + '" placeholder="Razón"></div>' +
                '<div class="col-2"><button type="button" class="btn btn-sm btn-danger" onclick="$(this).closest(\'.row\').remove()"><i class="fas fa-trash"></i></button></div></div>';
        }
        
        if (relaciones.length === 0) {
            html += '<div class="row mb-2"><div class="col-5"><input type="text" class="form-control" name="relInternaPuesto" placeholder="Puesto/Área"></div>' +
                '<div class="col-5"><input type="text" class="form-control" name="relInternaRazon" placeholder="Razón"></div>' +
                '<div class="col-2"></div></div>';
        }
        
        html += '<button type="button" class="btn btn-sm btn-outline-primary mt-2" onclick="agregarRelacionInterna()"><i class="fas fa-plus"></i> Agregar</button>';
        
        Swal.fire({
            title: 'Editar Relaciones Internas',
            html: html,
            width: '600px',
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            preConfirm: function() {
                var nuevas = [];
                $('#relacionesInternasEditor .row').each(function() {
                    var puesto = $(this).find('input[name="relInternaPuesto"]').val();
                    var razon = $(this).find('input[name="relInternaRazon"]').val();
                    if (puesto && razon) nuevas.push({ puesto: puesto, razon: razon });
                });
                return nuevas;
            }
        }).then(function(result) {
            if (result.isConfirmed && result.value) {
                var d = THService.getById(id);
                if (!d.relacionesLaborales) d.relacionesLaborales = {};
                d.relacionesLaborales.internas = result.value;
                THService.guardarComplementos(id, d);
                DescriptorService.registrarEvento(id, {
                    accion: 'ACTUALIZACIÓN RELACIONES INTERNAS',
                    usuario: THController.currentUser.nombre,
                    rol: THController.currentUser.rolNombre
                });
                Swal.fire('Guardado', 'Relaciones internas actualizadas', 'success');
                THController.verDetalle(id);
            }
        });
    },
    
    editarRelacionesExternas: function(id) {
        var descriptor = THService.getById(id);
        var relaciones = descriptor.relacionesLaborales?.externas || [];
        var html = '<div class="text-start" id="relacionesExternasEditor">';
        
        for (var i = 0; i < relaciones.length; i++) {
            html += '<div class="row mb-2"><div class="col-5"><input type="text" class="form-control" name="relExternaEntidad" value="' + (relaciones[i].entidad || '') + '" placeholder="Entidad externa"></div>' +
                '<div class="col-5"><input type="text" class="form-control" name="relExternaRazon" value="' + (relaciones[i].razon || '') + '" placeholder="Razón"></div>' +
                '<div class="col-2"><button type="button" class="btn btn-sm btn-danger" onclick="$(this).closest(\'.row\').remove()"><i class="fas fa-trash"></i></button></div></div>';
        }
        
        if (relaciones.length === 0) {
            html += '<div class="row mb-2"><div class="col-5"><input type="text" class="form-control" name="relExternaEntidad" placeholder="Entidad externa"></div>' +
                '<div class="col-5"><input type="text" class="form-control" name="relExternaRazon" placeholder="Razón"></div>' +
                '<div class="col-2"></div></div>';
        }
        
        html += '<button type="button" class="btn btn-sm btn-outline-primary mt-2" onclick="agregarRelacionExterna()"><i class="fas fa-plus"></i> Agregar</button>';
        
        Swal.fire({
            title: 'Editar Relaciones Externas',
            html: html,
            width: '600px',
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            preConfirm: function() {
                var nuevas = [];
                $('#relacionesExternasEditor .row').each(function() {
                    var entidad = $(this).find('input[name="relExternaEntidad"]').val();
                    var razon = $(this).find('input[name="relExternaRazon"]').val();
                    if (entidad && razon) nuevas.push({ entidad: entidad, razon: razon });
                });
                return nuevas;
            }
        }).then(function(result) {
            if (result.isConfirmed && result.value) {
                var d = THService.getById(id);
                if (!d.relacionesLaborales) d.relacionesLaborales = {};
                d.relacionesLaborales.externas = result.value;
                THService.guardarComplementos(id, d);
                DescriptorService.registrarEvento(id, {
                    accion: 'ACTUALIZACIÓN RELACIONES EXTERNAS',
                    usuario: THController.currentUser.nombre,
                    rol: THController.currentUser.rolNombre
                });
                Swal.fire('Guardado', 'Relaciones externas actualizadas', 'success');
                THController.verDetalle(id);
            }
        });
    },
    
    editarRequerimientos: function(id) {
        var descriptor = THService.getById(id);
        var requerimientosActuales = descriptor.requerimientosOrganizacionales && descriptor.requerimientosOrganizacionales.length > 0 
            ? descriptor.requerimientosOrganizacionales 
            : ['Cumplir con los valores institucionales', 'Cumplir con los normativos institucionales', 'Cumplir con las competencias requeridas para el cargo'];
        
        var html = '<div class="text-start" id="requerimientosEditor">';
        
        for (var i = 0; i < requerimientosActuales.length; i++) {
            html += '<div class="row mb-2"><div class="col-10"><input type="text" class="form-control" name="requerimiento" value="' + (requerimientosActuales[i] || '') + '" placeholder="Requerimiento organizacional"></div>' +
                '<div class="col-2"><button type="button" class="btn btn-sm btn-danger" onclick="$(this).closest(\'.row\').remove()"><i class="fas fa-trash"></i></button></div></div>';
        }
        
        html += '<button type="button" class="btn btn-sm btn-outline-primary mt-2" onclick="agregarRequerimiento()"><i class="fas fa-plus"></i> Agregar</button>';
        
        Swal.fire({
            title: 'Editar Requerimientos Organizacionales',
            html: html,
            width: '600px',
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            preConfirm: function() {
                var nuevos = [];
                $('#requerimientosEditor .row').each(function() {
                    var req = $(this).find('input[name="requerimiento"]').val();
                    if (req && req.trim() !== '') nuevos.push(req.trim());
                });
                return nuevos;
            }
        }).then(function(result) {
            if (result.isConfirmed && result.value) {
                var d = THService.getById(id);
                d.requerimientosOrganizacionales = result.value;
                THService.guardarComplementos(id, d);
                DescriptorService.registrarEvento(id, {
                    accion: 'ACTUALIZACIÓN REQUERIMIENTOS',
                    usuario: THController.currentUser.nombre,
                    rol: THController.currentUser.rolNombre
                });
                Swal.fire('Guardado', 'Requerimientos actualizados', 'success');
                THController.verDetalle(id);
            }
        });
    },
    
    editarRiesgos: function(id) {
        var descriptor = THService.getById(id);
        var riesgos = descriptor.riesgosFisicos || {};
        var riesgosArray = riesgos.riesgos || [];
        var html = '<div class="text-start">' +
            '<div class="mb-3"><label>Esfuerzo físico y mental</label><textarea id="esfuerzo" class="form-control" rows="2" placeholder="Ej: Esfuerzo mental y visual">' + (riesgos.esfuerzo || '') + '</textarea></div>' +
            '<div class="mb-3"><label>Condiciones ambientales</label><textarea id="condiciones" class="form-control" rows="2" placeholder="Ej: Ventilado, espacioso e iluminado">' + (riesgos.condiciones || '') + '</textarea></div>' +
            '<div class="mb-3"><label>Riesgos profesionales</label><div id="riesgosLista">';
        
        if (riesgosArray.length === 0) {
            html += '<div class="row mb-2"><div class="col-10"><input type="text" class="form-control" name="riesgo" placeholder="Ej: Dolor lumbar"></div><div class="col-2"><button type="button" class="btn btn-sm btn-danger" onclick="$(this).closest(\'.row\').remove()"><i class="fas fa-trash"></i></button></div></div>';
        } else {
            for (var i = 0; i < riesgosArray.length; i++) {
                html += '<div class="row mb-2"><div class="col-10"><input type="text" class="form-control" name="riesgo" value="' + (riesgosArray[i] || '') + '" placeholder="Riesgo profesional"></div><div class="col-2"><button type="button" class="btn btn-sm btn-danger" onclick="$(this).closest(\'.row\').remove()"><i class="fas fa-trash"></i></button></div></div>';
            }
        }
        
        html += '</div><button type="button" class="btn btn-sm btn-outline-primary mt-2" onclick="agregarRiesgo()"><i class="fas fa-plus"></i> Agregar riesgo</button></div></div>';
        
        Swal.fire({
            title: 'Editar Riesgos Físicos del Puesto',
            html: html,
            width: '600px',
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            preConfirm: function() {
                var esfuerzo = document.getElementById('esfuerzo').value;
                var condiciones = document.getElementById('condiciones').value;
                var riesgosLista = [];
                $('#riesgosLista .row input[name="riesgo"]').each(function() {
                    var riesgo = $(this).val();
                    if (riesgo && riesgo.trim() !== '') riesgosLista.push(riesgo.trim());
                });
                return { esfuerzo: esfuerzo, condiciones: condiciones, riesgos: riesgosLista };
            }
        }).then(function(result) {
            if (result.isConfirmed && result.value) {
                var d = THService.getById(id);
                d.riesgosFisicos = result.value;
                THService.guardarComplementos(id, d);
                DescriptorService.registrarEvento(id, {
                    accion: 'ACTUALIZACIÓN RIESGOS',
                    usuario: THController.currentUser.nombre,
                    rol: THController.currentUser.rolNombre
                });
                Swal.fire('Guardado', 'Riesgos actualizados', 'success');
                THController.verDetalle(id);
            }
        });
    }
};

// Funciones auxiliares
window.agregarRelacionInterna = function() { 
    $('#relacionesInternasEditor').append('<div class="row mb-2"><div class="col-5"><input type="text" class="form-control" name="relInternaPuesto" placeholder="Puesto/Área"></div><div class="col-5"><input type="text" class="form-control" name="relInternaRazon" placeholder="Razón"></div><div class="col-2"><button type="button" class="btn btn-sm btn-danger" onclick="$(this).closest(\'.row\').remove()"><i class="fas fa-trash"></i></button></div></div>'); 
};

window.agregarRelacionExterna = function() { 
    $('#relacionesExternasEditor').append('<div class="row mb-2"><div class="col-5"><input type="text" class="form-control" name="relExternaEntidad" placeholder="Entidad externa"></div><div class="col-5"><input type="text" class="form-control" name="relExternaRazon" placeholder="Razón"></div><div class="col-2"><button type="button" class="btn btn-sm btn-danger" onclick="$(this).closest(\'.row\').remove()"><i class="fas fa-trash"></i></button></div></div>'); 
};

window.agregarRequerimiento = function() { 
    $('#requerimientosEditor').append('<div class="row mb-2"><div class="col-10"><input type="text" class="form-control" name="requerimiento" placeholder="Requerimiento organizacional"></div><div class="col-2"><button type="button" class="btn btn-sm btn-danger" onclick="$(this).closest(\'.row\').remove()"><i class="fas fa-trash"></i></button></div></div>'); 
};

window.agregarRiesgo = function() { 
    $('#riesgosLista').append('<div class="row mb-2"><div class="col-10"><input type="text" class="form-control" name="riesgo" placeholder="Riesgo profesional"></div><div class="col-2"><button type="button" class="btn btn-sm btn-danger" onclick="$(this).closest(\'.row\').remove()"><i class="fas fa-trash"></i></button></div></div>'); 
};

window.THController = THController;