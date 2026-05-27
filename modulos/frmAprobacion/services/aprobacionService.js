// Servicio de Aprobación
var AprobacionService = {
    // Obtener descriptores pendientes de aprobación por Jefe Superior
    getPendientesAprobacion: function() {
        return DescriptorService.getAll().filter(function(d) {
            return d.estado === 'ENVIADO_TH';
        });
    },
    
    // Aprobar descriptor (enviar a TH)
    aprobar: function(id, comentarios) {
        var descriptor = DescriptorService.getById(id);
        if (descriptor) {
            descriptor.estado = 'ACTIVO';
            descriptor.comentariosAprobacion = comentarios;
            descriptor.fechaAprobacion = new Date().toISOString();
            DescriptorService.update(id, descriptor);
            return true;
        }
        return false;
    },
    
    // Rechazar/Observar descriptor (devolver al Jefe Inmediato)
    observar: function(id, observaciones) {
        var descriptor = DescriptorService.getById(id);
        if (descriptor) {
            descriptor.estado = 'OBSERVADO';
            descriptor.observaciones = observaciones;
            descriptor.fechaObservacion = new Date().toISOString();
            DescriptorService.update(id, descriptor);
            return true;
        }
        return false;
    },
    
    // Obtener detalle completo del descriptor
    getDetalle: function(id) {
        return DescriptorService.getById(id);
    }
};

window.AprobacionService = AprobacionService;