// Servicio de Firmas - Colaborador / Titular
var CTService = {
    getPendientesFirma: function(nombreTitular) {
        var todos = DescriptorService.getAll();
        var resultado = [];
        for (var i = 0; i < todos.length; i++) {
            var d = todos[i];
            // El colaborador firma cuando está en estado FIRMADO_JTH y es el titular
            if (d.estado === 'FIRMADO_JTH' && d.titular.trim().toLowerCase() === nombreTitular.trim().toLowerCase()) {
                resultado.push(d);
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