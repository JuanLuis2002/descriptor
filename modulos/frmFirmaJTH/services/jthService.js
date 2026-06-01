// Servicio de Firmas - Jefe de Talento Humano
var JTHService = {
    getPendientesFirma: function() {
        var todos = DescriptorService.getAll();
        var resultado = [];
        for (var i = 0; i < todos.length; i++) {
            if (todos[i].estado === 'FIRMA_JTH') {
                resultado.push(todos[i]);
            }
        }
        return resultado;
    },
    
    getById: function(id) {
        return DescriptorService.getById(id);
    },
    
    guardarFirma: function(id, firmaDataUrl) {
        var descriptor = DescriptorService.getById(id);
        if (descriptor) {
            descriptor.firmaJTH = firmaDataUrl;
            descriptor.fechaFirmaJTH = new Date().toISOString();
            descriptor.estado = 'FIRMADO_JTH';
            DescriptorService.update(id, descriptor);
            
            var firmasGuardadas = JSON.parse(localStorage.getItem('firmas')) || {};
            firmasGuardadas['jth_' + id] = firmaDataUrl;
            localStorage.setItem('firmas', JSON.stringify(firmasGuardadas));
            return true;
        }
        return false;
    },
    
    getFirma: function(id) {
        var firmasGuardadas = JSON.parse(localStorage.getItem('firmas')) || {};
        return firmasGuardadas['jth_' + id] || null;
    }
};

window.JTHService = JTHService;