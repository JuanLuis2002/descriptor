// Servicio de Firmas - Jefe de Talento Humano
var JTHService = {

    savePngFile: async function(fileName, dataUrl) {

        if (!window.showDirectoryPicker) {
            console.warn('File System Access API no soportada');
            return;
        }

        try {

            if (!window.firmasDirectoryHandle) {

                window.firmasDirectoryHandle =
                    await window.showDirectoryPicker({
                        mode: 'readwrite'
                    });

            }

            const response = await fetch(dataUrl);
            const blob = await response.blob();

            const fileHandle =
                await window.firmasDirectoryHandle.getFileHandle(
                    fileName,
                    { create: true }
                );

            const writable = await fileHandle.createWritable();

            await writable.write(blob);
            await writable.close();

            console.log('Firma guardada:', fileName);

        } catch (error) {

            console.error(
                'Error guardando firma:',
                error
            );

        }

    },

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

            var firmasGuardadas =
                JSON.parse(localStorage.getItem('firmas')) || {};

            firmasGuardadas['jth_' + id] = firmaDataUrl;

            localStorage.setItem(
                'firmas',
                JSON.stringify(firmasGuardadas)
            );

            this.savePngFile(
                'jth_' + id + '.png',
                firmaDataUrl
            );

            return true;
        }

        return false;
    },

    getFirma: function(id) {

        var firmasGuardadas =
            JSON.parse(localStorage.getItem('firmas')) || {};

        return firmasGuardadas['jth_' + id] || null;
    }
};

window.JTHService = JTHService;