// Servicio de Firmas - Colaborador / Titular
var CTService = {
    getPendientesFirma: function(nombreTitular) {
        var todos = DescriptorService.getAll();
        var resultado = [];
        for (var i = 0; i < todos.length; i++) {
            if (todos[i].estado === 'FIRMADO_JTH' && todos[i].titular === nombreTitular) {
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
            descriptor.firmaCT = firmaDataUrl;
            descriptor.fechaFirmaCT = new Date().toISOString();
            descriptor.estado = 'FIRMADO_CT';
            DescriptorService.update(id, descriptor);
            
            var firmasGuardadas = JSON.parse(localStorage.getItem('firmas')) || {};
            firmasGuardadas['ct_' + id] = firmaDataUrl;
            localStorage.setItem('firmas', JSON.stringify(firmasGuardadas));
            return true;
        }
        return false;
    },
    
    getFirma: function(id) {
        var firmasGuardadas = JSON.parse(localStorage.getItem('firmas')) || {};
        return firmasGuardadas['ct_' + id] || null;
    }
};

window.CTService = CTService;