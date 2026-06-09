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
                    { id: 1, nombre: 'Analista Programador', reportaA: 'Ing. Mauricio Rivas', activo: true, aprobado: true },
                    { id: 2, nombre: 'Desarrollador de Software', reportaA: 'Ing. Carlos Menjívar', activo: true, aprobado: true },
                    { id: 3, nombre: 'Administrador de Sistemas', reportaA: 'Ing. Ricardo Molina', activo: true, aprobado: true },
                    { id: 4, nombre: 'Especialista en Soporte Técnico', reportaA: 'Ing. Fernando Aguilar', activo: true, aprobado: true },
                    { id: 5, nombre: 'Coordinador de Infraestructura TI', reportaA: 'Ing. Esteban Figueroa', activo: true, aprobado: true }
                ]
            },
            {
                id: 2,
                nombre: 'Talento Humano',
                jefeInmediatoUsuario: '',
                puestos: [
                    { id: 1, nombre: 'Analista de Recursos Humanos', reportaA: 'Licda. Patricia Méndez', activo: true, aprobado: true },
                    { id: 2, nombre: 'Generalista de Talento Humano', reportaA: 'Lic. Roberto Salinas', activo: true, aprobado: true }
                ]
            },
            {
                id: 3,
                nombre: 'Finanzas',
                jefeInmediatoUsuario: '',
                puestos: [
                    { id: 1, nombre: 'Analista Financiero', reportaA: 'Lic. Karla Pineda', activo: true, aprobado: true },
                    { id: 2, nombre: 'Contador General', reportaA: 'Lic. Mario Escobar', activo: true, aprobado: true }
                ]
            },
            {
                id: 4,
                nombre: 'Administración',
                jefeInmediatoUsuario: '',
                puestos: [
                    { id: 1, nombre: 'Asistente Administrativo', reportaA: 'Licda. Mónica Castillo', activo: true, aprobado: true },
                    { id: 2, nombre: 'Coordinador Administrativo', reportaA: 'Lic. Ernesto Varela', activo: true, aprobado: true }
                ]
            },
            {
                id: 5,
                nombre: 'Mercadeo y Comunicaciones',
                jefeInmediatoUsuario: '',
                puestos: [
                    { id: 1, nombre: 'Analista de Mercadeo', reportaA: 'Licda. Sofía Aguiluz', activo: true, aprobado: true },
                    { id: 2, nombre: 'Coordinador de Comunicaciones', reportaA: 'Lic. Daniel Fuentes', activo: true, aprobado: true }
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
        var catalogo = JSON.parse(data);
        var changed = false;
        (catalogo.areas || []).forEach(function(area) {
            (area.puestos || []).forEach(function(puesto) {
                if (typeof puesto.activo === 'undefined') {
                    puesto.activo = true;
                    changed = true;
                }
                if (typeof puesto.aprobado === 'undefined') {
                    puesto.aprobado = true;
                    changed = true;
                }
            });
        });
        if (changed) this.saveCatalogo(catalogo);
        return catalogo;
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

    crearPuesto: function(nombreArea, nombrePuesto, reportaA, usuarioCreador) {
        var catalogo = this.getCatalogo();
        var area = catalogo.areas.filter(function(item) { return item.nombre === nombreArea; })[0];
        if (!area) return { ok: false, mensaje: 'Seleccione un área válida.' };
        area.puestos = area.puestos || [];
        var existe = area.puestos.some(function(puesto) { return puesto.nombre.toLowerCase() === nombrePuesto.toLowerCase(); });
        if (existe) return { ok: false, mensaje: 'Ya existe un puesto con ese nombre en el área seleccionada.' };
        var aprobado = usuarioCreador && usuarioCreador.rol === 'JEFE_TH';
        area.puestos.push({
            id: Date.now(),
            nombre: nombrePuesto,
            reportaA: reportaA || '',
            activo: true,
            aprobado: aprobado,
            creadoPor: usuarioCreador ? usuarioCreador.nombre : '',
            rolCreador: usuarioCreador ? usuarioCreador.rol : '',
            fechaCreacion: new Date().toISOString(),
            fechaAprobacion: aprobado ? new Date().toISOString() : null,
            aprobadoPor: aprobado && usuarioCreador ? usuarioCreador.nombre : ''
        });
        this.saveCatalogo(catalogo);
        return { ok: true };
    },

    getPuesto: function(nombreArea, nombrePuesto) {
        var area = this.getAreaByNombre(nombreArea);
        if (!area) return null;
        return (area.puestos || []).filter(function(puesto) {
            return puesto.nombre === nombrePuesto;
        })[0] || null;
    },

    aprobarPuesto: function(nombreArea, nombrePuesto, usuario) {
        var catalogo = this.getCatalogo();
        var area = catalogo.areas.filter(function(item) { return item.nombre === nombreArea; })[0];
        if (!area) return { ok: false, mensaje: 'Área no encontrada.' };
        var puesto = (area.puestos || []).filter(function(item) { return item.nombre === nombrePuesto; })[0];
        if (!puesto) return { ok: false, mensaje: 'Puesto no encontrado.' };
        puesto.aprobado = true;
        puesto.activo = true;
        puesto.fechaAprobacion = new Date().toISOString();
        puesto.aprobadoPor = usuario ? usuario.nombre : '';
        this.saveCatalogo(catalogo);
        return { ok: true };
    },

    cambiarEstadoPuesto: function(nombreArea, nombrePuesto, activo) {
        var catalogo = this.getCatalogo();
        var area = catalogo.areas.filter(function(item) { return item.nombre === nombreArea; })[0];
        if (!area) return { ok: false, mensaje: 'Área no encontrada.' };
        var puesto = (area.puestos || []).filter(function(item) { return item.nombre === nombrePuesto; })[0];
        if (!puesto) return { ok: false, mensaje: 'Puesto no encontrado.' };
        puesto.activo = !!activo;
        this.saveCatalogo(catalogo);
        return { ok: true };
    },

    puestoAprobado: function(nombreArea, nombrePuesto) {
        var puesto = this.getPuesto(nombreArea, nombrePuesto);
        if (!puesto) return true;
        return !!(puesto.activo && puesto.aprobado);
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

    getColaboradores: function() {
        var usuarios = this.getUsuarios();
        var lista = [
            { usuario: 'juan.perez', nombre: 'Ing. Juan Pérez', puesto: 'Analista Programador' }
        ];
        Object.keys(usuarios).forEach(function(usuario) {
            if (usuarios[usuario].rol === 'COLABORADOR') {
                lista.push({
                    usuario: usuario,
                    nombre: usuarios[usuario].nombre,
                    puesto: usuarios[usuario].area
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
    },

    crearColaborador: function(usuario, nombre, password, puesto) {
        var usuarios = this.getUsuarios();
        if (usuarios[usuario]) return { ok: false, mensaje: 'Ya existe un usuario con ese nombre.' };
        usuarios[usuario] = {
            nombre: nombre,
            password: password || '123456',
            rol: 'COLABORADOR',
            rolNombre: 'Colaborador',
            area: puesto
        };
        this.saveUsuarios(usuarios);
        return { ok: true };
    }
};

window.AreasPuestosService = AreasPuestosService;
