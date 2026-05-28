// Servicio de Firmas - Jefe de Talento Humano
var JTHService = {
    // Obtener descriptores pendientes de firma por Jefe de TH (estado ACTIVO)
    getPendientesFirma: function() {
        return DescriptorService.getAll().filter(function(d) {
            return d.estado === 'ACTIVO';
        });
    },
    
    // Obtener descriptor por ID
    getById: function(id) {
        return DescriptorService.getById(id);
    },
    
    // Guardar firma del Jefe de TH
    guardarFirma: function(id, firmaDataUrl) {
        var descriptor = DescriptorService.getById(id);
        if (descriptor) {
            descriptor.firmaJTH = firmaDataUrl;
            descriptor.fechaFirmaJTH = new Date().toISOString();
            descriptor.estado = 'FIRMA_JTH_COMPLETADA';
            DescriptorService.update(id, descriptor);
            
            // Guardar firma en localStorage simulando carpeta
            var firmasGuardadas = JSON.parse(localStorage.getItem('firmas')) || {};
            firmasGuardadas['jth_' + id] = firmaDataUrl;
            localStorage.setItem('firmas', JSON.stringify(firmasGuardadas));
            return true;
        }
        return false;
    },
    
    // Obtener firma guardada
    getFirma: function(id) {
        var firmasGuardadas = JSON.parse(localStorage.getItem('firmas')) || {};
        return firmasGuardadas['jth_' + id] || null;
    }
};

window.JTHService = JTHService;