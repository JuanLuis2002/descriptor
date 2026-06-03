// Controlador de Aprobación
var AprobacionController = {
    currentUser: null,
    currentPage: 1,
    pageSize: 5,
    
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
            self.cargarGestionados();
        }).fail(function() {
            $('#contentContainer').html('<div class="alert alert-danger">Error al cargar la vista de aprobación.</div>');
        });
    },
    
    cargarPendientes: function() {
        var pendientes = AprobacionService.getPendientesAprobacion();
        var gestionados = AprobacionService.getGestionadosPorUsuario(this.currentUser.nombre);
        var todos = {};
        for (var p = 0; p < pendientes.length; p++) todos[pendientes[p].id] = pendientes[p];
        for (var g = 0; g < gestionados.length; g++) todos[gestionados[g].id] = gestionados[g];
        var lista = Object.keys(todos).map(function(id) { return todos[id]; });
        
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
            '<th>Opciones</th><th>Código</th><th>Puesto</th><th class="d-none d-md-table-cell">Área</th><th>Estado</th><th class="d-none d-lg-table-cell">Creador</th><th class="d-none d-lg-table-cell">Fecha</th></tr></thead><tbody>';
        for (var i = 0; i < pageItems.length; i++) {
            var d = pageItems[i];
            var fecha = d.fechaEmision || (d.fechaCreacion ? d.fechaCreacion.split('T')[0] : '-');
            var isAprobado = d.estado === 'APROBADO_POR_JF';
            var badgeClass = this.getEstadoBadgeClass(d.estado);
            var badgeText = this.getEstadoTexto(d.estado);
            var buttonText = isAprobado ? 'Enviar a TH' : 'Revisar Descriptor';
            html += '<tr>' +
                '<td><div class="dropdown"><button class="btn btn-sm btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></button>' +
                '<ul class="dropdown-menu dropdown-menu-end" style="z-index: 2100;">' +
                '<li><button class="dropdown-item" onclick="AprobacionController.verDetalle(' + d.id + ')"><i class="fas fa-eye me-2 text-info"></i>' + buttonText + '</button></li>' +
                '<li><button class="dropdown-item" onclick="AprobacionController.verAuditoriaCompleta(' + d.id + ')"><i class="fas fa-list me-2 text-primary"></i>Auditoría completa</button></li>' +
                '<li><button class="dropdown-item" onclick="AprobacionController.verHistorialGestion(' + d.id + ')"><i class="fas fa-user-clock me-2 text-secondary"></i>Mis acciones</button></li>' +
                '</ul></div></td>' +
                '<td><strong>' + (d.codigo || 'DES-' + d.id) + '</strong></td>' +
                '<td class="workflow-table-title">' + (d.puesto || 'Sin título') + '</td>' +
                '<td class="d-none d-md-table-cell">' + (d.area || 'N/A') + '</td>' +
                '<td><span class="badge ' + badgeClass + '">' + badgeText + '</span></td>' +
                '<td class="d-none d-lg-table-cell">' + (d.creador || 'N/A') + '</td>' +
                '<td class="d-none d-lg-table-cell">' + fecha + '</td>' +
                '</tr>';
        }
        html += '</tbody></table></div>' + this.renderPagination(lista.length, start, end, totalPages) + '</div>';
        $('#pendientesContainer').html(html);
        $('#gestionadosContainer').empty();
        if (typeof actualizarContador === 'function') {
            actualizarContador();
        }
    },

    renderPagination: function(total, start, end, totalPages) {
        var html = '<div class="workflow-pagination-footer">' +
            '<div class="workflow-page-size-options">' +
            '<button class="workflow-page-size-btn ' + (this.pageSize === 5 ? 'active' : '') + '" onclick="AprobacionController.cambiarPageSize(5)">5</button>' +
            '<button class="workflow-page-size-btn ' + (this.pageSize === 10 ? 'active' : '') + '" onclick="AprobacionController.cambiarPageSize(10)">10</button>' +
            '<button class="workflow-page-size-btn ' + (this.pageSize === 25 ? 'active' : '') + '" onclick="AprobacionController.cambiarPageSize(25)">25</button>' +
            '</div><div class="small text-muted">Mostrando ' + (start + 1) + ' a ' + end + ' de ' + total + ' registros</div>' +
            '<nav><ul class="pagination pagination-sm mb-0">' +
            '<li class="page-item ' + (this.currentPage === 1 ? 'disabled' : '') + '"><button class="page-link" onclick="AprobacionController.cambiarPagina(' + (this.currentPage - 1) + ')"><i class="fas fa-chevron-left"></i></button></li>';
        for (var p = 1; p <= totalPages; p++) {
            html += '<li class="page-item ' + (p === this.currentPage ? 'active' : '') + '"><button class="page-link" onclick="AprobacionController.cambiarPagina(' + p + ')">' + p + '</button></li>';
        }
        html += '<li class="page-item ' + (this.currentPage === totalPages ? 'disabled' : '') + '"><button class="page-link" onclick="AprobacionController.cambiarPagina(' + (this.currentPage + 1) + ')"><i class="fas fa-chevron-right"></i></button></li>' +
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
    
    getEstadoTexto: function(estado) {
        var estados = {
            'ENVIADO_JF': 'Pendiente de aprobación',
            'APROBADO_POR_JF': 'Aprobado por Jefe Superior',
            'ENVIADO_TH': 'Enviado a TH',
            'OBSERVADO_JF': 'Observado por Jefe Superior',
            'OBSERVADO_TH': 'Observado por TH',
            'FIRMA_JTH': 'Pendiente firma JTH',
            'FIRMADO_JTH': 'Firmado por JTH',
            'FIRMADO_CT': 'Firmado por colaborador',
            'ACTIVO': 'Activo',
            'INACTIVO': 'Inactivo'
        };
        return estados[estado] || estado;
    },
    
    getEstadoBadgeClass: function(estado) {
        var classes = {
            'ENVIADO_JF': 'bg-warning text-dark',
            'APROBADO_POR_JF': 'bg-success',
            'ENVIADO_TH': 'bg-info text-dark',
            'OBSERVADO_JF': 'bg-warning text-dark',
            'OBSERVADO_TH': 'bg-warning text-dark',
            'FIRMA_JTH': 'bg-primary',
            'FIRMADO_JTH': 'bg-primary',
            'FIRMADO_CT': 'bg-primary',
            'ACTIVO': 'bg-success',
            'INACTIVO': 'bg-danger'
        };
        return classes[estado] || 'bg-secondary';
    },
    
    cargarGestionados: function() {
        $('#gestionadosContainer').empty();
    },

    verAuditoriaCompleta: function(id) {
        var descriptor = AprobacionService.getDetalle(id);
        if (!descriptor) return;
        var eventos = (descriptor.auditoria && descriptor.auditoria.eventos) ? descriptor.auditoria.eventos.slice() : [];
        var html = '<div class="text-start" style="max-height:520px;overflow-y:auto;">';
        html += '<div class="alert alert-info"><strong>Descriptor:</strong> ' + (descriptor.codigo || 'DES-' + id) + '<br><strong>Puesto:</strong> ' + (descriptor.puesto || '-') + '<br><strong>Estado actual:</strong> ' + this.getEstadoTexto(descriptor.estado) + '</div>';
        if (eventos.length === 0) {
            html += '<p class="text-muted">No hay eventos registrados.</p>';
        } else {
            eventos.sort(function(a, b) { return new Date(a.fecha) - new Date(b.fecha); });
            for (var i = 0; i < eventos.length; i++) {
                html += '<div class="border-bottom py-2"><strong>' + (eventos[i].accion || 'Evento') + '</strong><br><small class="text-muted">' + new Date(eventos[i].fecha).toLocaleString() + ' | ' + (eventos[i].usuario || 'Sistema') + ' - ' + (eventos[i].rol || '') + '</small>';
                if (eventos[i].observacion) html += '<div class="alert alert-warning mt-2 mb-0 p-2">' + eventos[i].observacion + '</div>';
                html += '</div>';
            }
        }
        html += '</div>';
        Swal.fire({ title: 'Auditoría completa', html: html, width: '700px', confirmButtonText: 'Cerrar', confirmButtonColor: '#0d6efd' });
    },
    
    verHistorialGestion: function(id) {
        var descriptor = AprobacionService.getDetalle(id);
        if (!descriptor) return;
        var eventos = AprobacionService.getEventosUsuario(descriptor, this.currentUser.nombre);
        var html = '<div class="text-start">';
        html += '<div class="alert alert-info"><strong>Descriptor:</strong> ' + (descriptor.codigo || 'DES-' + id) + '<br><strong>Puesto:</strong> ' + (descriptor.puesto || '-') + '<br><strong>Estado actual:</strong> ' + this.getEstadoTexto(descriptor.estado) + '</div>';
        if (eventos.length === 0) {
            html += '<p class="text-muted">No hay eventos registrados.</p>';
        } else {
            eventos.sort(function(a, b) { return new Date(a.fecha) - new Date(b.fecha); });
            for (var i = 0; i < eventos.length; i++) {
                html += '<div class="border-bottom py-2"><strong>' + (eventos[i].accion || 'Evento') + '</strong><br><small class="text-muted">' + new Date(eventos[i].fecha).toLocaleString() + '</small>';
                if (eventos[i].observacion) html += '<div class="alert alert-warning mt-2 mb-0 p-2">' + eventos[i].observacion + '</div>';
                html += '</div>';
            }
        }
        html += '</div>';
        Swal.fire({ title: 'Historial de participación', html: html, width: '650px', confirmButtonText: 'Cerrar', confirmButtonColor: '#0d6efd' });
    },
    
    verDetalle: function(id) {
        var descriptor = AprobacionService.getDetalle(id);
        if (!descriptor) return;
        
        var isAprobado = AprobacionService.isAprobadoPendienteEnvio(id);
        
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
        
        // Actividades
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
        
        var modalHtml = '<div class="text-start" style="max-height: 550px; overflow-y: auto;">' +
            '<div class="alert alert-info mb-3"><i class="fas fa-info-circle"></i> <strong>Descriptor:</strong> ' + (descriptor.codigo || 'DES-' + id) + '<br><strong>Puesto:</strong> ' + (descriptor.puesto || '-') + '<br><strong>Creador:</strong> ' + (descriptor.creador || '-') + '<br><strong>Fecha:</strong> ' + (descriptor.fechaEmision || '-') + '</div>' +
            (isAprobado ? '<div class="alert alert-success"><i class="fas fa-check-circle"></i> Ya ha registrado su aprobación para este descriptor. No es posible agregar nuevas observaciones ni modificar la aprobación otorgada.</div>' : '') +
            
            '<h6 class="border-bottom pb-2">Información General</h6>' +
            '<p><strong>Área:</strong> ' + (descriptor.area || '-') + '<br><strong>Reporta a:</strong> ' + (descriptor.reportaA || '-') + '</p>' +
            
            '<h6 class="border-bottom pb-2 mt-3">Objetivo del Puesto</h6>' +
            '<p>' + (descriptor.objetivo || '-') + '</p>' +
            
            '<h6 class="border-bottom pb-2 mt-3">Funciones Claves</h6>' +
            funcionesHtml +
            
            '<h6 class="border-bottom pb-2 mt-3">Actividades por Función</h6>' +
            actividadesHtml +
            
            '<h6 class="border-bottom pb-2 mt-3">Funciones Secundarias</h6>' +
            '<ul>' + ((descriptor.funcionesSecundarias || []).map(function(f) { return '<li>' + f + '</li>'; }).join('') || '<li class="text-muted">No registradas</li>') + '</ul>' +
            
            '<h6 class="border-bottom pb-2 mt-3">Indicadores de Desempeño (KPIs)</h6>' +
            kpisHtml +
            
            '<h6 class="border-bottom pb-2 mt-3">Perfil del Puesto</h6>' +
            perfilHtml +
            
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
        
        var confirmButtonText = isAprobado ? '<i class="fas fa-paper-plane"></i> Enviar a TH' : '<i class="fas fa-check"></i> Aprobar';
        var denyButtonText = isAprobado ? '<i class="fas fa-undo"></i> Volver' : '<i class="fas fa-times"></i> Observar';
        var confirmButtonColor = isAprobado ? '#0d6efd' : '#198754';
        var denyButtonColor = isAprobado ? '#6c757d' : '#ffc107';
        
        Swal.fire({
            title: 'Revisar Descriptor: ' + descriptor.puesto,
            html: modalHtml,
            width: '750px',
            showCancelButton: true,
            showDenyButton: !isAprobado,
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
                                Swal.fire('Enviado', 'Descriptor enviado a Talento Humano', 'success').then(function() {
                                    AprobacionController.cargarPendientes();
                                    AprobacionController.cargarGestionados();
                                });
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
                                Swal.fire('Aprobado', 'Descriptor aprobado correctamente. Ahora puede enviarlo a Talento Humano.', 'success').then(function() {
                                    AprobacionController.cargarPendientes();
                                    AprobacionController.cargarGestionados();
                                });
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
                                Swal.fire('Devuelto', 'Descriptor vuelve a pendiente', 'info').then(function() {
                                    AprobacionController.cargarPendientes();
                                    AprobacionController.cargarGestionados();
                                });
                            }
                            return false;
                        });
                } else {
                    return Swal.fire({
                        title: 'Observaciones',
                        html: '<textarea id="observaciones" class="swal2-textarea" placeholder="Escriba las observaciones..." rows="4" style="width:100%"></textarea>',
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
                            Swal.fire('Observado', 'Descriptor devuelto con observaciones', 'warning').then(function() {
                                AprobacionController.cargarPendientes();
                                AprobacionController.cargarGestionados();
                            });
                        }
                        return false;
                    });
                }
            }
        });
    }
};

window.AprobacionController = AprobacionController;