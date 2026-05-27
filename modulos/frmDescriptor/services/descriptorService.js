// Servicio Base del Descriptor
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
    
    delete: function(id) {
        let descriptors = this.getAll();
        descriptors = descriptors.filter(d => d.id !== id);
        localStorage.setItem('descriptores', JSON.stringify(descriptores));
        return true;
    }
};