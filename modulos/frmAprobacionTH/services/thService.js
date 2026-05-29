// Servicio de Aprobación TH
var THService = {
    getPendientesRevision: function() {
        return DescriptorService.getAll().filter(function(d) {
            return d.estado === 'ENVIADO_TH';
        });
    },
    
    getById: function(id) {
        return DescriptorService.getById(id);
    },
    
    guardarComplementos: function(id, data) {
        var descriptor = DescriptorService.getById(id);
        if (descriptor) {
            descriptor.relacionesLaborales = data.relacionesLaborales;
            descriptor.requerimientosOrganizacionales = data.requerimientosOrganizacionales;
            descriptor.riesgosFisicos = data.riesgosFisicos;
            descriptor.complementadoPorTH = true;
            descriptor.fechaComplementoTH = new Date().toISOString();
            DescriptorService.update(id, descriptor);
            return true;
        }
        return false;
    },
    
    aprobar: function(id, titular) {
        var descriptor = DescriptorService.getById(id);
        if (descriptor) {
            descriptor.estado = 'FIRMA_JTH';
            descriptor.titular = titular;
            descriptor.comentariosTH = 'Aprobado por TH Generalista';
            descriptor.fechaAprobacionTH = new Date().toISOString();
            DescriptorService.update(id, descriptor);
            return true;
        }
        return false;
    },
    
    observar: function(id, observaciones) {
        var descriptor = DescriptorService.getById(id);
        if (descriptor) {
            descriptor.estado = 'OBSERVADO_TH';
            descriptor.observacionesTH = observaciones;
            descriptor.fechaObservacionTH = new Date().toISOString();
            DescriptorService.update(id, descriptor);
            return true;
        }
        return false;
    }
};

window.THService = THService;