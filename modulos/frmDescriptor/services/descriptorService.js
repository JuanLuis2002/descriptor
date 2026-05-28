// Servicio del Descriptor - Gestión de datos
var DescriptorService = {
    getAll: function() {
        const data = localStorage.getItem('descriptores');
        return data ? JSON.parse(data) : [];
    },
    
    save: function(descriptor) {
        const descriptors = this.getAll();
        descriptor.id = descriptors.length + 1;
        descriptor.codigo = `DES-${(descriptors.length + 1).toString().padStart(4, '0')}`;
        descriptor.estado = 'BORRADOR';
        descriptor.fechaCreacion = new Date().toISOString();
        
        // Inicializar auditoría
        descriptor.auditoria = {
            creado: {
                fecha: new Date().toISOString(),
                usuario: descriptor.creador,
                rol: descriptor.creadorRol || 'JEFE_INMEDIATO',
                accion: 'CREACIÓN DEL DESCRIPTOR',
                estado: 'BORRADOR'
            },
            historial: []
        };
        
        descriptors.push(descriptor);
        localStorage.setItem('descriptores', JSON.stringify(descriptores));
        return descriptor;
    },
    
    update: function(id, data) {
        const descriptors = this.getAll();  // CORREGIDO: usar this.getAll()
        const index = descriptors.findIndex(d => d.id === id);
        if (index !== -1) {
            // Si se está actualizando el estado, registrar en auditoría
            if (data.estado && descriptors[index].estado !== data.estado) {
                if (!descriptors[index].auditoria) {
                    descriptors[index].auditoria = { historial: [] };
                }
                if (!descriptors[index].auditoria.historial) {
                    descriptors[index].auditoria.historial = [];
                }
                descriptors[index].auditoria.historial.push({
                    fecha: new Date().toISOString(),
                    estadoAnterior: descriptors[index].estado,
                    estadoNuevo: data.estado,
                    accion: 'CAMBIO DE ESTADO'
                });
            }
            descriptors[index] = { ...descriptors[index], ...data };
            localStorage.setItem('descriptores', JSON.stringify(descriptores));
            return descriptors[index];
        }
        return null;
    },
    
    getById: function(id) {
        return this.getAll().find(d => d.id === id);
    },
    
    getByCreador: function(creador) {
        return this.getAll().filter(d => d.creador === creador);
    },
    
    getByEstado: function(estado) {
        return this.getAll().filter(d => d.estado === estado);
    },
    
    // Registrar evento en auditoría
    registrarEvento: function(id, evento) {
        const descriptors = this.getAll();
        const index = descriptors.findIndex(d => d.id === id);
        if (index !== -1) {
            if (!descriptors[index].auditoria) {
                descriptors[index].auditoria = { historial: [] };
            }
            if (!descriptors[index].auditoria.historial) {
                descriptors[index].auditoria.historial = [];
            }
            
            descriptors[index].auditoria.historial.push({
                fecha: new Date().toISOString(),
                ...evento
            });
            
            if (evento.estado) {
                descriptors[index].estado = evento.estado;
            }
            
            localStorage.setItem('descriptores', JSON.stringify(descriptores));
            return true;
        }
        return false;
    },
    
    // Obtener auditoría completa
    getAuditoria: function(id) {
        const descriptor = this.getById(id);
        if (descriptor) {
            return descriptor.auditoria || { historial: [] };
        }
        return { historial: [] };
    }
};

window.DescriptorService = DescriptorService;