// Servicio de Aprobación TH
var THService = {
    // Obtener descriptores pendientes de revisión por TH (estado ENVIADO_TH)
    getPendientesRevision: function() {
        return DescriptorService.getAll().filter(function(d) {
            return d.estado === 'ENVIADO_TH';
        });
    },
    
    getGestionadosPorUsuario: function(usuario) {
        return DescriptorService.getAll().filter(function(d) {
            var eventos = (d.auditoria && d.auditoria.eventos) ? d.auditoria.eventos : [];
            return eventos.some(function(ev) {
                return ev.usuario === usuario && (
                    ev.accion === 'REVISADO POR GENERALISTA DE TH' ||
                    ev.accion === 'APROBACIÓN POR TH GENERALISTA' ||
                    ev.accion === 'OBSERVACIÓN POR TH GENERALISTA'
                );
            });
        });
    },
    
    getEventosUsuario: function(descriptor, usuario) {
        var eventos = (descriptor.auditoria && descriptor.auditoria.eventos) ? descriptor.auditoria.eventos : [];
        return eventos.filter(function(ev) {
            return ev.usuario === usuario;
        });
    },
    
    getUltimaAccionUsuario: function(descriptor, usuario) {
        var eventos = this.getEventosUsuario(descriptor, usuario);
        if (eventos.length === 0) return null;
        return eventos.sort(function(a, b) {
            return new Date(b.fecha) - new Date(a.fecha);
        })[0];
    },
    
    // Obtener descriptores por ID
    getById: function(id) {
        return DescriptorService.getById(id);
    },
    
    // Guardar complementos del TH (Relaciones Laborales, Requerimientos, Riesgos)
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
    
    // Registrar revisión de TH y enviar a firmas
    aprobar: function(id, comentarios) {
        var descriptor = DescriptorService.getById(id);
        if (descriptor) {
            descriptor.estado = 'FIRMA_JTH';
            descriptor.comentariosTH = comentarios;
            descriptor.fechaAprobacionTH = new Date().toISOString();
            DescriptorService.update(id, descriptor);
            return true;
        }
        return false;
    },
    
    // Observar descriptor (devolver al Jefe Inmediato con observaciones)
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