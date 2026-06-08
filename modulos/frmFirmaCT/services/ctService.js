// Servicio de Firmas - Colaborador / Titular
var CTService = {
    getPendientesFirma: function(nombreTitular) {
        var todos = DescriptorService.getAll();
        var resultado = [];
        for (var i = 0; i < todos.length; i++) {
            var d = todos[i];
            if (d.estado === 'FIRMA_JTH' && !d.firmaCT && !this.getFirma(d.id)) {
                resultado.push(d);
            }
        }
        return resultado;
    },
    
    getFirmados: function(nombreTitular) {
        var todos = DescriptorService.getAll();
        var resultado = [];
        for (var i = 0; i < todos.length; i++) {
            var d = todos[i];
            if (d.firmaCT || this.getFirma(d.id)) {
                resultado.push(d);
            }
        }
        return resultado;
    },
    
    getById: function(id) {
        return DescriptorService.getById(id);
    },
    
    guardarFirma: function(id, aprobacion) {
        var descriptor = DescriptorService.getById(id);
        if (descriptor) {
            descriptor.firmaCT = aprobacion;
            descriptor.fechaFirmaCT = new Date().toISOString();
            descriptor.estado = DescriptorService.getEstadoDespuesDeFirma(descriptor);
            DescriptorService.update(id, descriptor);
            
            var firmasGuardadas = JSON.parse(localStorage.getItem('firmas')) || {};
            firmasGuardadas['ct_' + id] = aprobacion;
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