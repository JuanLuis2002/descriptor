// Servicio de Firmas - Jefe de Talento Humano
var JTHService = {
    getPendientesFirma: function() {
        var todos = DescriptorService.getAll();
        var resultado = [];
        for (var i = 0; i < todos.length; i++) {
            if (todos[i].estado === 'FIRMADO_JI' && !todos[i].firmaJTH && !this.getFirma(todos[i].id)) {
                resultado.push(todos[i]);
            }
        }
        return resultado;
    },
    
    getFirmados: function() {
        var todos = DescriptorService.getAll();
        var resultado = [];
        for (var i = 0; i < todos.length; i++) {
            if (todos[i].firmaJTH || this.getFirma(todos[i].id)) {
                resultado.push(todos[i]);
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
            descriptor.firmaJTH = aprobacion;
            descriptor.fechaFirmaJTH = new Date().toISOString();
            descriptor.estado = DescriptorService.getEstadoDespuesDeFirma(descriptor);
            DescriptorService.update(id, descriptor);
            
            var firmasGuardadas = JSON.parse(localStorage.getItem('firmas')) || {};
            firmasGuardadas['jth_' + id] = aprobacion;
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