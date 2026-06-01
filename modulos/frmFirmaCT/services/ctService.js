// Servicio de Firmas - Colaborador / Titular
var CTService = {

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

    getPendientesFirma: function(nombreTitular) {

        var todos = DescriptorService.getAll();
        var resultado = [];

        for (var i = 0; i < todos.length; i++) {

            var d = todos[i];

            if (
                d.estado === 'FIRMADO_JTH' &&
                (d.titular || '')
                    .trim()
                    .toLowerCase() ===
                (nombreTitular || '')
                    .trim()
                    .toLowerCase()
            ) {

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
            descriptor.fechaFirmaCT =
                new Date().toISOString();

            descriptor.estado = 'FIRMADO_CT';

            DescriptorService.update(id, descriptor);

            var firmasGuardadas =
                JSON.parse(localStorage.getItem('firmas')) || {};

            firmasGuardadas['ct_' + id] = firmaDataUrl;

            localStorage.setItem(
                'firmas',
                JSON.stringify(firmasGuardadas)
            );

            this.savePngFile(
                'ct_' + id + '.png',
                firmaDataUrl
            );

            return true;
        }

        return false;
    },

    getFirma: function(id) {

        var firmasGuardadas =
            JSON.parse(localStorage.getItem('firmas')) || {};

        return firmasGuardadas['ct_' + id] || null;
    }
};

window.CTService = CTService;