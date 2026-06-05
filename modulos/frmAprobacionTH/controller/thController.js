// Controlador de Aprobación TH
var THController = {
    currentUser: null,
    currentPage: 1,
    pageSize: 5,
    
    init: function(user) {
        this.currentUser = user;
        console.log('THController iniciado para:', user.nombre);
        this.loadView();
    },
    
    loadView: function() {
        var self = this;
        $('#pageTitle').text('Revisión Técnica TH');
        $('#contentContainer').empty();
        $.get('modulos/frmAprobacionTH/view/thView.html', function(html) {
            $('#contentContainer').html(html);
            console.log('Vista de TH cargada correctamente');
            self.cargarPendientes();
            self.cargarGestionados();
        }).fail(function() {
            $('#contentContainer').html('<div class="alert alert-danger">Error al cargar la vista de TH.</div>');
        });
    },
    
    cargarPendientes: function() {
        var pendientes = THService.getPendientesRevision();
        var gestionados = THService.getGestionadosPorUsuario(this.currentUser.nombre);
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
            '<th>Opciones</th><th>Código</th><th>Puesto</th><th>Área</th><th>Estado</th><th>Creador</th><th>Fecha</th></tr></thead><tbody>';
        for (var i = 0; i < pageItems.length; i++) {
            var d = pageItems[i];
            var fecha = d.fechaEmision || (d.fechaCreacion ? d.fechaCreacion.split('T')[0] : '-');
            var estadoTexto = this.getEstadoTexto(d.estado);
            var estadoClass = this.getEstadoBadgeClass(d.estado);
            var reportes = '';
            if (d.estado === 'ACTIVO') {
                reportes = (d.tipoFormato || 'CORTA') === 'EXTENSA'
                    ? '<li><button class="dropdown-item" onclick="generarVersionExtensa(' + d.id + ')"><i class="fas fa-file-pdf me-2 text-secondary"></i>Versión Extensa</button></li>'
                    : '<li><button class="dropdown-item" onclick="generarVersionCorta(' + d.id + ')"><i class="fas fa-file-pdf me-2 text-success"></i>Versión Corta</button></li>';
            }
            html += '<tr>' +
                '<td><div class="dropdown workflow-actions"><button class="btn btn-sm btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-boundary="viewport" data-bs-display="static"><i class="fas fa-ellipsis-v"></i></button>' +
                '<ul class="dropdown-menu dropdown-menu-end" style="z-index: 5000;">' +
                '<li><button class="dropdown-item" onclick="THController.verDetalle(' + d.id + ')"><i class="fas fa-eye me-2 text-info"></i>Ver / revisar</button></li>' +
                '<li><button class="dropdown-item" onclick="THController.verAuditoriaCompleta(' + d.id + ')"><i class="fas fa-list me-2 text-primary"></i>Auditoría completa</button></li>' +
                '<li><button class="dropdown-item" onclick="THController.verHistorialGestion(' + d.id + ')"><i class="fas fa-user-clock me-2 text-secondary"></i>Mis acciones</button></li>' +
                reportes +
                '</ul></div></td>' +
                '<td><strong>' + (d.codigo || 'DES-' + d.id) + '</strong></td>' +
                '<td class="workflow-table-title">' + (d.puesto || 'Sin título') + '</td>' +
                '<td>' + (d.area || 'N/A') + '</td>' +
                '<td><span class="badge ' + estadoClass + '">' + estadoTexto + '</span></td>' +
                '<td>' + (d.creador || 'N/A') + '</td>' +
                '<td>' + fecha + '</td>' +
                '</tr>';
        }
        html += '</tbody></table></div>' + this.renderPagination(lista.length, start, end, totalPages) + '</div>';
        $('#pendientesContainer').html(html);
        $('#gestionadosContainer').empty();
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
            '<button class="workflow-page-size-btn ' + (this.pageSize === 5 ? 'active' : '') + '" onclick="THController.cambiarPageSize(5)">5</button>' +
            '<button class="workflow-page-size-btn ' + (this.pageSize === 10 ? 'active' : '') + '" onclick="THController.cambiarPageSize(10)">10</button>' +
            '<button class="workflow-page-size-btn ' + (this.pageSize === 25 ? 'active' : '') + '" onclick="THController.cambiarPageSize(25)">25</button>' +
            '</div><div class="small text-muted">Mostrando ' + (start + 1) + ' a ' + end + ' de ' + total + ' registros</div>' +
            '<nav><ul class="pagination pagination-sm mb-0">' +
            '<li class="page-item ' + (this.currentPage === 1 ? 'disabled' : '') + '"><button class="page-link" onclick="THController.cambiarPagina(' + (this.currentPage - 1) + ')"><i class="fas fa-chevron-left"></i></button></li>';
        for (var p = 1; p <= totalPages; p++) {
            html += '<li class="page-item ' + (p === this.currentPage ? 'active' : '') + '"><button class="page-link" onclick="THController.cambiarPagina(' + p + ')">' + p + '</button></li>';
        }
        html += '<li class="page-item ' + (this.currentPage === totalPages ? 'disabled' : '') + '"><button class="page-link" onclick="THController.cambiarPagina(' + (this.currentPage + 1) + ')"><i class="fas fa-chevron-right"></i></button></li>' +
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
            'ENVIADO_TH': 'Pendiente de revisión TH',
            'OBSERVADO_TH': 'Observado por TH',
            'FIRMA_JTH': 'Pendiente de firmas',
            'FIRMADO_JTH': 'Firmado por JTH',
            'FIRMADO_CT': 'Firmado por colaborador',
            'ACTIVO': 'Activo',
            'INACTIVO': 'Inactivo'
        };
        return estados[estado] || estado;
    },
    
    getEstadoBadgeClass: function(estado) {
        var classes = {
            'ENVIADO_TH': 'bg-warning text-dark',
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
        var descriptor = THService.getById(id);
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
        var descriptor = THService.getById(id);
        if (!descriptor) return;
        var eventos = THService.getEventosUsuario(descriptor, this.currentUser.nombre);
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

    abrirFormularioRevision: function(id, descriptor) {
        if (typeof DescriptorController === 'undefined') {
            Swal.fire('Error', 'No se puede abrir el formulario del descriptor', 'error');
            return;
        }

        $('#pageTitle').text('Revisión Técnica TH');
        DescriptorController.init(this.currentUser, id, { readOnly: true });

        var self = this;
        var intentos = 0;
        function insertarPanelRevision() {
            intentos++;
            if ($('#descriptorForm').length === 0 && intentos < 20) {
                setTimeout(insertarPanelRevision, 150);
                return;
            }
            self.renderPanelRevision(id, THService.getById(id) || descriptor);
        }
        setTimeout(insertarPanelRevision, 150);
    },

    renderPanelRevision: function(id, descriptor) {
        $('#revisionTHActions').remove();

        var puedeGestionar = descriptor.estado === 'ENVIADO_TH';
        var esExtensa = (descriptor.tipoFormato || 'CORTA') === 'EXTENSA';
        var estadoTexto = this.getEstadoTexto(descriptor.estado);
        var relaciones = descriptor.relacionesLaborales || {};
        var riesgos = descriptor.riesgosFisicos || {};
        var requerimientos = descriptor.requerimientosOrganizacionales && descriptor.requerimientosOrganizacionales.length > 0
            ? descriptor.requerimientosOrganizacionales
            : ['Cumplir con los valores institucionales', 'Cumplir con los normativos institucionales', 'Cumplir con las competencias requeridas para el cargo'];

        function lista(items, getText) {
            if (!items || items.length === 0) return '<div class="text-muted small">Sin información registrada</div>';
            var html = '<ul class="mb-0 ps-3">';
            for (var i = 0; i < items.length; i++) html += '<li>' + getText(items[i]) + '</li>';
            return html + '</ul>';
        }

        var complementosHtml = esExtensa
            ? '<div class="row g-2 mt-3">' +
                '<div class="col-md-6"><div class="th-complement-card"><div class="d-flex justify-content-between gap-2"><strong>Relaciones internas</strong>' + (puedeGestionar ? '<button class="btn btn-sm btn-outline-primary" onclick="THController.editarRelacionesInternas(' + id + ')"><i class="fas fa-edit"></i></button>' : '') + '</div>' + lista(relaciones.internas, function(r) { return '<strong>' + (r.puesto || '-') + ':</strong> ' + (r.razon || '-'); }) + '</div></div>' +
                '<div class="col-md-6"><div class="th-complement-card"><div class="d-flex justify-content-between gap-2"><strong>Relaciones externas</strong>' + (puedeGestionar ? '<button class="btn btn-sm btn-outline-primary" onclick="THController.editarRelacionesExternas(' + id + ')"><i class="fas fa-edit"></i></button>' : '') + '</div>' + lista(relaciones.externas, function(r) { return '<strong>' + (r.entidad || '-') + ':</strong> ' + (r.razon || '-'); }) + '</div></div>' +
                '<div class="col-md-6"><div class="th-complement-card"><div class="d-flex justify-content-between gap-2"><strong>Requerimientos organizacionales</strong>' + (puedeGestionar ? '<button class="btn btn-sm btn-outline-primary" onclick="THController.editarRequerimientos(' + id + ')"><i class="fas fa-edit"></i></button>' : '') + '</div>' + lista(requerimientos, function(r) { return r || '-'; }) + '</div></div>' +
                '<div class="col-md-6"><div class="th-complement-card"><div class="d-flex justify-content-between gap-2"><strong>Riesgos físicos</strong>' + (puedeGestionar ? '<button class="btn btn-sm btn-outline-primary" onclick="THController.editarRiesgos(' + id + ')"><i class="fas fa-edit"></i></button>' : '') + '</div>' +
                    '<div class="small"><strong>Esfuerzo:</strong> ' + (riesgos.esfuerzo || '-') + '</div>' +
                    '<div class="small"><strong>Condiciones:</strong> ' + (riesgos.condiciones || '-') + '</div>' +
                    lista(riesgos.riesgos, function(r) { return r || '-'; }) +
                '</div></div>' +
              '</div>'
            : '<div class="alert alert-secondary mt-3 mb-0"><i class="fas fa-info-circle me-1"></i> Este descriptor es de versión corta, por lo que no requiere relaciones, requerimientos ni riesgos físicos complementados por TH.</div>';

        var accionesHtml = puedeGestionar
            ? '<div class="d-flex flex-wrap gap-2 justify-content-end">' +
                '<button type="button" class="btn btn-outline-secondary" onclick="THController.loadView()"><i class="fas fa-arrow-left me-1"></i> Volver</button>' +
                '<button type="button" class="btn btn-warning" onclick="THController.observarDesdeFormulario(' + id + ')"><i class="fas fa-comment-dots me-1"></i> Observar</button>' +
                '<button type="button" class="btn btn-success" onclick="THController.aprobarDesdeFormulario(' + id + ')"><i class="fas fa-check me-1"></i> Aprobar y enviar a firmas</button>' +
              '</div>'
            : '<div class="d-flex flex-wrap gap-2 justify-content-end">' +
                '<button type="button" class="btn btn-outline-secondary" onclick="THController.loadView()"><i class="fas fa-arrow-left me-1"></i> Volver</button>' +
              '</div>';

        var panel = '<style>' +
            '.th-complement-card{height:100%;border:1px solid #d9e6f8;border-radius:12px;background:#f8fbff;padding:12px;}' +
            '.th-complement-card strong{font-size:.9rem;}' +
            'body.dark-mode .th-complement-card{background:#111827;border-color:#374151;color:#e5e7eb;}' +
            '</style>' +
            '<div id="revisionTHActions" class="alert alert-primary border-primary-subtle mb-3">' +
            '<div class="d-flex flex-wrap align-items-start justify-content-between gap-3">' +
            '<div>' +
            '<h6 class="mb-1"><i class="fas fa-user-check me-1"></i> Revisión técnica de Talento Humano</h6>' +
            '<div class="small">Descriptor <strong>' + (descriptor.codigo || 'DES-' + id) + '</strong> | Formato: <strong>' + (esExtensa ? 'Versión extensa' : 'Versión corta') + '</strong> | Estado: <strong>' + estadoTexto + '</strong></div>' +
            (puedeGestionar ? '<div class="small text-muted mt-1">Revise el descriptor y complete los apartados técnicos cuando aplique.</div>' : '<div class="small text-muted mt-1">Este descriptor no está pendiente de revisión técnica.</div>') +
            '</div>' +
            accionesHtml +
            '</div>' +
            complementosHtml +
            '</div>';

        var $alert = $('#readOnlyDescriptorAlert');
        if ($alert.length) {
            $alert.after(panel);
        } else {
            $('.descriptor-save-top').after(panel);
        }
    },

    aprobarDesdeFormulario: function(id) {
        Swal.fire({
            title: '¿Aprobar descriptor?',
            text: 'El descriptor pasará al flujo de firmas. Los firmantes podrán firmar en cualquier orden.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, aprobar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#198754'
        }).then(function(result) {
            if (!result.isConfirmed) return;

            THService.aprobar(id);
            DescriptorService.registrarEvento(id, {
                accion: 'APROBACIÓN POR TH GENERALISTA',
                usuario: THController.currentUser.nombre,
                rol: THController.currentUser.rolNombre,
                estadoNuevo: 'APROBADO_TH',
                estado: 'FIRMA_JTH'
            });

            Swal.fire('Aprobado', 'Descriptor enviado para firmas. Los firmantes podrán firmar en cualquier orden.', 'success').then(function() {
                THController.loadView();
            });
        });
    },

    observarDesdeFormulario: function(id) {
        Swal.fire({
            title: 'Observaciones',
            html: '<div class="text-start px-1"><label for="observacionesTH" class="form-label fw-semibold">Detalle de la observación</label><textarea id="observacionesTH" class="form-control" placeholder="Escriba las observaciones..." rows="5" style="resize: vertical;"></textarea></div>',
            width: '560px',
            showCancelButton: true,
            confirmButtonText: 'Enviar observación',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#0d6efd',
            preConfirm: function() {
                var obs = document.getElementById('observacionesTH').value;
                if (!obs || obs.trim() === '') {
                    Swal.showValidationMessage('Debe ingresar observaciones');
                    return false;
                }
                return obs.trim();
            }
        }).then(function(result) {
            if (!result.isConfirmed || !result.value) return;

            THService.observar(id, result.value);
            DescriptorService.registrarEvento(id, {
                accion: 'OBSERVACIÓN POR TH GENERALISTA',
                usuario: THController.currentUser.nombre,
                rol: THController.currentUser.rolNombre,
                estado: 'OBSERVADO_TH',
                observacion: result.value
            });

            Swal.fire('Observado', 'Descriptor devuelto con observaciones.', 'warning').then(function() {
                THController.loadView();
            });
        });
    },
    
    verDetalle: function(id) {
        var descriptor = THService.getById(id);
        if (!descriptor) return;
        this.abrirFormularioRevision(id, descriptor);
        return;
        var puedeGestionar = descriptor.estado === 'ENVIADO_TH';
        var esExtensa = (descriptor.tipoFormato || 'CORTA') === 'EXTENSA';
        var tipoFormatoTexto = esExtensa ? 'Versión extensa' : 'Versión corta';
        
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
            kpisHtml = '<div class="table-responsive"><table class="table table-sm table-bordered descriptor-detail-table">' +
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
            kpisHtml += '</tbody></table></div>';
        } else {
            kpisHtml = '<p class="text-muted">No hay KPIs registrados</p>';
        }
        
        // Perfil del Puesto - CORREGIDO
        var perfilHtml = '';
        if (descriptor.perfil) {
            perfilHtml = '<div class="row g-2 descriptor-detail-grid">' +
                '<div class="col-md-6"><div class="detail-field"><span>Edad mínima</span><strong>' + (descriptor.perfil.edadMin || '-') + ' años</strong></div></div>' +
                '<div class="col-md-6"><div class="detail-field"><span>Edad máxima</span><strong>' + (descriptor.perfil.edadMax || '-') + ' años</strong></div></div>' +
                '<div class="col-md-6"><div class="detail-field"><span>Sexo</span><strong>' + (descriptor.perfil.sexo === 'INDIFERENTE' ? 'Indiferente' : (descriptor.perfil.sexo === 'MASCULINO' ? 'Masculino' : 'Femenino')) + '</strong></div></div>' +
                '<div class="col-md-6"><div class="detail-field"><span>Estado familiar</span><strong>' + (descriptor.perfil.estadoFamiliar === 'INDIFERENTE' ? 'Indiferente' : (descriptor.perfil.estadoFamiliar || '-')) + '</strong></div></div>' +
                '<div class="col-md-6"><div class="detail-field"><span>Disponibilidad horaria</span><strong>' + (descriptor.perfil.disponibilidadHorario === 'TIEMPO_COMPLETO' ? 'Tiempo Completo' : (descriptor.perfil.disponibilidadHorario === 'MEDIO_TIEMPO' ? 'Medio Tiempo' : descriptor.perfil.disponibilidadHorario || '-')) + '</strong></div></div>' +
                '<div class="col-md-6"><div class="detail-field"><span>Modalidad de trabajo</span><strong>' + (descriptor.perfil.modalidadTrabajo === 'PRESENCIAL' ? 'Presencial' : (descriptor.perfil.modalidadTrabajo === 'HIBRIDO' ? 'Híbrido' : (descriptor.perfil.modalidadTrabajo === 'REMOTO' ? 'Remoto' : descriptor.perfil.modalidadTrabajo || '-'))) + '</strong></div></div>' +
                '<div class="col-md-6"><div class="detail-field"><span>Poseer licencia</span><strong>' + (descriptor.perfil.poseerLicencia == '1' ? 'Sí' : 'No') + '</strong></div></div>' +
                '</div>';
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
        
        var reportesHtml = '';
        if (descriptor.estado === 'ACTIVO') {
            reportesHtml = esExtensa
                ? '<div class="btn-group w-100 mb-3" role="group"><button type="button" class="btn btn-sm btn-secondary" onclick="generarVersionExtensa(' + id + ')"><i class="fas fa-file-pdf"></i> Versión Extensa</button></div>'
                : '<div class="btn-group w-100 mb-3" role="group"><button type="button" class="btn btn-sm btn-success" onclick="generarVersionCorta(' + id + ')"><i class="fas fa-file-pdf"></i> Versión Corta</button></div>';
        }
        var avisoSoloLectura = !puedeGestionar
            ? '<div class="alert alert-warning"><i class="fas fa-clock"></i> Este descriptor no está pendiente de revisión técnica. Si fue observado por TH, deberá esperar a que el Jefe Inmediato lo corrija y lo reenvíe para poder aprobar, observar o complementar nuevamente.</div>'
            : '';
        var puedeCompletarTH = puedeGestionar && esExtensa;
        var botonEditarRelacionesInternas = puedeCompletarTH ? '<button class="btn btn-sm btn-outline-primary mt-2" onclick="THController.editarRelacionesInternas(' + id + ')"><i class="fas fa-edit"></i> Editar Relaciones Internas</button>' : '';
        var botonEditarRelacionesExternas = puedeCompletarTH ? '<button class="btn btn-sm btn-outline-primary mt-2" onclick="THController.editarRelacionesExternas(' + id + ')"><i class="fas fa-edit"></i> Editar Relaciones Externas</button>' : '';
        var botonEditarRequerimientos = puedeCompletarTH ? '<button class="btn btn-sm btn-outline-primary mt-2" onclick="THController.editarRequerimientos(' + id + ')"><i class="fas fa-edit"></i> Editar Requerimientos</button>' : '';
        var botonEditarRiesgos = puedeCompletarTH ? '<button class="btn btn-sm btn-outline-primary mt-2" onclick="THController.editarRiesgos(' + id + ')"><i class="fas fa-edit"></i> Editar Riesgos</button>' : '';
        var complementosTHHtml = esExtensa
            ? '<h6 class="border-bottom pb-2 mt-3 text-primary">V. RELACIONES LABORALES <small>(Editable por TH)</small></h6>' +
              '<div class="mb-3"><label class="fw-bold">Relaciones Internas</label>' +
              '<div id="modalRelacionesInternas">' + relacionesInternasHtml + '</div>' +
              botonEditarRelacionesInternas + '</div>' +
              '<div class="mb-3"><label class="fw-bold">Relaciones Externas</label>' +
              '<div id="modalRelacionesExternas">' + relacionesExternasHtml + '</div>' +
              botonEditarRelacionesExternas + '</div>' +
              '<h6 class="border-bottom pb-2 mt-3 text-primary">VI. REQUERIMIENTOS ORGANIZACIONALES <small>(Editable por TH)</small></h6>' +
              '<div><div id="modalRequerimientos">' + requerimientosHtml + '</div>' +
              botonEditarRequerimientos + '</div>' +
              '<h6 class="border-bottom pb-2 mt-3 text-primary">VII. RIESGOS FISICOS DEL PUESTO <small>(Editable por TH)</small></h6>' +
              '<div><div id="modalRiesgos">' + riesgosHtml + '</div>' +
              botonEditarRiesgos + '</div>'
            : '<div class="alert alert-secondary mt-3"><i class="fas fa-info-circle"></i> Este descriptor es de versión corta, por lo que no requiere complementos técnicos de TH.</div>';
        var modalHtml = '<style>' +
            '.descriptor-detail-modal{max-height:60vh;overflow-y:auto;padding-right:6px;text-align:left;}' +
            '.descriptor-detail-modal h6{font-weight:700;margin-top:18px;}' +
            '.descriptor-detail-table th,.descriptor-detail-table td{white-space:normal;word-break:break-word;vertical-align:top;}' +
            '.detail-field{border:1px solid #dee2e6;border-radius:8px;padding:10px 12px;min-height:68px;background:#f8f9fa;}' +
            '.detail-field span{display:block;font-size:.78rem;color:#6c757d;margin-bottom:4px;text-transform:uppercase;letter-spacing:.02em;}' +
            '.detail-field strong{display:block;font-size:.95rem;color:#212529;white-space:normal;word-break:break-word;}' +
            'body.dark-mode .detail-field{background:#111827;border-color:#4b5563;}' +
            'body.dark-mode .detail-field span{color:#cbd5e1;}' +
            'body.dark-mode .detail-field strong{color:#f9fafb;}' +
            'body.dark-mode .descriptor-detail-table td,body.dark-mode .descriptor-detail-table th{background:#1f2937!important;color:#e5e7eb!important;}' +
            '</style>' +
            '<div class="descriptor-detail-modal">' +
            '<div class="alert alert-info mb-3"><i class="fas fa-info-circle"></i> <strong>Descriptor:</strong> ' + (descriptor.codigo || 'DES-' + id) + '<br><strong>Formato:</strong> ' + tipoFormatoTexto + '<br><strong>Puesto:</strong> ' + (descriptor.puesto || '-') + '<br><strong>Creador:</strong> ' + (descriptor.creador || '-') + '<br><strong>Fecha:</strong> ' + (descriptor.fechaEmision || '-') + '</div>' +
            avisoSoloLectura +
            reportesHtml +
            
            '<h6 class="border-bottom pb-2">Información General</h6>' +
            '<p><strong>Área:</strong> ' + (descriptor.area || '-') + '<br><strong>Reporta a:</strong> ' + (descriptor.reportaA || '-') + '</p>' +
            
            '<h6 class="border-bottom pb-2 mt-3">Objetivo del Puesto</h6>' +
            '<p>' + (descriptor.objetivo || '-') + '</p>' +
            
            '<h6 class="border-bottom pb-2 mt-3">Funciones Claves</h6>' +
            funcionesHtml +
            
            '<h6 class="border-bottom pb-2 mt-3">Indicadores de Desempeño (KPIs)</h6>' +
            kpisHtml +
            
            complementosTHHtml +
            
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
            showCancelButton: puedeGestionar,
            showDenyButton: puedeGestionar,
            confirmButtonText: puedeGestionar ? '<i class="fas fa-check"></i> Aprobar' : 'Cerrar',
            denyButtonText: '<i class="fas fa-times"></i> Observar',
            cancelButtonText: 'Cerrar',
            confirmButtonColor: '#198754',
            denyButtonColor: '#ffc107',
            preConfirm: function() {
                if (!puedeGestionar) {
                    return true;
                }
                return Swal.fire({ title: 'Aprobar Descriptor', text: '¿Está seguro de aprobar este descriptor? Se enviará para firmas.', icon: 'question', showCancelButton: true, confirmButtonText: 'Sí' })
                    .then(function(result) {
                        if (result.isConfirmed) {
                            THService.aprobar(id);
                            DescriptorService.registrarEvento(id, {
                                accion: 'APROBACIÓN POR TH GENERALISTA',
                                usuario: THController.currentUser.nombre,
                                rol: THController.currentUser.rolNombre,
                                estadoNuevo: 'APROBADO_TH',
                                estado: 'FIRMA_JTH'
                            });
                            Swal.fire('Aprobado', 'Descriptor enviado para firmas. Los firmantes podrán firmar en cualquier orden.', 'success').then(function() {
                                THController.cargarPendientes();
                                THController.cargarGestionados();
                            });
                        }
                        return false;
                    });
            },
            preDeny: function() {
                return Swal.fire({
                    title: 'Observaciones',
                    html: '<div class="text-start px-1"><label for="observacionesTH" class="form-label fw-semibold">Detalle de la observación</label><textarea id="observacionesTH" class="form-control" placeholder="Escriba las observaciones..." rows="5" style="resize: vertical;"></textarea></div>',
                    width: '560px',
                    showCancelButton: true,
                    confirmButtonText: 'Enviar',
                    cancelButtonText: 'Cancelar',
                    confirmButtonColor: '#0d6efd',
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
                        Swal.fire('Observado', 'Descriptor devuelto con observaciones', 'warning').then(function() {
                            THController.cargarPendientes();
                            THController.cargarGestionados();
                        });
                    }
                    return false;
                });
            }
        });
    },
    
    validarComplementoExtenso: function(descriptor) {
        if (!descriptor) return false;
        if ((descriptor.tipoFormato || 'CORTA') !== 'EXTENSA') {
            Swal.fire('No aplica', 'Los complementos de TH solo se llenan para descriptores de versión extensa.', 'info');
            return false;
        }
        return true;
    },
    
    editarRelacionesInternas: function(id) {
        var descriptor = THService.getById(id);
        if (!this.validarComplementoExtenso(descriptor)) return;
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
        if (!this.validarComplementoExtenso(descriptor)) return;
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
        if (!this.validarComplementoExtenso(descriptor)) return;
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
        if (!this.validarComplementoExtenso(descriptor)) return;
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
    $('#relacionesInternasEditor > button').before('<div class="row mb-2"><div class="col-5"><input type="text" class="form-control" name="relInternaPuesto" placeholder="Puesto/Área"></div><div class="col-5"><input type="text" class="form-control" name="relInternaRazon" placeholder="Razón"></div><div class="col-2"><button type="button" class="btn btn-sm btn-danger" onclick="$(this).closest(\'.row\').remove()"><i class="fas fa-trash"></i></button></div></div>'); 
};

window.agregarRelacionExterna = function() { 
    $('#relacionesExternasEditor > button').before('<div class="row mb-2"><div class="col-5"><input type="text" class="form-control" name="relExternaEntidad" placeholder="Entidad externa"></div><div class="col-5"><input type="text" class="form-control" name="relExternaRazon" placeholder="Razón"></div><div class="col-2"><button type="button" class="btn btn-sm btn-danger" onclick="$(this).closest(\'.row\').remove()"><i class="fas fa-trash"></i></button></div></div>'); 
};

window.agregarRequerimiento = function() { 
    $('#requerimientosEditor > button').before('<div class="row mb-2"><div class="col-10"><input type="text" class="form-control" name="requerimiento" placeholder="Requerimiento organizacional"></div><div class="col-2"><button type="button" class="btn btn-sm btn-danger" onclick="$(this).closest(\'.row\').remove()"><i class="fas fa-trash"></i></button></div></div>'); 
};

window.agregarRiesgo = function() { 
    $('#riesgosLista').append('<div class="row mb-2"><div class="col-10"><input type="text" class="form-control" name="riesgo" placeholder="Riesgo profesional"></div><div class="col-2"><button type="button" class="btn btn-sm btn-danger" onclick="$(this).closest(\'.row\').remove()"><i class="fas fa-trash"></i></button></div></div>'); 
};

window.THController = THController;