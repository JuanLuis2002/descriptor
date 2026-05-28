// Servicio del Descriptor - Gestión de datos
var DescriptorService = {
    getAll: function() {
        var data = localStorage.getItem('descriptores');
        if (data) {
            return JSON.parse(data);
        }
        return [];
    },
    
    save: function(descriptor) {
        var descriptors = this.getAll();
        descriptor.id = descriptors.length + 1;
        descriptor.codigo = 'DES-' + (descriptors.length + 1).toString().padStart(4, '0');
        descriptor.estado = 'BORRADOR';
        descriptor.fechaCreacion = new Date().toISOString();
        
        descriptor.auditoria = {
            creado: {
                fecha: new Date().toISOString(),
                usuario: descriptor.creador,
                rol: 'JEFE_INMEDIATO',
                accion: 'CREACIÓN DEL DESCRIPTOR',
                estado: 'BORRADOR'
            },
            historial: []
        };
        
        descriptors.push(descriptor);
        localStorage.setItem('descriptores', JSON.stringify(descriptors));
        return descriptor;
    },
    
    update: function(id, data) {
        var descriptors = this.getAll();
        var index = -1;
        for (var i = 0; i < descriptors.length; i++) {
            if (descriptors[i].id === id) {
                index = i;
                break;
            }
        }
        if (index !== -1) {
            for (var clave in data) {
                descriptors[index][clave] = data[clave];
            }
            localStorage.setItem('descriptores', JSON.stringify(descriptors));
            return descriptors[index];
        }
        return null;
    },
    
    getById: function(id) {
        var descriptors = this.getAll();
        for (var i = 0; i < descriptors.length; i++) {
            if (descriptors[i].id === id) {
                return descriptors[i];
            }
        }
        return null;
    },
    
    getByCreador: function(creador) {
        var descriptors = this.getAll();
        var resultado = [];
        for (var i = 0; i < descriptors.length; i++) {
            if (descriptors[i].creador === creador) {
                resultado.push(descriptors[i]);
            }
        }
        return resultado;
    },
    
    getByEstado: function(estado) {
        var descriptors = this.getAll();
        var resultado = [];
        for (var i = 0; i < descriptors.length; i++) {
            if (descriptors[i].estado === estado) {
                resultado.push(descriptors[i]);
            }
        }
        return resultado;
    },
    
    registrarEvento: function(id, evento) {
        var descriptors = this.getAll();
        var index = -1;
        for (var i = 0; i < descriptors.length; i++) {
            if (descriptors[i].id === id) {
                index = i;
                break;
            }
        }
        if (index !== -1) {
            if (!descriptors[index].auditoria) {
                descriptors[index].auditoria = { historial: [] };
            }
            if (!descriptors[index].auditoria.historial) {
                descriptors[index].auditoria.historial = [];
            }
            
            descriptors[index].auditoria.historial.push({
                fecha: new Date().toISOString(),
                accion: evento.accion || 'Evento',
                usuario: evento.usuario || 'Sistema',
                rol: evento.rol || '',
                estado: evento.estado || descriptors[index].estado
            });
            
            if (evento.estado) {
                descriptors[index].estado = evento.estado;
            }
            
            localStorage.setItem('descriptores', JSON.stringify(descriptors));
            return true;
        }
        return false;
    },
    
    getAuditoria: function(id) {
        var descriptor = this.getById(id);
        if (descriptor && descriptor.auditoria) {
            return descriptor.auditoria;
        }
        return { historial: [] };
    }
};

window.DescriptorService = DescriptorService;