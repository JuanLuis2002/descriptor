// Controlador de Áreas, Puestos y Jefes Inmediatos
var AreasPuestosController = {
    currentUser: null,
    navigationToken: null,

    init: function(user, options) {
        this.currentUser = user;
        this.navigationToken = options && options.navigationToken ? options.navigationToken : (window._currentNavigationToken || null);
        if (!user || (user.rol !== 'TH_GENERALISTA' && user.rol !== 'JEFE_TH')) {
            $('#contentContainer').html('<div class="alert alert-warning">No tiene permisos para administrar áreas y puestos.</div>');
            return;
        }
        this.loadView();
    },

    loadView: function() {
        var self = this;
        var token = this.navigationToken;
        $('#pageTitle').text('Áreas, Puestos y Jefes Inmediatos');
        $('#contentContainer').empty();

        $.get('modulos/frmAreasPuestos/view/areasPuestosView.html', function(html) {
            if (token && typeof window.isCurrentNavigationToken === 'function' && !window.isCurrentNavigationToken(token)) return;
            $('#contentContainer').html(html);
            self.bindEvents();
            self.render();
        }).fail(function() {
            $('#contentContainer').html('<div class="alert alert-danger">Error al cargar el formulario de áreas y puestos.</div>');
        });
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
            var result = AreasPuestosService.crearPuesto(area, puesto, reportaA);
            if (!result.ok) {
                Swal.fire('Validación', result.mensaje, 'warning');
                return;
            }
            Swal.fire('Guardado', 'Puesto creado correctamente.', 'success');
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

        var jefeOptions = '<option value="">Sin asignar</option>';
        for (var j = 0; j < jefes.length; j++) {
            jefeOptions += '<option value="' + jefes[j].usuario + '">' + jefes[j].nombre + ' - ' + jefes[j].area + '</option>';
        }
        $('.jefe-select').html(jefeOptions);
    },

    renderTable: function() {
        var areas = AreasPuestosService.getAreas();
        var jefes = AreasPuestosService.getJefesInmediatos();
        var jefesMap = {};
        for (var j = 0; j < jefes.length; j++) {
            jefesMap[jefes[j].usuario] = jefes[j].nombre;
        }

        var html = '';
        for (var i = 0; i < areas.length; i++) {
            var area = areas[i];
            var puestos = (area.puestos || []).map(function(puesto) {
                return '<span class="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle me-1 mb-1">' + puesto.nombre + '</span>';
            }).join('') || '<span class="text-muted">Sin puestos</span>';
            html += '<tr>' +
                '<td><strong>' + area.nombre + '</strong></td>' +
                '<td>' + (jefesMap[area.jefeInmediatoUsuario] || '<span class="text-muted">Sin asignar</span>') + '</td>' +
                '<td>' + puestos + '</td>' +
                '</tr>';
        }
        $('#areasPuestosTableBody').html(html);
    }
};

window.AreasPuestosController = AreasPuestosController;
