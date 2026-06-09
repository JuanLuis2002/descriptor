// Servicio para Listar Descriptores
var DescriptorListService = {
    getByCreador: function(creador) {
        return DescriptorService.getAll().filter(d => d.creador === creador);
    },

    getByUsuario: function(user) {
        var todos = DescriptorService.getAll();
        if (!user) return [];
        if (user.rol === 'TH_GENERALISTA' || user.rol === 'JEFE_TH') {
            return todos;
        }
        if (user.rol === 'JEFE_INMEDIATO') {
            return todos.filter(function(d) {
                var jefeAsignado = '';
                if (typeof AreasPuestosService !== 'undefined') {
                    var area = AreasPuestosService.getAreaByNombre(d.area);
                    jefeAsignado = area ? area.jefeInmediatoUsuario : '';
                }
                var perteneceAlAreaAsignada = jefeAsignado
                    ? jefeAsignado === user.usuario
                    : user.area === d.area;
                return d.creador === user.nombre ||
                    (d.flujoCreadoPorTH && perteneceAlAreaAsignada && ['REVISION_JI_TH', 'REVISION_CAMBIOS_TH', 'ACTIVO', 'INACTIVO'].indexOf(d.estado) !== -1);
            });
        }
        return todos.filter(function(d) { return d.creador === user.nombre; });
    },
    
    getByEstado: function(estado) {
        return DescriptorService.getAll().filter(d => d.estado === estado);
    },
    
    search: function(descriptores, termino) {
        var term = termino.toLowerCase();
        return descriptores.filter(function(d) {
            return (d.codigo || '').toLowerCase().includes(term) ||
                   (d.puesto || '').toLowerCase().includes(term) ||
                   (d.area || '').toLowerCase().includes(term);
        });
    },
    
    filterByEstado: function(descriptores, estado) {
        if (!estado) return descriptores;
        return descriptores.filter(function(d) { return d.estado === estado; });
    },
    
    sort: function(descriptores, criterio) {
        var sorted = [...descriptores];
        if (criterio === 'fecha') {
            return sorted.sort(function(a, b) {
                var fechaA = a.fechaEmision || (a.fechaCreacion ? a.fechaCreacion.split('T')[0] : '');
                var fechaB = b.fechaEmision || (b.fechaCreacion ? b.fechaCreacion.split('T')[0] : '');
                return new Date(fechaB) - new Date(fechaA);
            });
        } else if (criterio === 'puesto') {
            return sorted.sort(function(a, b) { return (a.puesto || '').localeCompare(b.puesto || ''); });
        } else if (criterio === 'estado') {
            return sorted.sort(function(a, b) { return (a.estado || '').localeCompare(b.estado || ''); });
        }
        return sorted;
    },
    
    getEstadisticas: function(creador) {
        var user = typeof creador === 'object' ? creador : { nombre: creador };
        var descriptores = this.getByUsuario(user);
        return {
            total: descriptores.length,
            borradores: descriptores.filter(function(d) { return d.estado === 'BORRADOR'; }).length,
            revisionJI: descriptores.filter(function(d) { return d.estado === 'REVISION_JI_TH'; }).length,
            revisionCambiosTH: descriptores.filter(function(d) { return d.estado === 'REVISION_CAMBIOS_TH'; }).length,
            enviadosJF: descriptores.filter(function(d) { return d.estado === 'ENVIADO_JF'; }).length,
            observadosJF: descriptores.filter(function(d) { return d.estado === 'OBSERVADO_JF'; }).length,
            enviadosTH: descriptores.filter(function(d) { return d.estado === 'ENVIADO_TH'; }).length,
            observadosTH: descriptores.filter(function(d) { return d.estado === 'OBSERVADO_TH'; }).length,
            activos: descriptores.filter(function(d) { return d.estado === 'ACTIVO'; }).length,
            inactivos: descriptores.filter(function(d) { return d.estado === 'INACTIVO'; }).length
        };
    }
};

window.DescriptorListService = DescriptorListService;