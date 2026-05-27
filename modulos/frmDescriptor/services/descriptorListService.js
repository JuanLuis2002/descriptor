// Servicio para Listar Descriptores - Filtros y ordenamiento
var DescriptorListService = {
    // Obtener descriptores por creador
    getByCreador: function(creador) {
        return DescriptorService.getAll().filter(d => d.creador === creador);
    },
    
    // Obtener por estado
    getByEstado: function(estado) {
        return DescriptorService.getAll().filter(d => d.estado === estado);
    },
    
    // Obtener por rango de fechas
    getByFechaRange: function(fechaInicio, fechaFin) {
        return DescriptorService.getAll().filter(d => {
            const fecha = d.fechaEmision || d.fechaCreacion?.split('T')[0];
            return fecha >= fechaInicio && fecha <= fechaFin;
        });
    },
    
    // Buscar por texto (código, puesto, área)
    search: function(descriptores, termino) {
        const term = termino.toLowerCase();
        return descriptores.filter(d => 
            (d.codigo || '').toLowerCase().includes(term) ||
            (d.puesto || '').toLowerCase().includes(term) ||
            (d.area || '').toLowerCase().includes(term)
        );
    },
    
    // Filtrar por estado
    filterByEstado: function(descriptores, estado) {
        if (!estado) return descriptores;
        return descriptores.filter(d => d.estado === estado);
    },
    
    // Ordenar descriptores
    sort: function(descriptores, criterio) {
        const sorted = [...descriptores];
        switch(criterio) {
            case 'fecha':
                return sorted.sort((a, b) => {
                    const fechaA = a.fechaEmision || a.fechaCreacion?.split('T')[0] || '';
                    const fechaB = b.fechaEmision || b.fechaCreacion?.split('T')[0] || '';
                    return new Date(fechaB) - new Date(fechaA);
                });
            case 'puesto':
                return sorted.sort((a, b) => (a.puesto || '').localeCompare(b.puesto || ''));
            case 'estado':
                return sorted.sort((a, b) => (a.estado || '').localeCompare(b.estado || ''));
            default:
                return sorted;
        }
    },
    
    // Obtener estadísticas por creador
    getEstadisticas: function(creador) {
        const descriptores = this.getByCreador(creador);
        return {
            total: descriptores.length,
            borradores: descriptores.filter(d => d.estado === 'BORRADOR').length,
            enviados: descriptores.filter(d => d.estado === 'ENVIADO_TH').length,
            activos: descriptores.filter(d => d.estado === 'ACTIVO').length,
            firmados: descriptores.filter(d => d.estado === 'FIRMADO').length
        };
    }
};

window.DescriptorListService = DescriptorListService;