// Controlador de Áreas, Puestos y Jefes Inmediatos
var AreasPuestosController = {
    currentUser: null,
    navigationToken: null,
    tipoCatalogo: 'areas',

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
            puestos: { title: 'Catálogo de Puestos', path: 'modulos/frmAreasPuestos/view/puestosView.html' },
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
    },

    render: function() {
        this.renderSelects();
        this.renderTable();
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

    renderTable: function() {
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
            var puestos = (area.puestos || []).map(function(puesto) {
                var activo = puesto.activo !== false;
                var aprobado = puesto.aprobado === true;
                var estadoBadge = activo ? '<span class="badge bg-success ms-1">Activo</span>' : '<span class="badge bg-secondary ms-1">Inactivo</span>';
                var aprobacionBadge = aprobado ? '<span class="badge bg-primary ms-1">Aprobado</span>' : '<span class="badge bg-warning text-dark ms-1">Pendiente</span>';
                var acciones = '';
                if (!aprobado && AreasPuestosController.currentUser.rol === 'JEFE_TH') {
                    acciones += '<button type="button" class="btn btn-sm btn-outline-success ms-1 btn-aprobar-puesto" data-area="' + area.nombre + '" data-puesto="' + puesto.nombre + '">Aprobar</button>';
                }
                acciones += activo
                    ? '<button type="button" class="btn btn-sm btn-outline-danger ms-1 btn-estado-puesto" data-area="' + area.nombre + '" data-puesto="' + puesto.nombre + '" data-activo="false">Inactivar</button>'
                    : '<button type="button" class="btn btn-sm btn-outline-primary ms-1 btn-estado-puesto" data-area="' + area.nombre + '" data-puesto="' + puesto.nombre + '" data-activo="true">Activar</button>';
                return '<div class="mb-2"><span class="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle">' + puesto.nombre + '</span>' + estadoBadge + aprobacionBadge + acciones + '</div>';
            }).join('') || '<span class="text-muted">Sin puestos</span>';
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
    }
};

window.AreasPuestosController = AreasPuestosController;
