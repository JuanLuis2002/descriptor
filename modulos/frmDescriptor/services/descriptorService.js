// Servicio del Descriptor - Gestión de datos
var DescriptorService = {
    getAll: function() {
        const data = localStorage.getItem('descriptores');
        return data ? JSON.parse(data) : [];
    },
    
    save: function(descriptor) {
        const descriptors = this.getAll();
        descriptor.id = descriptors.length + 1;
        descriptor.codigo = `DES-${(descriptores.length + 1).toString().padStart(4, '0')}`;
        descriptor.estado = 'BORRADOR';
        descriptor.fechaCreacion = new Date().toISOString();
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
    }
};

window.DescriptorService = DescriptorService;