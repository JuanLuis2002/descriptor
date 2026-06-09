// Servicio del Descriptor - Gestión de datos con Auditoría
var DescriptorService = {
    getAll: function() {
        var data = localStorage.getItem('descriptores');
        return data ? JSON.parse(data) : [];
    },
    
    save: function(descriptor) {
        var descriptors = this.getAll();
        descriptor.id = descriptors.length + 1;
        descriptor.codigo = 'DES-' + (descriptors.length + 1).toString().padStart(4, '0');
        descriptor.version = this.getSiguienteVersionByPuesto(descriptor.puesto);
        descriptor.tipoFormato = descriptor.tipoFormato || 'CORTA';
        descriptor.estado = descriptor.estado || 'BORRADOR';
        descriptor.fechaCreacion = new Date().toISOString();
        
        // Inicializar auditoría
        descriptor.auditoria = {
            eventos: [],
            estadoActual: {
                estado: descriptor.estado,
                fecha: new Date().toISOString(),
                usuario: descriptor.creador,
                rol: descriptor.rolCreador || 'JEFE_INMEDIATO'
            }
        };
        
        // Registrar evento inicial
        this.registrarEventoInterno(descriptor, {
            accion: 'CREACIÓN DEL DESCRIPTOR',
            usuario: descriptor.creador,
            rol: descriptor.rolCreador || 'JEFE_INMEDIATO',
            estado: descriptor.estado,
            descripcion: 'Descriptor creado'
        });

        if (descriptor.flujoCreadoPorTH) {
            this.registrarEventoInterno(descriptor, {
                accion: 'CREACIÓN DE BORRADOR POR TALENTO HUMANO',
                usuario: descriptor.creador,
                rol: descriptor.rolCreador || 'Talento Humano',
                estado: descriptor.estado,
                descripcion: 'Descriptor creado por Talento Humano en estado borrador'
            });
        }
        
        descriptors.push(descriptor);
        localStorage.setItem('descriptores', JSON.stringify(descriptors));
        return descriptor;
    },
    
    update: function(id, data) {
        var descriptors = this.getAll();
        var index = -1;
        for (var i = 0; i < descriptors.length; i++) {
            if (descriptors[i].id === id) {
                index = i;
                break;
            }
        }
        if (index !== -1) {
            for (var clave in data) {
                descriptors[index][clave] = data[clave];
            }
            localStorage.setItem('descriptores', JSON.stringify(descriptors));
            return descriptors[index];
        }
        return null;
    },
    
    getById: function(id) {
        var descriptors = this.getAll();
        for (var i = 0; i < descriptors.length; i++) {
            if (descriptors[i].id === id) {
                return descriptors[i];
            }
        }
        return null;
    },
    
    getByCreador: function(creador) {
        var descriptors = this.getAll();
        var resultado = [];
        for (var i = 0; i < descriptors.length; i++) {
            if (descriptors[i].creador === creador) {
                resultado.push(descriptors[i]);
            }
        }
        return resultado;
    },
    
    getByEstado: function(estado) {
        var descriptors = this.getAll();
        var resultado = [];
        for (var i = 0; i < descriptors.length; i++) {
            if (descriptors[i].estado === estado) {
                resultado.push(descriptors[i]);
            }
        }
        return resultado;
    },
    
    getDescriptorVigenteOEnProcesoByPuesto: function(puesto, excludeId) {
        var descriptors = this.getAll();
        var puestoNormalizado = (puesto || '').trim().toLowerCase();
        for (var i = 0; i < descriptors.length; i++) {
            var descriptor = descriptors[i];
            var mismoPuesto = (descriptor.puesto || '').trim().toLowerCase() === puestoNormalizado;
            var esOtroDescriptor = !excludeId || descriptor.id !== excludeId;
            if (mismoPuesto && esOtroDescriptor && descriptor.estado !== 'INACTIVO') {
                return descriptor;
            }
        }
        return null;
    },
    
    getDescriptorActivoByPuesto: function(puesto, excludeId) {
        return this.getDescriptorVigenteOEnProcesoByPuesto(puesto, excludeId);
    },
    
    getSiguienteVersionByPuesto: function(puesto) {
        var descriptors = this.getAll();
        var puestoNormalizado = (puesto || '').trim().toLowerCase();
        var ultimaVersion = 0;
        for (var i = 0; i < descriptors.length; i++) {
            var descriptor = descriptors[i];
            var mismoPuesto = (descriptor.puesto || '').trim().toLowerCase() === puestoNormalizado;
            if (mismoPuesto) {
                var version = parseInt(descriptor.version || 1, 10);
                if (version > ultimaVersion) {
                    ultimaVersion = version;
                }
            }
        }
        return ultimaVersion + 1;
    },

    crearNuevaVersionDesdeInactivo: function(id, usuario) {
        var origen = this.getById(id);
        if (!origen) return { ok: false, mensaje: 'No se encontró el descriptor origen.' };
        if (origen.estado !== 'INACTIVO') {
            return { ok: false, mensaje: 'Solo se puede crear una nueva versión desde un descriptor inactivo.' };
        }
        var vigente = this.getDescriptorVigenteOEnProcesoByPuesto(origen.puesto, origen.id);
        if (vigente) {
            return {
                ok: false,
                mensaje: 'No es posible crear una nueva versión porque existe un descriptor activo o en proceso para este puesto.'
            };
        }

        var copia = JSON.parse(JSON.stringify(origen));
        var camposLimpiar = [
            'id', 'codigo', 'auditoria', 'estado', 'fechaCreacion', 'fechaDesactivacion',
            'colaboradoresAsignados', 'firmaCT', 'firmaJI', 'firmaJTH', 'fechaFirmaCT',
            'fechaFirmaJI', 'fechaFirmaJTH', 'vistoBuenoJI', 'vistoBuenoTH',
            'fechaVistoBuenoJI', 'fechaVistoBuenoTH', 'observaciones', 'observacionesJF',
            'observacionesTH', 'comentariosAprobacion', 'comentariosTH',
            'edicionesRevisionJI', 'edicionesRevisionTH', 'ultimasSeccionesEditadasJI',
            'ultimasSeccionesEditadasTH', 'ultimoEditorRevisionJI', 'flujoCreadoPorTH',
            'creadoPorTH', 'fechaEnvioRevisionJI'
        ];
        for (var c = 0; c < camposLimpiar.length; c++) {
            delete copia[camposLimpiar[c]];
        }

        copia.estado = 'BORRADOR';
        copia.version = this.getSiguienteVersionByPuesto(origen.puesto);
        copia.creador = usuario && usuario.nombre ? usuario.nombre : origen.creador;
        copia.rolCreador = usuario && usuario.rol ? usuario.rol : origen.rolCreador;
        copia.fechaEmision = new Date().toISOString().split('T')[0];
        copia.versionOrigenId = origen.id;
        copia.codigoOrigen = origen.codigo;

        var nuevo = this.save(copia);
        this.registrarEvento(nuevo.id, {
            accion: 'CREACIÓN DE NUEVA VERSIÓN DESDE DESCRIPTOR INACTIVO',
            usuario: copia.creador,
            rol: usuario && usuario.rolNombre ? usuario.rolNombre : copia.rolCreador,
            estado: nuevo.estado,
            observacion: 'Nueva versión creada a partir de ' + (origen.codigo || ('DES-' + origen.id)) + ' versión ' + (origen.version || 1)
        });
        return { ok: true, descriptor: nuevo };
    },
    
    getVersionPosteriorVigenteOEnProceso: function(descriptor) {
        if (!descriptor) return null;
        var descriptors = this.getAll();
        var puestoNormalizado = (descriptor.puesto || '').trim().toLowerCase();
        var versionActual = parseInt(descriptor.version || 1, 10);
        var versionPosterior = null;
        for (var i = 0; i < descriptors.length; i++) {
            var candidato = descriptors[i];
            var mismoPuesto = (candidato.puesto || '').trim().toLowerCase() === puestoNormalizado;
            var versionCandidato = parseInt(candidato.version || 1, 10);
            if (mismoPuesto && candidato.id !== descriptor.id && versionCandidato > versionActual && candidato.estado !== 'INACTIVO') {
                if (!versionPosterior || versionCandidato > parseInt(versionPosterior.version || 1, 10)) {
                    versionPosterior = candidato;
                }
            }
        }
        return versionPosterior;
    },
    
    // Registrar evento en auditoría
    registrarEvento: function(id, evento) {
        var descriptor = this.getById(id);
        if (descriptor) {
            this.registrarEventoInterno(descriptor, evento);
            this.update(id, descriptor);
            return true;
        }
        return false;
    },
    
    registrarEventoInterno: function(descriptor, evento) {
        if (!descriptor.auditoria) {
            descriptor.auditoria = { eventos: [] };
        }
        if (!descriptor.auditoria.eventos) {
            descriptor.auditoria.eventos = [];
        }
        
        descriptor.auditoria.eventos.push({
            fecha: new Date().toISOString(),
            accion: evento.accion,
            usuario: evento.usuario,
            rol: evento.rol,
            estadoAnterior: evento.estadoAnterior || descriptor.estado,
            estadoNuevo: evento.estadoNuevo || evento.estado || descriptor.estado,
            observacion: evento.observacion || null,
            descripcion: evento.descripcion || ''
        });
        
        if (evento.estado) {
            descriptor.estado = evento.estado;
            descriptor.auditoria.estadoActual = {
                estado: evento.estado,
                fecha: new Date().toISOString(),
                usuario: evento.usuario,
                rol: evento.rol
            };
        }
    },
    
    getFirmaGuardada: function(tipo, id) {
        var firmasGuardadas = JSON.parse(localStorage.getItem('firmas') || '{}');
        return firmasGuardadas[tipo + '_' + id] || null;
    },
    
    tieneTodasLasFirmas: function(descriptor) {
        if (!descriptor) return false;
        return !!(
            (descriptor.firmaJTH || this.getFirmaGuardada('jth', descriptor.id)) &&
            (descriptor.firmaCT || this.getFirmaGuardada('ct', descriptor.id)) &&
            (descriptor.firmaJI || this.getFirmaGuardada('ji', descriptor.id))
        );
    },
    
    getEstadoDespuesDeFirma: function(descriptor) {
        if (!descriptor) return 'FIRMA_JTH';
        var firmaCT = descriptor.firmaCT || this.getFirmaGuardada('ct', descriptor.id);
        var firmaJI = descriptor.firmaJI || this.getFirmaGuardada('ji', descriptor.id);
        var firmaJTH = descriptor.firmaJTH || this.getFirmaGuardada('jth', descriptor.id);

        if (firmaCT && firmaJI && firmaJTH) return 'ACTIVO';
        if (firmaCT && firmaJI) return 'FIRMADO_JI';
        if (firmaCT) return 'FIRMADO_CT';
        return 'FIRMA_JTH';
    },

    asignarColaboradores: function(id, colaboradores, usuario, rol) {
        var descriptor = this.getById(id);
        if (!descriptor) return false;
        var actuales = descriptor.colaboradoresAsignados || [];
        var docsPorUsuario = {};
        for (var i = 0; i < actuales.length; i++) {
            docsPorUsuario[actuales[i].usuario] = actuales[i].documentoFirmado || null;
        }
        descriptor.colaboradoresAsignados = colaboradores.map(function(colaborador) {
            return {
                usuario: colaborador.usuario,
                nombre: colaborador.nombre,
                puesto: colaborador.puesto || '',
                fechaAsignacion: new Date().toISOString(),
                documentoFirmado: docsPorUsuario[colaborador.usuario] || null
            };
        });
        this.update(id, descriptor);
        this.registrarEvento(id, {
            accion: 'ASIGNACIÓN DE COLABORADORES',
            usuario: usuario,
            rol: rol,
            estado: descriptor.estado,
            observacion: 'Colaboradores asignados: ' + descriptor.colaboradoresAsignados.map(function(c) { return c.nombre; }).join(', ')
        });
        return true;
    },

    guardarDocumentoFirmadoColaborador: function(id, usuarioColaborador, documento, usuario, rol) {
        var descriptor = this.getById(id);
        if (!descriptor) return false;
        descriptor.colaboradoresAsignados = descriptor.colaboradoresAsignados || [];
        for (var i = 0; i < descriptor.colaboradoresAsignados.length; i++) {
            if (descriptor.colaboradoresAsignados[i].usuario === usuarioColaborador) {
                descriptor.colaboradoresAsignados[i].documentoFirmado = documento;
                descriptor.colaboradoresAsignados[i].fechaDocumentoFirmado = new Date().toISOString();
                break;
            }
        }
        this.update(id, descriptor);
        this.registrarEvento(id, {
            accion: 'CARGA DE DOCUMENTO FIRMADO',
            usuario: usuario,
            rol: rol,
            estado: descriptor.estado,
            observacion: 'Documento firmado cargado para colaborador: ' + usuarioColaborador
        });
        return true;
    },
    
    // Obtener auditoría completa
    getAuditoria: function(id) {
        var descriptor = this.getById(id);
        if (descriptor && descriptor.auditoria) {
            return descriptor.auditoria;
        }
        return { eventos: [], estadoActual: {} };
    },
    
    // Desactivar descriptor (cambiar a estado INACTIVO)
    desactivar: function(id, motivo, usuario, rol) {
        var descriptor = this.getById(id);
        if (descriptor) {
            var estadoAnterior = descriptor.estado;
            descriptor.estado = 'INACTIVO';
            descriptor.fechaDesactivacion = new Date().toISOString();
            descriptor.motivoDesactivacion = motivo;
            
            this.registrarEventoInterno(descriptor, {
                accion: 'DESACTIVACIÓN DEL DESCRIPTOR',
                usuario: usuario,
                rol: rol,
                estadoAnterior: estadoAnterior,
                estado: 'INACTIVO',
                observacion: motivo,
                descripcion: 'Descriptor desactivado: ' + motivo
            });
            
            this.update(id, descriptor);
            return true;
        }
        return false;
    },
    
    // Reactivar descriptor
    reactivar: function(id, usuario, rol) {
        var descriptor = this.getById(id);
        if (descriptor) {
            var estadoAnterior = descriptor.estado;
            descriptor.estado = 'ACTIVO';
            descriptor.fechaDesactivacion = null;
            descriptor.motivoDesactivacion = null;
            
            this.registrarEventoInterno(descriptor, {
                accion: 'REACTIVACIÓN DEL DESCRIPTOR',
                usuario: usuario,
                rol: rol,
                estadoAnterior: estadoAnterior,
                estado: 'ACTIVO',
                descripcion: 'Descriptor reactivado'
            });
            
            this.update(id, descriptor);
            return true;
        }
        return false;
    }
};

window.DescriptorService = DescriptorService;