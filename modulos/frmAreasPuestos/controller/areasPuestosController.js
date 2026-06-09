// Controlador de Áreas, Puestos y Jefes Inmediatos
var AreasPuestosController = {
    currentUser: null,
    navigationToken: null,
    tipoCatalogo: 'areas',
    areaSeleccionada: null,

    init: function(user, options) {
        this.currentUser = user;
        this.navigationToken = options && options.navigationToken ? options.navigationToken : (window._currentNavigationToken || null);
        this.tipoCatalogo = options && options.tipoCatalogo ? options.tipoCatalogo : 'areas';
        if (!user || (user.rol !== 'TH_GENERALISTA' && user.rol !== 'JEFE_TH')) {
            $('#contentContainer').html('<div class="alert alert-warning">No tiene permisos para administrar áreas y puestos.</div>');
            return;
        }
        this.loadView();
    },

    loadView: function() {
        var self = this;
        var token = this.navigationToken;
        var config = this.getViewConfig();
        $('#pageTitle').text(config.title);
        $('#contentContainer').empty();

        $.get(config.path, function(html) {
            if (token && typeof window.isCurrentNavigationToken === 'function' && !window.isCurrentNavigationToken(token)) return;
            $('#contentContainer').html(html);
            self.bindEvents();
            self.render();
        }).fail(function() {
            $('#contentContainer').html('<div class="alert alert-danger">Error al cargar el formulario del catálogo.</div>');
        });
    },

    getViewConfig: function() {
        var views = {
            areas: { title: 'Catálogo de Áreas', path: 'modulos/frmAreasPuestos/view/areasView.html' },
            jefes: { title: 'Catálogo de Jefes Inmediatos', path: 'modulos/frmAreasPuestos/view/jefesInmediatosView.html' },
            colaboradores: { title: 'Catálogo de Colaboradores', path: 'modulos/frmAreasPuestos/view/colaboradoresView.html' }
        };
        return views[this.tipoCatalogo] || views.areas;
    },

    bindEvents: function() {
        var self = this;
        $('#formArea').off('submit').on('submit', function(e) {
            e.preventDefault();
            var nombre = $(this).find('[name="nombreArea"]').val().trim();
            var jefe = $(this).find('[name="jefeInmediato"]').val();
            var result = AreasPuestosService.crearArea(nombre, jefe);
            if (!result.ok) {
                Swal.fire('Validación', result.mensaje, 'warning');
                return;
            }
            Swal.fire('Guardado', 'Área creada correctamente.', 'success');
            this.reset();
            self.render();
        });

        $('#formPuesto').off('submit').on('submit', function(e) {
            e.preventDefault();
            var area = $(this).find('[name="areaPuesto"]').val();
            var puesto = $(this).find('[name="nombrePuesto"]').val().trim();
            var reportaA = $(this).find('[name="reportaA"]').val().trim();
            var result = AreasPuestosService.crearPuesto(area, puesto, reportaA, self.currentUser);
            if (!result.ok) {
                Swal.fire('Validación', result.mensaje, 'warning');
                return;
            }
            var mensaje = self.currentUser.rol === 'JEFE_TH'
                ? 'Puesto creado activo y aprobado correctamente.'
                : 'Puesto creado activo y pendiente de aprobación por Jefe de TH.';
            Swal.fire('Guardado', mensaje, 'success');
            this.reset();
            self.render();
        });

        $('#formJefeInmediato').off('submit').on('submit', function(e) {
            e.preventDefault();
            var usuario = $(this).find('[name="usuario"]').val().trim().toLowerCase();
            var nombre = $(this).find('[name="nombre"]').val().trim();
            var password = $(this).find('[name="password"]').val().trim();
            var area = $(this).find('[name="area"]').val();
            var result = AreasPuestosService.crearJefeInmediato(usuario, nombre, password, area);
            if (!result.ok) {
                Swal.fire('Validación', result.mensaje, 'warning');
                return;
            }
            Swal.fire('Guardado', 'Usuario jefe inmediato creado y asignado al área.', 'success');
            this.reset();
            self.render();
        });

        $('#formColaborador').off('submit').on('submit', function(e) {
            e.preventDefault();
            var usuario = $(this).find('[name="usuario"]').val().trim().toLowerCase();
            var nombre = $(this).find('[name="nombre"]').val().trim();
            var password = $(this).find('[name="password"]').val().trim();
            var puesto = $(this).find('[name="puesto"]').val();
            var result = AreasPuestosService.crearColaborador(usuario, nombre, password, puesto);
            if (!result.ok) {
                Swal.fire('Validación', result.mensaje, 'warning');
                return;
            }
            Swal.fire('Guardado', 'Usuario colaborador creado correctamente.', 'success');
            this.reset();
            self.render();
        });

        $(document).off('click.aprobarPuesto').on('click.aprobarPuesto', '.btn-aprobar-puesto', function() {
            if (self.currentUser.rol !== 'JEFE_TH') {
                Swal.fire('No disponible', 'Solo el Jefe de TH puede aprobar puestos.', 'info');
                return;
            }
            var area = $(this).data('area');
            var puesto = $(this).data('puesto');
            var result = AreasPuestosService.aprobarPuesto(area, puesto, self.currentUser);
            if (!result.ok) {
                Swal.fire('Validación', result.mensaje, 'warning');
                return;
            }
            Swal.fire('Aprobado', 'Puesto aprobado correctamente.', 'success');
            self.render();
        });

        $(document).off('click.estadoPuesto').on('click.estadoPuesto', '.btn-estado-puesto', function() {
            var area = $(this).data('area');
            var puesto = $(this).data('puesto');
            var activo = String($(this).data('activo')) === 'true';
            var result = AreasPuestosService.cambiarEstadoPuesto(area, puesto, activo);
            if (!result.ok) {
                Swal.fire('Validación', result.mensaje, 'warning');
                return;
            }
            Swal.fire('Actualizado', activo ? 'Puesto activado.' : 'Puesto inactivado.', 'success');
            self.render();
        });

        $(document).off('click.verPuestosArea').on('click.verPuestosArea', '.btn-ver-puestos-area', function() {
            self.areaSeleccionada = $(this).data('area');
            self.render();
        });

        $(document).off('click.volverAreas').on('click.volverAreas', '#btnVolverAreas', function() {
            self.areaSeleccionada = null;
            self.render();
        });
    },

    render: function() {
        this.renderSelects();
        if (this.tipoCatalogo === 'jefes') {
            this.renderJefesTable();
        } else if (this.tipoCatalogo === 'colaboradores') {
            this.renderColaboradoresTable();
        } else {
            this.renderAreasYPuestos();
        }
    },

    renderSelects: function() {
        var areas = AreasPuestosService.getAreas();
        var jefes = AreasPuestosService.getJefesInmediatos();
        var areaOptions = '';
        for (var i = 0; i < areas.length; i++) {
            areaOptions += '<option value="' + areas[i].nombre + '">' + areas[i].nombre + '</option>';
        }
        $('.area-select').html(areaOptions);

        var puestoOptions = '';
        for (var a = 0; a < areas.length; a++) {
            var puestos = areas[a].puestos || [];
            for (var p = 0; p < puestos.length; p++) {
                if (puestos[p].activo !== false) {
                    puestoOptions += '<option value="' + puestos[p].nombre + '">' + puestos[p].nombre + ' - ' + areas[a].nombre + '</option>';
                }
            }
        }
        $('.puesto-global-select').html(puestoOptions);

        var jefeOptions = '<option value="">Sin asignar</option>';
        for (var j = 0; j < jefes.length; j++) {
            jefeOptions += '<option value="' + jefes[j].usuario + '">' + jefes[j].nombre + ' - ' + jefes[j].area + '</option>';
        }
        $('.jefe-select').html(jefeOptions);
    },

    renderAreasYPuestos: function() {
        if (this.areaSeleccionada) {
            this.renderPuestosArea();
        } else {
            this.renderAreasTable();
        }
    },

    renderAreasTable: function() {
        $('#areaListPanel').removeClass('d-none');
        $('#puestosAreaPanel').addClass('d-none');
        var areas = AreasPuestosService.getAreas();
        var jefes = AreasPuestosService.getJefesInmediatos();
        var colaboradores = AreasPuestosService.getColaboradores();
        var jefesMap = {};
        for (var j = 0; j < jefes.length; j++) {
            jefesMap[jefes[j].usuario] = jefes[j].nombre;
        }

        var html = '';
        for (var i = 0; i < areas.length; i++) {
            var area = areas[i];
            var totalPuestos = (area.puestos || []).length;
            var puestosActivos = (area.puestos || []).filter(function(puesto) { return puesto.activo !== false; }).length;
            var puestosPendientes = (area.puestos || []).filter(function(puesto) { return puesto.activo !== false && puesto.aprobado !== true; }).length;
            var puestos = '<button type="button" class="btn btn-sm btn-outline-primary btn-ver-puestos-area" data-area="' + area.nombre + '"><i class="fas fa-briefcase me-1"></i>' + totalPuestos + ' puestos</button>' +
                '<span class="badge bg-success ms-2">' + puestosActivos + ' activos</span>' +
                (puestosPendientes ? '<span class="badge bg-warning text-dark ms-2">' + puestosPendientes + ' pendientes</span>' : '');
            var colaboradoresArea = colaboradores.filter(function(colaborador) {
                return (area.puestos || []).some(function(puesto) { return puesto.nombre === colaborador.puesto; });
            });
            html += '<tr>' +
                '<td><strong>' + area.nombre + '</strong></td>' +
                '<td>' + (jefesMap[area.jefeInmediatoUsuario] || '<span class="text-muted">Sin asignar</span>') + '</td>' +
                '<td>' + puestos + '</td>' +
                '<td><span class="badge bg-warning text-dark">' + colaboradoresArea.length + ' colaboradores</span></td>' +
                '</tr>';
        }
        $('#areasPuestosTableBody').html(html);
    },

    renderPuestosArea: function() {
        var area = AreasPuestosService.getAreaByNombre(this.areaSeleccionada);
        if (!area) {
            this.areaSeleccionada = null;
            this.renderAreasTable();
            return;
        }
        $('#areaListPanel').addClass('d-none');
        $('#puestosAreaPanel').removeClass('d-none');
        $('#puestosAreaTitle').text('Puestos de ' + area.nombre);
        $('#formPuesto [name="areaPuesto"]').val(area.nombre);
        var puestos = area.puestos || [];
        var html = '';
        if (puestos.length === 0) {
            html = '<tr><td colspan="5" class="text-center text-muted py-4">No hay puestos registrados para esta área.</td></tr>';
        }
        for (var i = 0; i < puestos.length; i++) {
            var puesto = puestos[i];
            var activo = puesto.activo !== false;
            var aprobado = puesto.aprobado === true;
            var acciones = '';
            if (!aprobado && this.currentUser.rol === 'JEFE_TH') {
                acciones += '<button type="button" class="btn btn-sm btn-outline-success me-1 btn-aprobar-puesto" data-area="' + area.nombre + '" data-puesto="' + puesto.nombre + '"><i class="fas fa-check me-1"></i>Aprobar</button>';
            }
            acciones += activo
                ? '<button type="button" class="btn btn-sm btn-outline-danger btn-estado-puesto" data-area="' + area.nombre + '" data-puesto="' + puesto.nombre + '" data-activo="false"><i class="fas fa-ban me-1"></i>Inactivar</button>'
                : '<button type="button" class="btn btn-sm btn-outline-primary btn-estado-puesto" data-area="' + area.nombre + '" data-puesto="' + puesto.nombre + '" data-activo="true"><i class="fas fa-toggle-on me-1"></i>Activar</button>';
            html += '<tr>' +
                '<td><strong>' + puesto.nombre + '</strong></td>' +
                '<td>' + (puesto.reportaA || '<span class="text-muted">Sin responsable</span>') + '</td>' +
                '<td>' + (activo ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-secondary">Inactivo</span>') + '</td>' +
                '<td>' + (aprobado ? '<span class="badge bg-primary">Aprobado</span>' : '<span class="badge bg-warning text-dark">Pendiente</span>') + '</td>' +
                '<td>' + acciones + '</td>' +
                '</tr>';
        }
        $('#puestosAreaTableBody').html(html);
    },

    renderJefesTable: function() {
        var jefes = AreasPuestosService.getJefesInmediatos();
        var html = '';
        for (var i = 0; i < jefes.length; i++) {
            var area = AreasPuestosService.getAreaByNombre(jefes[i].area);
            var puestos = area && area.puestos ? area.puestos.length : 0;
            html += '<tr>' +
                '<td><strong>' + jefes[i].nombre + '</strong><br><small class="text-muted">' + jefes[i].usuario + '</small></td>' +
                '<td>' + (jefes[i].area || '-') + '</td>' +
                '<td><span class="badge bg-primary">' + puestos + ' puestos asignados al área</span></td>' +
                '</tr>';
        }
        $('#jefesTableBody').html(html || '<tr><td colspan="3" class="text-center text-muted py-4">No hay jefes inmediatos registrados.</td></tr>');
    },

    renderColaboradoresTable: function() {
        var colaboradores = AreasPuestosService.getColaboradores();
        var html = '';
        for (var i = 0; i < colaboradores.length; i++) {
            html += '<tr>' +
                '<td><strong>' + colaboradores[i].nombre + '</strong><br><small class="text-muted">' + colaboradores[i].usuario + '</small></td>' +
                '<td>' + (colaboradores[i].puesto || '-') + '</td>' +
                '<td><span class="badge bg-success">Activo</span></td>' +
                '</tr>';
        }
        $('#colaboradoresTableBody').html(html || '<tr><td colspan="3" class="text-center text-muted py-4">No hay colaboradores registrados.</td></tr>');
    }
};

window.AreasPuestosController = AreasPuestosController;
