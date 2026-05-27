// Controlador del Descriptor
var DescriptorController = {
    currentUser: null,
    descriptorIdToEdit: null,
    
    init: function(user, idToEdit) {
        this.currentUser = user;
        this.descriptorIdToEdit = idToEdit || null;
        console.log('DescriptorController iniciado para:', user.nombre, 'Editando ID:', idToEdit);
        this.loadForm();
    },
    
    loadForm: function() {
        var self = this;
        
        $('#contentContainer').empty();
        
        if (window._descriptorFormLoaded) {
            window._descriptorFormLoaded = false;
        }
        
        $.get('modulos/frmDescriptor/view/descriptorForm.html', function(html) {
            $('#contentContainer').html(html);
            console.log('Formulario cargado correctamente');
            
            if (self.descriptorIdToEdit) {
                setTimeout(function() {
                    self.cargarDatosParaEdicion(self.descriptorIdToEdit);
                }, 400);
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
    
    cargarDatosParaEdicion: function(id) {
        if (typeof DescriptorService === 'undefined') return;
        
        var descriptor = DescriptorService.getById(id);
        if (!descriptor) return;
        
        console.log('Cargando datos del descriptor:', descriptor.codigo);
        
        $('#pageTitle').text('Editar Descriptor');
        $('#saveBtn').text('Actualizar Descriptor');
        
        // Datos básicos
        $('select[name="puesto"]').val(descriptor.puesto);
        $('#areaUsuario').val(descriptor.area);
        $('input[name="reportaA"]').val(descriptor.reportaA);
        $('input[name="fechaEmision"]').val(descriptor.fechaEmision);
        $('textarea[name="objetivo"]').val(descriptor.objetivo);
        
        // Funciones claves
        $('#funcionesClavesContainer').empty();
        if (descriptor.funcionesClaves && descriptor.funcionesClaves.length > 0) {
            for (var i = 0; i < descriptor.funcionesClaves.length; i++) {
                addFuncionClaveRowWithData(descriptor.funcionesClaves[i].codigo, descriptor.funcionesClaves[i].nombre);
            }
        } else {
            for(var i = 1; i <= 4; i++) addFuncionClaveRow();
        }
        
        // Funciones secundarias
        $('#funcionesSecundariasContainer').empty();
        if (descriptor.funcionesSecundarias && descriptor.funcionesSecundarias.length > 0) {
            for (var i = 0; i < descriptor.funcionesSecundarias.length; i++) {
                addFuncionSecundariaRowWithData(descriptor.funcionesSecundarias[i]);
            }
        } else {
            for(var i = 1; i <= 4; i++) addFuncionSecundariaRow();
        }
        
        // KPIs
        $('#kpisContainer').empty();
        if (descriptor.kpis && descriptor.kpis.length > 0) {
            for (var i = 0; i < descriptor.kpis.length; i++) {
                addKPIRowWithData(descriptor.kpis[i].indicador, descriptor.kpis[i].frecuencia, descriptor.kpis[i].meta);
            }
        } else {
            for(var i = 1; i <= 3; i++) addKPIRow();
        }
        
        // Perfil
        if (descriptor.perfil) {
            $('input[name="edadMin"]').val(descriptor.perfil.edadMin || 18);
            $('input[name="edadMax"]').val(descriptor.perfil.edadMax || 65);
            $('select[name="sexo"]').val(descriptor.perfil.sexo || 'INDIFERENTE');
            $('select[name="estadoFamiliar"]').val(descriptor.perfil.estadoFamiliar || 'INDIFERENTE');
            $('select[name="disponibilidadHorario"]').val(descriptor.perfil.disponibilidadHorario || 'TIEMPO_COMPLETO');
            $('select[name="modalidadTrabajo"]').val(descriptor.perfil.modalidadTrabajo || 'PRESENCIAL');
            $('select[name="poseerLicencia"]').val(descriptor.perfil.poseerLicencia || '0');
        }
        
        // Educación
        $('#educacionContainer').empty();
        if (descriptor.educacion && descriptor.educacion.length > 0) {
            for (var i = 0; i < descriptor.educacion.length; i++) {
                addEducacionRowWithData(descriptor.educacion[i].requisito, descriptor.educacion[i].especificaciones, descriptor.educacion[i].requerido);
            }
        } else {
            for(var i = 1; i <= 2; i++) addEducacionRow();
        }
        
        // Experiencia
        $('#experienciaContainer').empty();
        if (descriptor.experiencia && descriptor.experiencia.length > 0) {
            for (var i = 0; i < descriptor.experiencia.length; i++) {
                addExperienciaRowWithData(descriptor.experiencia[i].requisito, descriptor.experiencia[i].requerido);
            }
        } else {
            for(var i = 1; i <= 2; i++) addExperienciaRow();
        }
        
        // Competencias Técnicas
        $('#competenciasTecnicasContainer').empty();
        if (descriptor.competenciasTecnicas && descriptor.competenciasTecnicas.length > 0) {
            for (var i = 0; i < descriptor.competenciasTecnicas.length; i++) {
                addCompetenciaTecnicaRowWithData(
                    descriptor.competenciasTecnicas[i].nombre,
                    descriptor.competenciasTecnicas[i].nivel,
                    descriptor.competenciasTecnicas[i].aplicabilidad
                );
            }
        } else {
            addCompetenciaTecnicaRow();
            addCompetenciaTecnicaRow();
        }
        
        // Competencias Conductuales
        $('#competenciasConductualesContainer').empty();
        if (descriptor.competenciasConductuales && descriptor.competenciasConductuales.length > 0) {
            for (var i = 0; i < descriptor.competenciasConductuales.length; i++) {
                addCompetenciaConductualRowWithData(
                    descriptor.competenciasConductuales[i].nombre,
                    descriptor.competenciasConductuales[i].descripcion,
                    descriptor.competenciasConductuales[i].aplicabilidad
                );
            }
        } else {
            addCompetenciaConductualRow();
            addCompetenciaConductualRow();
        }
        
        // Relaciones Laborales
        $('#relacionesInternasContainer').empty();
        if (descriptor.relacionesLaborales && descriptor.relacionesLaborales.internas && descriptor.relacionesLaborales.internas.length > 0) {
            for (var i = 0; i < descriptor.relacionesLaborales.internas.length; i++) {
                addRelacionInternaRowWithData(descriptor.relacionesLaborales.internas[i].puesto, descriptor.relacionesLaborales.internas[i].razon);
            }
        } else {
            for(var i = 1; i <= 2; i++) addRelacionInternaRow();
        }
        
        $('#relacionesExternasContainer').empty();
        if (descriptor.relacionesLaborales && descriptor.relacionesLaborales.externas && descriptor.relacionesLaborales.externas.length > 0) {
            for (var i = 0; i < descriptor.relacionesLaborales.externas.length; i++) {
                addRelacionExternaRowWithData(descriptor.relacionesLaborales.externas[i].entidad, descriptor.relacionesLaborales.externas[i].razon);
            }
        } else {
            for(var i = 1; i <= 2; i++) addRelacionExternaRow();
        }
        
        // Responsabilidades
        if (descriptor.responsabilidades) {
            $('select[name="respEquipo"]').val(descriptor.responsabilidades.equipo);
            $('textarea[name="respFondos"]').val(descriptor.responsabilidades.fondos);
            $('textarea[name="respDocumentos"]').val(descriptor.responsabilidades.documentos);
            $('textarea[name="tomaDecisiones"]').val(descriptor.responsabilidades.tomaDecisiones);
            $('textarea[name="respPersonal"]').val(descriptor.responsabilidades.personal);
            $('select[name="impactoEconomico"]').val(descriptor.responsabilidades.impactoEconomico);
        }
        
        // Entrenamiento
        if (descriptor.entrenamiento) {
            $('input[name="personalCargo"]').val(descriptor.entrenamiento.personalCargo || 0);
            $('select[name="tipoEntrenamiento"]').val(descriptor.entrenamiento.tipoEntrenamiento);
            $('select[name="duracionInduccion"]').val(descriptor.entrenamiento.duracion);
            $('input[name="puestosResponsables"]').val(descriptor.entrenamiento.puestosResponsables);
        }
        
        window._isEditing = true;
        window._editingId = id;
        
        // Actualizar actividades después de que se carguen las funciones
        setTimeout(function() {
            if (typeof window.actualizarActividadesGlobal === 'function') {
                window.actualizarActividadesGlobal();
            }
            
            // Cargar las actividades guardadas
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
                }, 200);
            }
        }, 500);
    }
};

// Funciones auxiliares para agregar filas con datos
function addFuncionClaveRow() {
    $('#funcionesClavesContainer').append('<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest(\'.dynamic-row\').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-3"><input type="text" class="form-control" name="funcionCodigo[]" placeholder="Código"></div><div class="col-md-9"><input type="text" class="form-control" name="funcionNombre[]" placeholder="Nombre"></div></div></div>');
}

function addFuncionClaveRowWithData(codigo, nombre) {
    $('#funcionesClavesContainer').append('<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest(\'.dynamic-row\').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-3"><input type="text" class="form-control" name="funcionCodigo[]" placeholder="Código" value="' + (codigo || '') + '"></div><div class="col-md-9"><input type="text" class="form-control" name="funcionNombre[]" placeholder="Nombre" value="' + (nombre || '') + '"></div></div></div>');
}

function addFuncionSecundariaRow() {
    $('#funcionesSecundariasContainer').append('<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest(\'.dynamic-row\').remove()"><i class="fas fa-trash"></i></div><textarea class="form-control" name="funcionSecundaria[]" rows="2" placeholder="Describa la función secundaria"></textarea></div>');
}

function addFuncionSecundariaRowWithData(texto) {
    $('#funcionesSecundariasContainer').append('<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest(\'.dynamic-row\').remove()"><i class="fas fa-trash"></i></div><textarea class="form-control" name="funcionSecundaria[]" rows="2" placeholder="Describa la función secundaria">' + (texto || '') + '</textarea></div>');
}

function addKPIRow() {
    $('#kpisContainer').append('<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest(\'.dynamic-row\').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-5"><input type="text" class="form-control" name="kpiIndicador[]" placeholder="Indicador"></div><div class="col-md-4"><select class="form-select" name="kpiFrecuencia[]"><option>Diaria</option><option>Semanal</option><option>Mensual</option><option>Trimestral</option><option>Semestral</option><option>Anual</option></select></div><div class="col-md-3"><input type="text" class="form-control" name="kpiMeta[]" placeholder="Meta"></div></div></div>');
}

function addKPIRowWithData(indicador, frecuencia, meta) {
    $('#kpisContainer').append('<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest(\'.dynamic-row\').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-5"><input type="text" class="form-control" name="kpiIndicador[]" placeholder="Indicador" value="' + (indicador || '') + '"></div><div class="col-md-4"><select class="form-select" name="kpiFrecuencia[]"><option>Diaria</option><option>Semanal</option><option>Mensual</option><option>Trimestral</option><option>Semestral</option><option>Anual</option></select></div><div class="col-md-3"><input type="text" class="form-control" name="kpiMeta[]" placeholder="Meta" value="' + (meta || '') + '"></div></div></div>');
    if (frecuencia) {
        $('#kpisContainer .dynamic-row:last select[name="kpiFrecuencia[]"]').val(frecuencia);
    }
}

function addEducacionRow() {
    $('#educacionContainer').append('<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest(\'.dynamic-row\').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-5"><input type="text" class="form-control" name="eduRequisito[]" placeholder="Requisito"></div><div class="col-md-5"><input type="text" class="form-control" name="eduEspecificaciones[]" placeholder="Especificaciones"></div><div class="col-md-2"><select class="form-select" name="eduRequerido[]"><option value="1">Requerido</option><option value="0">Deseable</option></select></div></div></div>');
}

function addEducacionRowWithData(requisito, especificaciones, requerido) {
    $('#educacionContainer').append('<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest(\'.dynamic-row\').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-5"><input type="text" class="form-control" name="eduRequisito[]" placeholder="Requisito" value="' + (requisito || '') + '"></div><div class="col-md-5"><input type="text" class="form-control" name="eduEspecificaciones[]" placeholder="Especificaciones" value="' + (especificaciones || '') + '"></div><div class="col-md-2"><select class="form-select" name="eduRequerido[]"><option value="1" ' + (requerido == 1 ? 'selected' : '') + '>Requerido</option><option value="0" ' + (requerido == 0 ? 'selected' : '') + '>Deseable</option></select></div></div></div>');
}

function addExperienciaRow() {
    $('#experienciaContainer').append('<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest(\'.dynamic-row\').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-9"><textarea class="form-control" name="expRequisito[]" rows="2" placeholder="Requisito"></textarea></div><div class="col-md-3"><select class="form-select" name="expRequerido[]"><option value="1">Requerido</option><option value="0">Deseable</option></select></div></div></div>');
}

function addExperienciaRowWithData(requisito, requerido) {
    $('#experienciaContainer').append('<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest(\'.dynamic-row\').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-9"><textarea class="form-control" name="expRequisito[]" rows="2" placeholder="Requisito">' + (requisito || '') + '</textarea></div><div class="col-md-3"><select class="form-select" name="expRequerido[]"><option value="1" ' + (requerido == 1 ? 'selected' : '') + '>Requerido</option><option value="0" ' + (requerido == 0 ? 'selected' : '') + '>Deseable</option></select></div></div></div>');
}

function addCompetenciaTecnicaRow() {
    $('#competenciasTecnicasContainer').append('<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest(\'.dynamic-row\').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-5"><input type="text" class="form-control" name="compTecNombre[]" placeholder="Competencia técnica"></div><div class="col-md-4"><select class="form-select" name="compTecNivel[]"><option>Básico</option><option>Intermedio</option><option>Avanzado</option></select></div><div class="col-md-3"><select class="form-select" name="compTecAplicabilidad[]"><option value="SI">Requerida</option><option value="NO">No aplica</option><option value="DESEABLE">Deseable</option></select></div></div></div>');
}

function addCompetenciaTecnicaRowWithData(nombre, nivel, aplicabilidad) {
    $('#competenciasTecnicasContainer').append('<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest(\'.dynamic-row\').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-5"><input type="text" class="form-control" name="compTecNombre[]" placeholder="Competencia técnica" value="' + (nombre || '') + '"></div><div class="col-md-4"><select class="form-select" name="compTecNivel[]"><option>Básico</option><option>Intermedio</option><option>Avanzado</option></select></div><div class="col-md-3"><select class="form-select" name="compTecAplicabilidad[]"><option value="SI" ' + (aplicabilidad === 'SI' ? 'selected' : '') + '>Requerida</option><option value="NO" ' + (aplicabilidad === 'NO' ? 'selected' : '') + '>No aplica</option><option value="DESEABLE" ' + (aplicabilidad === 'DESEABLE' ? 'selected' : '') + '>Deseable</option></select></div></div></div>');
    if (nivel) {
        $('#competenciasTecnicasContainer .dynamic-row:last select[name="compTecNivel[]"]').val(nivel);
    }
}

function addCompetenciaConductualRow() {
    $('#competenciasConductualesContainer').append('<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest(\'.dynamic-row\').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-5"><input type="text" class="form-control" name="compCondNombre[]" placeholder="Competencia conductual"></div><div class="col-md-4"><input type="text" class="form-control" name="compCondDescripcion[]" placeholder="Descripción"></div><div class="col-md-3"><select class="form-select" name="compCondAplicabilidad[]"><option value="SI">Requerida</option><option value="NO">No aplica</option><option value="DESEABLE">Deseable</option></select></div></div></div>');
}

function addCompetenciaConductualRowWithData(nombre, descripcion, aplicabilidad) {
    $('#competenciasConductualesContainer').append('<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest(\'.dynamic-row\').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-5"><input type="text" class="form-control" name="compCondNombre[]" placeholder="Competencia conductual" value="' + (nombre || '') + '"></div><div class="col-md-4"><input type="text" class="form-control" name="compCondDescripcion[]" placeholder="Descripción" value="' + (descripcion || '') + '"></div><div class="col-md-3"><select class="form-select" name="compCondAplicabilidad[]"><option value="SI" ' + (aplicabilidad === 'SI' ? 'selected' : '') + '>Requerida</option><option value="NO" ' + (aplicabilidad === 'NO' ? 'selected' : '') + '>No aplica</option><option value="DESEABLE" ' + (aplicabilidad === 'DESEABLE' ? 'selected' : '') + '>Deseable</option></select></div></div></div>');
}

function addRelacionInternaRow() {
    $('#relacionesInternasContainer').append('<div class="relacion-row"><div class="remove-row" onclick="$(this).closest(\'.relacion-row\').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-6"><input type="text" class="form-control" name="relInternaPuesto[]" placeholder="Puesto/Área"></div><div class="col-md-6"><input type="text" class="form-control" name="relInternaRazon[]" placeholder="Razón"></div></div></div>');
}

function addRelacionInternaRowWithData(puesto, razon) {
    $('#relacionesInternasContainer').append('<div class="relacion-row"><div class="remove-row" onclick="$(this).closest(\'.relacion-row\').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-6"><input type="text" class="form-control" name="relInternaPuesto[]" placeholder="Puesto/Área" value="' + (puesto || '') + '"></div><div class="col-md-6"><input type="text" class="form-control" name="relInternaRazon[]" placeholder="Razón" value="' + (razon || '') + '"></div></div></div>');
}

function addRelacionExternaRow() {
    $('#relacionesExternasContainer').append('<div class="relacion-row"><div class="remove-row" onclick="$(this).closest(\'.relacion-row\').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-6"><input type="text" class="form-control" name="relExternaEntidad[]" placeholder="Entidad externa"></div><div class="col-md-6"><input type="text" class="form-control" name="relExternaRazon[]" placeholder="Razón"></div></div></div>');
}

function addRelacionExternaRowWithData(entidad, razon) {
    $('#relacionesExternasContainer').append('<div class="relacion-row"><div class="remove-row" onclick="$(this).closest(\'.relacion-row\').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-6"><input type="text" class="form-control" name="relExternaEntidad[]" placeholder="Entidad externa" value="' + (entidad || '') + '"></div><div class="col-md-6"><input type="text" class="form-control" name="relExternaRazon[]" placeholder="Razón" value="' + (razon || '') + '"></div></div></div>');
}

window.DescriptorController = DescriptorController;