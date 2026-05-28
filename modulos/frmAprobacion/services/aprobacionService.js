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
            descriptor.estado = 'APROBADO_POR_JF';
            descriptor.comentariosAprobacion = comentarios;
            descriptor.fechaAprobacion = new Date().toISOString();
            // Limpiar observaciones anteriores si las había
            if (descriptor.observacionesJF) {
                delete descriptor.observacionesJF;
            }
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
    
    // Observar descriptor (devolver al Jefe Inmediato con observaciones)
    observar: function(id, observaciones) {
        var descriptor = DescriptorService.getById(id);
        if (descriptor) {
            descriptor.estado = 'OBSERVADO_JF';
            descriptor.observacionesJF = observaciones;
            descriptor.fechaObservacionJF = new Date().toISOString();
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