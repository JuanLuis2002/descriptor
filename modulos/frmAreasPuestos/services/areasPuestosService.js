// Servicio de Áreas, Puestos y Jefes Inmediatos
var AreasPuestosService = {
    storageKey: 'catalogoAreasPuestos',
    usersKey: 'usuariosSistema',

    defaults: {
        areas: [
            {
                id: 1,
                nombre: 'Subgerencia TI',
                jefeInmediatoUsuario: 'juan.hercules',
                puestos: [
                    { id: 1, nombre: 'Analista Programador', reportaA: 'Ing. Mauricio Rivas' },
                    { id: 2, nombre: 'Desarrollador de Software', reportaA: 'Ing. Carlos Menjívar' },
                    { id: 3, nombre: 'Administrador de Sistemas', reportaA: 'Ing. Ricardo Molina' },
                    { id: 4, nombre: 'Especialista en Soporte Técnico', reportaA: 'Ing. Fernando Aguilar' },
                    { id: 5, nombre: 'Coordinador de Infraestructura TI', reportaA: 'Ing. Esteban Figueroa' }
                ]
            },
            {
                id: 2,
                nombre: 'Talento Humano',
                jefeInmediatoUsuario: '',
                puestos: [
                    { id: 1, nombre: 'Analista de Recursos Humanos', reportaA: 'Licda. Patricia Méndez' },
                    { id: 2, nombre: 'Generalista de Talento Humano', reportaA: 'Lic. Roberto Salinas' }
                ]
            },
            {
                id: 3,
                nombre: 'Finanzas',
                jefeInmediatoUsuario: '',
                puestos: [
                    { id: 1, nombre: 'Analista Financiero', reportaA: 'Lic. Karla Pineda' },
                    { id: 2, nombre: 'Contador General', reportaA: 'Lic. Mario Escobar' }
                ]
            },
            {
                id: 4,
                nombre: 'Administración',
                jefeInmediatoUsuario: '',
                puestos: [
                    { id: 1, nombre: 'Asistente Administrativo', reportaA: 'Licda. Mónica Castillo' },
                    { id: 2, nombre: 'Coordinador Administrativo', reportaA: 'Lic. Ernesto Varela' }
                ]
            },
            {
                id: 5,
                nombre: 'Mercadeo y Comunicaciones',
                jefeInmediatoUsuario: '',
                puestos: [
                    { id: 1, nombre: 'Analista de Mercadeo', reportaA: 'Licda. Sofía Aguiluz' },
                    { id: 2, nombre: 'Coordinador de Comunicaciones', reportaA: 'Lic. Daniel Fuentes' }
                ]
            }
        ]
    },

    getCatalogo: function() {
        var data = localStorage.getItem(this.storageKey);
        if (!data) {
            localStorage.setItem(this.storageKey, JSON.stringify(this.defaults));
            return JSON.parse(JSON.stringify(this.defaults));
        }
        return JSON.parse(data);
    },

    saveCatalogo: function(catalogo) {
        localStorage.setItem(this.storageKey, JSON.stringify(catalogo));
        return catalogo;
    },

    getAreas: function() {
        return this.getCatalogo().areas || [];
    },

    getAreaByNombre: function(nombre) {
        return this.getAreas().filter(function(area) { return area.nombre === nombre; })[0] || null;
    },

    crearArea: function(nombre, jefeInmediatoUsuario) {
        var catalogo = this.getCatalogo();
        var existe = catalogo.areas.some(function(area) { return area.nombre.toLowerCase() === nombre.toLowerCase(); });
        if (existe) return { ok: false, mensaje: 'Ya existe un área con ese nombre.' };
        catalogo.areas.push({
            id: Date.now(),
            nombre: nombre,
            jefeInmediatoUsuario: jefeInmediatoUsuario || '',
            puestos: []
        });
        this.saveCatalogo(catalogo);
        return { ok: true };
    },

    actualizarJefeArea: function(nombreArea, usuario) {
        var catalogo = this.getCatalogo();
        var area = catalogo.areas.filter(function(item) { return item.nombre === nombreArea; })[0];
        if (!area) return false;
        area.jefeInmediatoUsuario = usuario || '';
        this.saveCatalogo(catalogo);
        if (usuario) {
            var usuarios = this.getUsuarios();
            if (usuarios[usuario]) {
                usuarios[usuario].area = nombreArea;
                this.saveUsuarios(usuarios);
            }
        }
        return true;
    },

    crearPuesto: function(nombreArea, nombrePuesto, reportaA) {
        var catalogo = this.getCatalogo();
        var area = catalogo.areas.filter(function(item) { return item.nombre === nombreArea; })[0];
        if (!area) return { ok: false, mensaje: 'Seleccione un área válida.' };
        area.puestos = area.puestos || [];
        var existe = area.puestos.some(function(puesto) { return puesto.nombre.toLowerCase() === nombrePuesto.toLowerCase(); });
        if (existe) return { ok: false, mensaje: 'Ya existe un puesto con ese nombre en el área seleccionada.' };
        area.puestos.push({
            id: Date.now(),
            nombre: nombrePuesto,
            reportaA: reportaA || ''
        });
        this.saveCatalogo(catalogo);
        return { ok: true };
    },

    getUsuarios: function() {
        var data = localStorage.getItem(this.usersKey);
        return data ? JSON.parse(data) : {};
    },

    saveUsuarios: function(usuarios) {
        localStorage.setItem(this.usersKey, JSON.stringify(usuarios));
        return usuarios;
    },

    getJefesInmediatos: function() {
        var usuarios = this.getUsuarios();
        var lista = [
            { usuario: 'juan.hercules', nombre: 'Ing. Juan Hércules', area: 'Subgerencia TI' }
        ];
        Object.keys(usuarios).forEach(function(usuario) {
            if (usuarios[usuario].rol === 'JEFE_INMEDIATO') {
                lista.push({
                    usuario: usuario,
                    nombre: usuarios[usuario].nombre,
                    area: usuarios[usuario].area
                });
            }
        });
        return lista;
    },

    crearJefeInmediato: function(usuario, nombre, password, area) {
        var usuarios = this.getUsuarios();
        if (usuarios[usuario]) return { ok: false, mensaje: 'Ya existe un usuario con ese nombre.' };
        usuarios[usuario] = {
            nombre: nombre,
            password: password || '123456',
            rol: 'JEFE_INMEDIATO',
            rolNombre: 'Jefe Inmediato',
            area: area
        };
        this.saveUsuarios(usuarios);
        this.actualizarJefeArea(area, usuario);
        return { ok: true };
    }
};

window.AreasPuestosService = AreasPuestosService;
