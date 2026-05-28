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
        const descriptors = this.getAll();
        const index = descriptors.findIndex(d => d.id === id);
        if (index !== -1) {
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
        const descriptor = this.getById(id);
        if (descriptor) {
            if (!descriptor.auditoria) {
                descriptor.auditoria = { historial: [] };
            }
            if (!descriptor.auditoria.historial) {
                descriptor.auditoria.historial = [];
            }
            
            // Agregar evento al historial
            descriptor.auditoria.historial.push({
                fecha: new Date().toISOString(),
                ...evento
            });
            
            // Actualizar estado actual en auditoría
            if (evento.estado) {
                descriptor.auditoria.estadoActual = {
                    estado: evento.estado,
                    fecha: new Date().toISOString(),
                    usuario: evento.usuario
                };
            }
            
            this.update(id, descriptor);
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