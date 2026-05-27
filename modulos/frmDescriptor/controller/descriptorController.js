// Controlador del Descriptor
var DescriptorController = {
    currentUser: null,
    descriptorIdToEdit: null,  // NUEVO: guardar ID para edición
    
    init: function(user, idToEdit) {
        this.currentUser = user;
        this.descriptorIdToEdit = idToEdit || null;
        console.log('DescriptorController iniciado para:', user.nombre, 'Editando ID:', idToEdit);
        this.loadForm();
    },
    
    loadForm: function() {
        var self = this;
        
        // Limpiar el contenedor
        $('#contentContainer').empty();
        
        // Resetear la bandera global para permitir recarga
        if (window._descriptorFormLoaded) {
            window._descriptorFormLoaded = false;
        }
        
        $.get('modulos/frmDescriptor/view/descriptorForm.html', function(html) {
            $('#contentContainer').html(html);
            console.log('Formulario cargado correctamente');
            
            // Si hay un ID para editar, cargar los datos después de que el formulario esté listo
            if (self.descriptorIdToEdit) {
                setTimeout(function() {
                    self.cargarDatosParaEdicion(self.descriptorIdToEdit);
                }, 300);
            }
        }).fail(function() {
            $('#contentContainer').html(`
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Error al cargar el formulario.<br>
                    Verifique: <strong>modulos/frmDescriptor/view/descriptorForm.html</strong>
                </div>
            `);
        });
    },
    
    // NUEVO: Cargar datos del descriptor para edición
    cargarDatosParaEdicion: function(id) {
        if (typeof DescriptorService === 'undefined') return;
        
        var descriptor = DescriptorService.getById(id);
        if (!descriptor) return;
        
        console.log('Cargando datos del descriptor:', descriptor.codigo);
        
        // Cambiar título y botón
        $('#pageTitle').text('Editar Descriptor');
        $('#saveBtn').text('Actualizar Descriptor');
        
        // Cargar datos básicos
        $('select[name="puesto"]').val(descriptor.puesto);
        $('#areaUsuario').val(descriptor.area);
        $('input[name="reportaA"]').val(descriptor.reportaA);
        $('input[name="fechaEmision"]').val(descriptor.fechaEmision);
        $('textarea[name="objetivo"]').val(descriptor.objetivo);
        
        // Cargar funciones claves
        $('#funcionesClavesContainer').empty();
        if (descriptor.funcionesClaves && descriptor.funcionesClaves.length > 0) {
            for (var i = 0; i < descriptor.funcionesClaves.length; i++) {
                addFuncionClaveRowWithData(descriptor.funcionesClaves[i].codigo, descriptor.funcionesClaves[i].nombre);
            }
        } else {
            for(var i = 1; i <= 4; i++) addFuncionClaveRow();
        }
        
        // Cargar funciones secundarias
        $('#funcionesSecundariasContainer').empty();
        if (descriptor.funcionesSecundarias && descriptor.funcionesSecundarias.length > 0) {
            for (var i = 0; i < descriptor.funcionesSecundarias.length; i++) {
                addFuncionSecundariaRowWithData(descriptor.funcionesSecundarias[i]);
            }
        } else {
            for(var i = 1; i <= 4; i++) addFuncionSecundariaRow();
        }
        
        // Cargar KPIs
        $('#kpisContainer').empty();
        if (descriptor.kpis && descriptor.kpis.length > 0) {
            for (var i = 0; i < descriptor.kpis.length; i++) {
                addKPIRowWithData(descriptor.kpis[i].indicador, descriptor.kpis[i].frecuencia, descriptor.kpis[i].meta);
            }
        } else {
            for(var i = 1; i <= 3; i++) addKPIRow();
        }
        
        // Cargar perfil
        if (descriptor.perfil) {
            $('input[name="edadMin"]').val(descriptor.perfil.edadMin || 18);
            $('input[name="edadMax"]').val(descriptor.perfil.edadMax || 65);
            $('select[name="sexo"]').val(descriptor.perfil.sexo || 'INDIFERENTE');
            $('select[name="estadoFamiliar"]').val(descriptor.perfil.estadoFamiliar || 'INDIFERENTE');
            $('select[name="disponibilidadHorario"]').val(descriptor.perfil.disponibilidadHorario || 'TIEMPO_COMPLETO');
            $('select[name="modalidadTrabajo"]').val(descriptor.perfil.modalidadTrabajo || 'PRESENCIAL');
            $('select[name="poseerLicencia"]').val(descriptor.perfil.poseerLicencia || '0');
        }
        
        // Cargar responsabilidades
        if (descriptor.responsabilidades) {
            $('select[name="respEquipo"]').val(descriptor.responsabilidades.equipo);
            $('textarea[name="respFondos"]').val(descriptor.responsabilidades.fondos);
            $('textarea[name="respDocumentos"]').val(descriptor.responsabilidades.documentos);
            $('textarea[name="tomaDecisiones"]').val(descriptor.responsabilidades.tomaDecisiones);
            $('textarea[name="respPersonal"]').val(descriptor.responsabilidades.personal);
            $('select[name="impactoEconomico"]').val(descriptor.responsabilidades.impactoEconomico);
        }
        
        // Cargar entrenamiento
        if (descriptor.entrenamiento) {
            $('input[name="personalCargo"]').val(descriptor.entrenamiento.personalCargo || 0);
            $('select[name="tipoEntrenamiento"]').val(descriptor.entrenamiento.tipoEntrenamiento);
            $('select[name="duracionInduccion"]').val(descriptor.entrenamiento.duracion);
            $('input[name="puestosResponsables"]').val(descriptor.entrenamiento.puestosResponsables);
        }
        
        // Marcar que estamos en modo edición
        window._isEditing = true;
        window._editingId = id;
        
        // Actualizar actividades si hay función global
        if (typeof window.actualizarActividadesGlobal === 'function') {
            window.actualizarActividadesGlobal();
        }
        
        // Cargar actividades por función
        if (descriptor.actividadesPorFuncion && descriptor.actividadesPorFuncion.length > 0) {
            setTimeout(function() {
                for (var i = 0; i < descriptor.actividadesPorFuncion.length; i++) {
                    var funcData = descriptor.actividadesPorFuncion[i];
                    var actividades = funcData.actividades;
                    if (actividades && actividades.length > 0) {
                        for (var j = 0; j < actividades.length; j++) {
                            if (typeof window.agregarActividadConTexto === 'function') {
                                window.agregarActividadConTexto(i, actividades[j]);
                            }
                        }
                    }
                }
            }, 500);
        }
    }
};

// Funciones auxiliares para agregar filas con datos
function addFuncionClaveRowWithData(codigo, nombre) {
    $('#funcionesClavesContainer').append('<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest(\'.dynamic-row\').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-3"><input type="text" class="form-control" name="funcionCodigo[]" placeholder="Código" value="' + (codigo || '') + '"></div><div class="col-md-9"><input type="text" class="form-control" name="funcionNombre[]" placeholder="Nombre" value="' + (nombre || '') + '"></div></div></div>');
}

function addFuncionSecundariaRowWithData(texto) {
    $('#funcionesSecundariasContainer').append('<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest(\'.dynamic-row\').remove()"><i class="fas fa-trash"></i></div><textarea class="form-control" name="funcionSecundaria[]" rows="2" placeholder="Describa la función secundaria">' + (texto || '') + '</textarea></div>');
}

function addKPIRowWithData(indicador, frecuencia, meta) {
    $('#kpisContainer').append('<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest(\'.dynamic-row\').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-5"><input type="text" class="form-control" name="kpiIndicador[]" placeholder="Indicador" value="' + (indicador || '') + '"></div><div class="col-md-4"><select class="form-select" name="kpiFrecuencia[]"><option>Diaria</option><option>Semanal</option><option>Mensual</option><option>Trimestral</option><option>Semestral</option><option>Anual</option></select></div><div class="col-md-3"><input type="text" class="form-control" name="kpiMeta[]" placeholder="Meta" value="' + (meta || '') + '"></div></div></div>');
    if (frecuencia) {
        $('#kpisContainer .dynamic-row:last select[name="kpiFrecuencia[]"]').val(frecuencia);
    }
}

window.DescriptorController = DescriptorController;