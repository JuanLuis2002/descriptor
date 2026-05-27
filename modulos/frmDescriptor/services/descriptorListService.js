// Servicio para Listar Descriptores
var DescriptorListService = {
    getByCreador: function(creador) {
        return DescriptorService.getAll().filter(d => d.creador === creador);
    },
    
    getByEstado: function(estado) {
        return DescriptorService.getAll().filter(d => d.estado === estado);
    },
    
    search: function(descriptores, termino) {
        const term = termino.toLowerCase();
        return descriptores.filter(d => 
            (d.codigo || '').toLowerCase().includes(term) ||
            (d.puesto || '').toLowerCase().includes(term) ||
            (d.area || '').toLowerCase().includes(term)
        );
    },
    
    filterByEstado: function(descriptores, estado) {
        if (!estado) return descriptores;
        return descriptores.filter(d => d.estado === estado);
    },
    
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