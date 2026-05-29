// Servicio para Listar Descriptores
var DescriptorListService = {
    getByCreador: function(creador) {
        return DescriptorService.getAll().filter(d => d.creador === creador);
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
        var descriptores = this.getByCreador(creador);
        return {
            total: descriptores.length,
            borradores: descriptores.filter(function(d) { return d.estado === 'BORRADOR'; }).length,
            enviadosJF: descriptores.filter(function(d) { return d.estado === 'ENVIADO_JF'; }).length,
            observadosJF: descriptores.filter(function(d) { return d.estado === 'OBSERVADO_JF'; }).length,
            aprobadosJF: descriptores.filter(function(d) { return d.estado === 'APROBADO_POR_JF'; }).length,
            enviadosTH: descriptores.filter(function(d) { return d.estado === 'ENVIADO_TH'; }).length,
            observadosTH: descriptores.filter(function(d) { return d.estado === 'OBSERVADO_TH'; }).length,
            aprobadosTH: descriptores.filter(function(d) { return d.estado === 'APROBADO_TH'; }).length,
            firmaJTH: descriptores.filter(function(d) { return d.estado === 'FIRMA_JTH'; }).length,
            firmadoJTH: descriptores.filter(function(d) { return d.estado === 'FIRMADO_JTH'; }).length,
            firmadoCT: descriptores.filter(function(d) { return d.estado === 'FIRMADO_CT'; }).length,
            firmadoJI: descriptores.filter(function(d) { return d.estado === 'FIRMADO_JI'; }).length,
            activos: descriptores.filter(function(d) { return d.estado === 'ACTIVO'; }).length,
            inactivos: descriptores.filter(function(d) { return d.estado === 'INACTIVO'; }).length
        };
    }
};

window.DescriptorListService = DescriptorListService;