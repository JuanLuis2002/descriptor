// Servicio de Firmas - Colaborador / Titular
var CTService = {
    // Obtener descriptores pendientes de firma por Colaborador
    getPendientesFirma: function(nombreTitular) {
        return DescriptorService.getAll().filter(function(d) {
            return d.estado === 'FIRMA_JTH_COMPLETADA' && d.titular === nombreTitular;
        });
    },
    
    // Obtener descriptor por ID
    getById: function(id) {
        return DescriptorService.getById(id);
    },
    
    // Guardar firma del Colaborador
    guardarFirma: function(id, firmaDataUrl) {
        var descriptor = DescriptorService.getById(id);
        if (descriptor) {
            descriptor.firmaCT = firmaDataUrl;
            descriptor.fechaFirmaCT = new Date().toISOString();
            descriptor.estado = 'FIRMA_CT_COMPLETADA';
            DescriptorService.update(id, descriptor);
            
            var firmasGuardadas = JSON.parse(localStorage.getItem('firmas')) || {};
            firmasGuardadas['ct_' + id] = firmaDataUrl;
            localStorage.setItem('firmas', JSON.stringify(firmasGuardadas));
            return true;
        }
        return false;
    },
    
    // Obtener firma guardada
    getFirma: function(id) {
        var firmasGuardadas = JSON.parse(localStorage.getItem('firmas')) || {};
        return firmasGuardadas['ct_' + id] || null;
    }
};

window.CTService = CTService;