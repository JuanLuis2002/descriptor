// Servicio de Aprobación
var AprobacionService = {
    getUsuariosEquivalentes: function(usuario) {
        var usuarios = [usuario];
        if (usuario === 'Ing. Roberto Cortez') {
            usuarios.push('Dr. Roberto Chang', 'Roberto Chang');
        }
        return usuarios;
    },

    esUsuarioEquivalente: function(eventoUsuario, usuario) {
        return this.getUsuariosEquivalentes(usuario).indexOf(eventoUsuario) !== -1;
    },

    // Obtener descriptores pendientes de aprobación por Jefe Superior
    getPendientesAprobacion: function() {
        return DescriptorService.getAll().filter(function(d) {
            return d.estado === 'ENVIADO_JF' || d.estado === 'APROBADO_POR_JF';
        });
    },
    
    getGestionadosPorUsuario: function(usuario) {
        var self = this;
        return DescriptorService.getAll().filter(function(d) {
            var eventos = (d.auditoria && d.auditoria.eventos) ? d.auditoria.eventos : [];
            return eventos.some(function(ev) {
                return self.esUsuarioEquivalente(ev.usuario, usuario) && (
                    ev.accion === 'APROBACIÓN POR JEFE SUPERIOR' ||
                    ev.accion === 'APROBACIÓN POR JEFE INMEDIATO SUPERIOR' ||
                    ev.accion === 'OBSERVACIÓN POR JEFE SUPERIOR' ||
                    ev.accion === 'OBSERVACIÓN POR JEFE INMEDIATO SUPERIOR' ||
                    ev.accion === 'ENVÍO A TALENTO HUMANO'
                );
            });
        });
    },
    
    getEventosUsuario: function(descriptor, usuario) {
        var self = this;
        var eventos = (descriptor.auditoria && descriptor.auditoria.eventos) ? descriptor.auditoria.eventos : [];
        return eventos.filter(function(ev) {
            return self.esUsuarioEquivalente(ev.usuario, usuario);
        });
    },
    
    getUltimaAccionUsuario: function(descriptor, usuario) {
        var eventos = this.getEventosUsuario(descriptor, usuario);
        if (eventos.length === 0) return null;
        return eventos.sort(function(a, b) {
            return new Date(b.fecha) - new Date(a.fecha);
        })[0];
    },
    
    // Aprobar descriptor y enviarlo directamente a revisión de TH
    aprobar: function(id, comentarios) {
        var descriptor = DescriptorService.getById(id);
        if (descriptor) {
            descriptor.estado = 'ENVIADO_TH';
            descriptor.comentariosAprobacion = comentarios;
            descriptor.fechaAprobacion = new Date().toISOString();
            descriptor.fechaEnvioTH = new Date().toISOString();
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
            descriptor.estado = 'OBSERVADO_JF';
            descriptor.observaciones = observaciones;
            descriptor.observacionesJF = observaciones;
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