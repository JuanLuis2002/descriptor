// Servicio del Descriptor - Gestión de datos con Auditoría
var DescriptorService = {
    getAll: function() {
        var data = localStorage.getItem('descriptores');
        return data ? JSON.parse(data) : [];
    },
    
    save: function(descriptor) {
        var descriptors = this.getAll();
        descriptor.id = descriptors.length + 1;
        descriptor.codigo = 'DES-' + (descriptors.length + 1).toString().padStart(4, '0');
        descriptor.estado = 'BORRADOR';
        descriptor.fechaCreacion = new Date().toISOString();
        
        // Inicializar auditoría
        descriptor.auditoria = {
            eventos: [],
            estadoActual: {
                estado: 'BORRADOR',
                fecha: new Date().toISOString(),
                usuario: descriptor.creador,
                rol: 'JEFE_INMEDIATO'
            }
        };
        
        // Registrar evento inicial
        this.registrarEventoInterno(descriptor, {
            accion: 'CREACIÓN DEL DESCRIPTOR',
            usuario: descriptor.creador,
            rol: 'JEFE_INMEDIATO',
            estado: 'BORRADOR',
            descripcion: 'Descriptor creado'
        });
        
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
    
    // Registrar evento en auditoría
    registrarEvento: function(id, evento) {
        var descriptor = this.getById(id);
        if (descriptor) {
            this.registrarEventoInterno(descriptor, evento);
            this.update(id, descriptor);
            return true;
        }
        return false;
    },
    
    registrarEventoInterno: function(descriptor, evento) {
        if (!descriptor.auditoria) {
            descriptor.auditoria = { eventos: [] };
        }
        if (!descriptor.auditoria.eventos) {
            descriptor.auditoria.eventos = [];
        }
        
        descriptor.auditoria.eventos.push({
            fecha: new Date().toISOString(),
            accion: evento.accion,
            usuario: evento.usuario,
            rol: evento.rol,
            estadoAnterior: evento.estadoAnterior || descriptor.estado,
            estadoNuevo: evento.estado || descriptor.estado,
            observacion: evento.observacion || null,
            descripcion: evento.descripcion || ''
        });
        
        if (evento.estado) {
            descriptor.estado = evento.estado;
            descriptor.auditoria.estadoActual = {
                estado: evento.estado,
                fecha: new Date().toISOString(),
                usuario: evento.usuario,
                rol: evento.rol
            };
        }
    },
    
    // Obtener auditoría completa
    getAuditoria: function(id) {
        var descriptor = this.getById(id);
        if (descriptor && descriptor.auditoria) {
            return descriptor.auditoria;
        }
        return { eventos: [], estadoActual: {} };
    },
    
    // Desactivar descriptor (cambiar a estado INACTIVO)
    desactivar: function(id, motivo, usuario, rol) {
        var descriptor = this.getById(id);
        if (descriptor) {
            var estadoAnterior = descriptor.estado;
            descriptor.estado = 'INACTIVO';
            descriptor.fechaDesactivacion = new Date().toISOString();
            descriptor.motivoDesactivacion = motivo;
            
            this.registrarEventoInterno(descriptor, {
                accion: 'DESACTIVACIÓN DEL DESCRIPTOR',
                usuario: usuario,
                rol: rol,
                estadoAnterior: estadoAnterior,
                estado: 'INACTIVO',
                observacion: motivo,
                descripcion: 'Descriptor desactivado: ' + motivo
            });
            
            this.update(id, descriptor);
            return true;
        }
        return false;
    },
    
    // Reactivar descriptor
    reactivar: function(id, usuario, rol) {
        var descriptor = this.getById(id);
        if (descriptor) {
            var estadoAnterior = descriptor.estado;
            descriptor.estado = 'BORRADOR';
            descriptor.fechaDesactivacion = null;
            descriptor.motivoDesactivacion = null;
            
            this.registrarEventoInterno(descriptor, {
                accion: 'REACTIVACIÓN DEL DESCRIPTOR',
                usuario: usuario,
                rol: rol,
                estadoAnterior: estadoAnterior,
                estado: 'BORRADOR',
                descripcion: 'Descriptor reactivado'
            });
            
            this.update(id, descriptor);
            return true;
        }
        return false;
    }
};

window.DescriptorService = DescriptorService;