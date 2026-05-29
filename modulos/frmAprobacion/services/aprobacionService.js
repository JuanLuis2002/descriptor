// Servicio de Aprobación
var AprobacionService = {
    // Obtener descriptores pendientes de aprobación por Jefe Superior
    getPendientesAprobacion: function() {
        return DescriptorService.getAll().filter(function(d) {
            return d.estado === 'ENVIADO_JF';
        });
    },
    
    // Aprobar descriptor (pasa a estado pre-aprobado, pendiente de envío a TH)
    aprobar: function(id, comentarios) {
        var descriptor = DescriptorService.getById(id);
        if (descriptor) {
            descriptor.estado = 'APROBADO_POR_JF';  // Estado intermedio
            descriptor.comentariosAprobacion = comentarios;
            descriptor.fechaAprobacion = new Date().toISOString();
            DescriptorService.update(id, descriptor);
            return true;
        }
        return false;
    },
    
    // Enviar a TH después de aprobación
    enviarATH: function(id) {
        var descriptor = DescriptorService.getById(id);
        if (descriptor) {
            descriptor.estado = 'ENVIADO_TH';
            descriptor.fechaEnvioTH = new Date().toISOString();
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
    },
    
    // Verificar si el descriptor está aprobado y pendiente de envío a TH
    isAprobadoPendienteEnvio: function(id) {
        var descriptor = this.getDetalle(id);
        return descriptor && descriptor.estado === 'APROBADO_POR_JF';
    }
};

window.AprobacionService = AprobacionService;