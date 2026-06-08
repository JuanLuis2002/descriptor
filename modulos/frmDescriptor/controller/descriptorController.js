// Controlador del Descriptor
var DescriptorController = {
    currentUser: null,
    descriptorIdToEdit: null,
    readOnlyMode: false,
    canEditThComplements: false,
    navigationToken: null,
    afterSaveModule: null,
    
    init: function(user, idToEdit, options) {
        this.currentUser = user;
        this.descriptorIdToEdit = idToEdit || null;
        this.readOnlyMode = !!(options && options.readOnly);
        this.canEditThComplements = !!(options && options.canEditThComplements);
        this.navigationToken = options && options.navigationToken ? options.navigationToken : (window._currentNavigationToken || null);
        this.afterSaveModule = options && options.afterSaveModule ? options.afterSaveModule : null;
        window._thReviewMode = !!(options && options.thReview);
        window._canEditThComplements = this.canEditThComplements;
        window._readOnlyDescriptor = this.readOnlyMode;
        window._allowDescriptorPartialSave = this.readOnlyMode && this.canEditThComplements;
        window._descriptorWorkflowEditor = this.afterSaveModule === 'TH' || this.afterSaveModule === 'JTH';
        window._afterDescriptorSaveModule = this.afterSaveModule;
        if (!this.descriptorIdToEdit) {
            this.resetFormState();
        }
        console.log('DescriptorController iniciado para:', user.nombre, 'Editando ID:', idToEdit, 'Solo lectura:', this.readOnlyMode);
        this.loadForm();
    },
    
    resetFormState: function() {
        window._isEditing = false;
        window._editingId = null;
        window._savedActividades = null;
        window._readOnlyDescriptor = false;
        window._thReviewMode = false;
        window._canEditThComplements = false;
        window._allowDescriptorPartialSave = false;
        window._descriptorWorkflowEditor = false;
        window._afterDescriptorSaveModule = null;
    },
    
    loadForm: function() {
        var self = this;
        var token = this.navigationToken;
        
        $('#contentContainer').empty();
        
        if (window._descriptorFormLoaded) {
            window._descriptorFormLoaded = false;
        }
        
        $.get('modulos/frmDescriptor/view/descriptorForm.html', function(html) {
            if (token && typeof window.isCurrentNavigationToken === 'function' && !window.isCurrentNavigationToken(token)) {
                return;
            }
            $('#contentContainer').html(html);
            console.log('Formulario cargado correctamente');
            
            if (self.descriptorIdToEdit) {
                setTimeout(function() {
                    if (token && typeof window.isCurrentNavigationToken === 'function' && !window.isCurrentNavigationToken(token)) {
                        return;
                    }
                    self.cargarDatosParaEdicion(self.descriptorIdToEdit);
                }, 400);
            }
        }).fail(function() {
            if (token && typeof window.isCurrentNavigationToken === 'function' && !window.isCurrentNavigationToken(token)) {
                return;
            }
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
        var self = this;
        if (typeof DescriptorService === 'undefined') return;
        
        var descriptor = DescriptorService.getById(id);
        if (!descriptor) return;
        
        console.log('Cargando datos del descriptor:', descriptor.codigo);
        
        $('#pageTitle').text(this.readOnlyMode ? 'Detalle del Descriptor' : 'Editar Descriptor');
        $('#saveBtn').text(this.readOnlyMode ? 'Solo lectura' : 'Actualizar Descriptor');
        window._savedActividades = null;
        
        // Datos básicos
        $('select[name="tipoFormato"]').val(descriptor.tipoFormato || 'CORTA').trigger('change');
        $('select[name="puesto"]').val(descriptor.puesto);
        $('#areaUsuario').val(descriptor.area);
        if (typeof window.actualizarResponsablesPorPuesto === 'function') {
            window.actualizarResponsablesPorPuesto(descriptor.reportaA);
        } else {
            $('select[name="puesto"]').trigger('change');
            $('select[name="reportaA"]').val(descriptor.reportaA);
        }
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
        } else if (this.readOnlyMode && window._thReviewMode && (descriptor.tipoFormato || 'CORTA') === 'EXTENSA') {
            addRelacionInternaRow();
        } else if (!this.readOnlyMode) {
            for(var i = 1; i <= 2; i++) addRelacionInternaRow();
        }
        
        $('#relacionesExternasContainer').empty();
        if (descriptor.relacionesLaborales && descriptor.relacionesLaborales.externas && descriptor.relacionesLaborales.externas.length > 0) {
            for (var i = 0; i < descriptor.relacionesLaborales.externas.length; i++) {
                addRelacionExternaRowWithData(descriptor.relacionesLaborales.externas[i].entidad, descriptor.relacionesLaborales.externas[i].razon);
            }
        } else if (this.readOnlyMode && window._thReviewMode && (descriptor.tipoFormato || 'CORTA') === 'EXTENSA') {
            addRelacionExternaRow();
        } else if (!this.readOnlyMode) {
            for(var i = 1; i <= 2; i++) addRelacionExternaRow();
        }
        
        // Complementos TH
        $('#requerimientosContainer').empty();
        var requerimientos = descriptor.requerimientosOrganizacionales && descriptor.requerimientosOrganizacionales.length > 0
            ? descriptor.requerimientosOrganizacionales
            : ['Cumplir con los valores institucionales', 'Cumplir con los normativos institucionales', 'Cumplir con las competencias requeridas para el cargo'];
        for (var r = 0; r < requerimientos.length; r++) {
            addRequerimientoRowWithData(requerimientos[r]);
        }
        
        $('#riesgosContainer').empty();
        if (descriptor.riesgosFisicos) {
            $('textarea[name="riesgoEsfuerzo"]').val(descriptor.riesgosFisicos.esfuerzo || '');
            $('textarea[name="riesgoCondiciones"]').val(descriptor.riesgosFisicos.condiciones || '');
            var riesgos = descriptor.riesgosFisicos.riesgos || [];
            if (riesgos.length > 0) {
                for (var z = 0; z < riesgos.length; z++) addRiesgoRowWithData(riesgos[z]);
            } else if (this.readOnlyMode && window._thReviewMode && (descriptor.tipoFormato || 'CORTA') === 'EXTENSA') {
                addRiesgoRow();
            } else if (!this.readOnlyMode && (descriptor.tipoFormato || 'CORTA') === 'EXTENSA') {
                addRiesgoRow();
            }
        } else if (this.readOnlyMode && window._thReviewMode && (descriptor.tipoFormato || 'CORTA') === 'EXTENSA') {
            addRiesgoRow();
        } else if (!this.readOnlyMode && (descriptor.tipoFormato || 'CORTA') === 'EXTENSA') {
            addRiesgoRow();
        }
        
        // Responsabilidades
        if (descriptor.responsabilidades) {
            $('select[name="respEquipo"]').val(descriptor.responsabilidades.equipo);
            $('textarea[name="respFondos"]').val(descriptor.responsabilidades.fondos);
            $('textarea[name="respDocumentos"]').val(descriptor.responsabilidades.documentos);
            $('textarea[name="tomaDecisiones"]').val(descriptor.responsabilidades.tomaDecisiones);
            $('textarea[name="respPersonal"]').val(descriptor.responsabilidades.personal);
            var impactoEconomico = descriptor.responsabilidades.impactoEconomico;
            if (impactoEconomico === 'Poco significativo') {
                impactoEconomico = 'Rango 1: Poco significativo - menor a $50,000';
            }
            $('select[name="impactoEconomico"]').val(impactoEconomico);
        }
        
        // Entrenamiento
        if (descriptor.entrenamiento) {
            $('input[name="personalCargo"]').val(descriptor.entrenamiento.personalCargo || 0);
            $('select[name="tipoEntrenamiento"]').val(descriptor.entrenamiento.tipoEntrenamiento);
            $('select[name="duracionInduccion"]').val(descriptor.entrenamiento.duracion);
            $('input[name="puestosResponsables"]').val(descriptor.entrenamiento.puestosResponsables);
        }
        
        window._isEditing = !this.readOnlyMode || window._allowDescriptorPartialSave === true;
        window._editingId = id;
        
        // Guardar las actividades para cargarlas después de que se actualicen las funciones
        if (descriptor.actividadesPorFuncion && descriptor.actividadesPorFuncion.length > 0) {
            // Guardar actividades temporalmente
            window._savedActividades = descriptor.actividadesPorFuncion;
        }
        
        // Actualizar actividades después de que se carguen las funciones
        setTimeout(function() {
            if (typeof window.actualizarActividadesGlobal === 'function') {
                window.actualizarActividadesGlobal();
            } else if (typeof actualizarActividades === 'function') {
                actualizarActividades();
            }
            if (self.readOnlyMode) {
                self.aplicarModoSoloLectura();
            }
        }, 600);
    },
    
    aplicarModoSoloLectura: function() {
        $('.descriptor-save-top').hide();
        $('#saveBtn').hide();
        $('#descriptorForm').find('input, select, textarea').prop('disabled', true);
        $('#descriptorForm').find(
            '#addFuncionClave, #addFuncionSecundaria, #addKPI, #addEducacion, #addExperiencia, #addCompetenciaTecnica, #addCompetenciaConductual'
        ).hide();
        $('#descriptorForm').find('.btn-outline-danger').hide();
        $('#descriptorForm').find('.funciones-add-btn').not('.actividad-btn').hide();
        if (window._thReviewMode && window._canEditThComplements) {
            $('.descriptor-save-top').show();
            $('#saveBtn').show();
            $('#descriptorForm').find('select[name="impactoEconomico"]').prop('disabled', false);
            $('#descriptorForm').find('#requerimientosContainer input, #requerimientosContainer select, #requerimientosContainer textarea').prop('disabled', false);
            $('#descriptorForm').find('#addRequerimientoOrganizacional, #requerimientosContainer .th-remove-btn').show();
            $('#descriptorForm').find('#addRelacionInterna, #addRelacionExterna, #addRiesgoFisico').hide();
        } else if (window._thReviewMode) {
            $('#descriptorForm').find('.th-editable-section input, .th-editable-section select, .th-editable-section textarea').prop('disabled', true);
            $('#descriptorForm').find('.th-editable-section .th-add-btn, .th-editable-section .th-remove-btn').hide();
        }
        if ($('#readOnlyDescriptorAlert').length === 0) {
            var mensajeSoloLectura = window._thReviewMode && window._canEditThComplements
                ? 'Modo revisión TH: puede modificar Requerimientos Organizacionales e Impacto Económico. El resto del descriptor queda a cargo del jefe inmediato.'
                : 'Modo solo lectura: puede consultar el descriptor, pero no modificarlo.';
            $('.descriptor-save-top').after(
                '<div id="readOnlyDescriptorAlert" class="alert alert-info py-2 mb-3">' +
                '<i class="fas fa-eye me-1"></i> ' + mensajeSoloLectura +
                '</div>'
            );
        }
    }
};

// Funciones auxiliares para agregar filas con datos
function addFuncionClaveRow() {
    ensureFuncionesClavesTable();
    $('#funcionesClavesTableBody').append(buildFuncionClaveTableRow('', ''));
    renumerarFuncionesClaveTable();
}

function addFuncionClaveRowWithData(codigo, nombre) {
    ensureFuncionesClavesTable();
    $('#funcionesClavesTableBody').append(buildFuncionClaveTableRow(codigo, nombre));
    renumerarFuncionesClaveTable();
}

function ensureFuncionesClavesTable() {
    if ($('#funcionesClavesTableBody').length > 0) return;
    $('#funcionesClavesContainer').html('<div class="table-responsive"><table class="table table-bordered funciones-table mb-2"><thead><tr><th style="width:80px;">Código</th><th>Nombre de la función clave</th><th style="width:150px;" class="text-center actividad-funcion-action">Actividades</th><th style="width:54px;" class="text-center">Acción</th></tr></thead><tbody id="funcionesClavesTableBody"></tbody></table></div>');
}

function buildFuncionClaveTableRow(codigo, nombre) {
    return '<tr class="dynamic-row funcion-clave-row">' +
        '<td class="funcion-codigo"><input type="hidden" name="funcionCodigo[]" value="' + (codigo || '') + '"><span class="funcion-codigo-text">' + (codigo || '') + '</span></td>' +
        '<td><input type="text" class="form-control" name="funcionNombre[]" placeholder="Nombre de la función" value="' + (nombre || '').replace(/"/g, '&quot;') + '"></td>' +
        '<td class="text-center actividad-funcion-action"><button type="button" class="btn btn-sm btn-outline-primary actividad-btn" onclick="if (typeof abrirActividadesFuncionGlobal === \'function\') abrirActividadesFuncionGlobal($(this).closest(\'tr\').index());"><i class="fas fa-list-check me-1"></i> Actividades <span class="badge rounded-pill bg-primary actividad-count-badge">0</span></button></td>' +
        '<td class="text-center"><button type="button" class="btn btn-sm btn-outline-danger" onclick="$(this).closest(\'tr\').remove(); if (typeof renumerarFuncionesClaveGlobal === \'function\') renumerarFuncionesClaveGlobal(); else renumerarFuncionesClaveTable();"><i class="fas fa-trash"></i></button></td>' +
        '</tr>';
}

function renumerarFuncionesClaveTable() {
    $('#funcionesClavesTableBody tr').each(function(index) {
        var codigo = String(index + 1);
        $(this).find('input[name="funcionCodigo[]"]').val(codigo);
        $(this).find('.funcion-codigo-text').text(codigo);
    });
}

function addFuncionSecundariaRow() {
    ensureFuncionesSecundariasTable();
    $('#funcionesSecundariasTableBody').append(buildFuncionSecundariaTableRow(''));
    renumerarFuncionesSecundariasTable();
}

function addFuncionSecundariaRowWithData(texto) {
    ensureFuncionesSecundariasTable();
    $('#funcionesSecundariasTableBody').append(buildFuncionSecundariaTableRow(texto));
    renumerarFuncionesSecundariasTable();
}

function ensureFuncionesSecundariasTable() {
    if ($('#funcionesSecundariasTableBody').length > 0) return;
    $('#funcionesSecundariasContainer').html('<div class="table-responsive"><table class="table table-bordered funciones-table mb-2"><thead><tr><th style="width:80px;">Código</th><th>Descripción de la función secundaria</th><th style="width:54px;" class="text-center">Acción</th></tr></thead><tbody id="funcionesSecundariasTableBody"></tbody></table></div>');
}

function buildFuncionSecundariaTableRow(texto) {
    return '<tr class="dynamic-row funcion-secundaria-row">' +
        '<td class="funcion-codigo"><span class="funcion-sec-codigo-text"></span></td>' +
        '<td><textarea class="form-control" name="funcionSecundaria[]" rows="1" placeholder="Describa la función secundaria">' + (texto || '') + '</textarea></td>' +
        '<td class="text-center"><button type="button" class="btn btn-sm btn-outline-danger" onclick="$(this).closest(\'tr\').remove(); if (typeof renumerarFuncionesSecundariasGlobal === \'function\') renumerarFuncionesSecundariasGlobal(); else renumerarFuncionesSecundariasTable();"><i class="fas fa-trash"></i></button></td>' +
        '</tr>';
}

function renumerarFuncionesSecundariasTable() {
    $('#funcionesSecundariasTableBody tr').each(function(index) {
        $(this).find('.funcion-sec-codigo-text').text(index + 1);
    });
}

var catalogoFrecuenciasKPI = [
    { codigo: 'DIARIA', descripcion: 'Diaria', activo: true },
    { codigo: 'SEMANAL', descripcion: 'Semanal', activo: true },
    { codigo: 'MENSUAL', descripcion: 'Mensual', activo: true },
    { codigo: 'TRIMESTRAL', descripcion: 'Trimestral', activo: true },
    { codigo: 'SEMESTRAL', descripcion: 'Semestral', activo: true },
    { codigo: 'ANUAL', descripcion: 'Anual', activo: true }
];

function buildFrecuenciasKPIOptions(selectedValue) {
    var options = '';
    for (var i = 0; i < catalogoFrecuenciasKPI.length; i++) {
        var item = catalogoFrecuenciasKPI[i];
        if (!item.activo) continue;
        var selected = item.descripcion === selectedValue || item.codigo === selectedValue ? ' selected' : '';
        options += '<option value="' + item.descripcion + '"' + selected + '>' + item.descripcion + '</option>';
    }
    return options;
}

function addKPIRow() {
    ensureKPITable();
    $('#kpisTableBody').append(buildKPITableRow('', '', ''));
    renumerarKPITable();
}

function addKPIRowWithData(indicador, frecuencia, meta) {
    ensureKPITable();
    $('#kpisTableBody').append(buildKPITableRow(indicador, frecuencia, meta));
    renumerarKPITable();
}

function ensureKPITable() {
    if ($('#kpisTableBody').length > 0) return;
    $('#kpisContainer').html('<div class="table-responsive"><table class="table table-bordered funciones-table mb-2"><thead><tr><th style="width:80px;">Código</th><th>Indicador</th><th style="width:190px;">Frecuencia</th><th style="width:170px;">Meta</th><th style="width:54px;" class="text-center">Acción</th></tr></thead><tbody id="kpisTableBody"></tbody></table></div>');
}

function buildKPITableRow(indicador, frecuencia, meta) {
    return '<tr class="dynamic-row kpi-row">' +
        '<td class="funcion-codigo"><span class="kpi-codigo-text"></span></td>' +
        '<td><input type="text" class="form-control" name="kpiIndicador[]" placeholder="Indicador" value="' + (indicador || '').replace(/"/g, '&quot;') + '"></td>' +
        '<td><select class="form-select" name="kpiFrecuencia[]">' + buildFrecuenciasKPIOptions(frecuencia) + '</select></td>' +
        '<td><input type="text" class="form-control" name="kpiMeta[]" placeholder="Meta" value="' + (meta || '').replace(/"/g, '&quot;') + '"></td>' +
        '<td class="text-center"><button type="button" class="btn btn-sm btn-outline-danger" onclick="$(this).closest(\'tr\').remove(); if (typeof renumerarKPIsGlobal === \'function\') renumerarKPIsGlobal(); else renumerarKPITable();"><i class="fas fa-trash"></i></button></td>' +
        '</tr>';
}

function renumerarKPITable() {
    $('#kpisTableBody tr').each(function(index) {
        $(this).find('.kpi-codigo-text').text(index + 1);
    });
}

function addEducacionRow() {
    ensureEducacionTable();
    $('#educacionTableBody').append(buildEducacionTableRow('', '', '1'));
    renumerarEducacionTable();
}

function addEducacionRowWithData(requisito, especificaciones, requerido) {
    ensureEducacionTable();
    $('#educacionTableBody').append(buildEducacionTableRow(requisito, especificaciones, requerido));
    renumerarEducacionTable();
}

function addExperienciaRow() {
    ensureExperienciaTable();
    $('#experienciaTableBody').append(buildExperienciaTableRow('', '1'));
    renumerarExperienciaTable();
}

function addExperienciaRowWithData(requisito, requerido) {
    ensureExperienciaTable();
    $('#experienciaTableBody').append(buildExperienciaTableRow(requisito, requerido));
    renumerarExperienciaTable();
}

function ensureEducacionTable() {
    if ($('#educacionTableBody').length > 0) return;
    $('#educacionContainer').html('<div class="table-responsive"><table class="table table-bordered funciones-table mb-2"><thead><tr><th style="width:80px;">Código</th><th>Requisito</th><th>Especificaciones</th><th style="width:150px;">Tipo</th><th style="width:54px;" class="text-center">Acción</th></tr></thead><tbody id="educacionTableBody"></tbody></table></div>');
}

function buildEducacionTableRow(requisito, especificaciones, requerido) {
    return '<tr class="dynamic-row educacion-row">' +
        '<td class="funcion-codigo"><span class="educacion-codigo-text"></span></td>' +
        '<td><input type="text" class="form-control" name="eduRequisito[]" placeholder="Requisito" value="' + (requisito || '').replace(/"/g, '&quot;') + '"></td>' +
        '<td><input type="text" class="form-control" name="eduEspecificaciones[]" placeholder="Especificaciones" value="' + (especificaciones || '').replace(/"/g, '&quot;') + '"></td>' +
        '<td><select class="form-select" name="eduRequerido[]"><option value="1" ' + (requerido == 1 ? 'selected' : '') + '>Requerido</option><option value="0" ' + (requerido == 0 ? 'selected' : '') + '>Deseable</option></select></td>' +
        '<td class="text-center"><button type="button" class="btn btn-sm btn-outline-danger" onclick="$(this).closest(\'tr\').remove(); if (typeof renumerarEducacionGlobal === \'function\') renumerarEducacionGlobal(); else renumerarEducacionTable();"><i class="fas fa-trash"></i></button></td>' +
        '</tr>';
}

function renumerarEducacionTable() {
    $('#educacionTableBody tr').each(function(index) {
        $(this).find('.educacion-codigo-text').text(index + 1);
    });
}

function ensureExperienciaTable() {
    if ($('#experienciaTableBody').length > 0) return;
    $('#experienciaContainer').html('<div class="table-responsive"><table class="table table-bordered funciones-table mb-2"><thead><tr><th style="width:80px;">Código</th><th>Requisito</th><th style="width:150px;">Tipo</th><th style="width:54px;" class="text-center">Acción</th></tr></thead><tbody id="experienciaTableBody"></tbody></table></div>');
}

function buildExperienciaTableRow(requisito, requerido) {
    return '<tr class="dynamic-row experiencia-row">' +
        '<td class="funcion-codigo"><span class="experiencia-codigo-text"></span></td>' +
        '<td><textarea class="form-control" name="expRequisito[]" rows="1" placeholder="Requisito">' + (requisito || '') + '</textarea></td>' +
        '<td><select class="form-select" name="expRequerido[]"><option value="1" ' + (requerido == 1 ? 'selected' : '') + '>Requerido</option><option value="0" ' + (requerido == 0 ? 'selected' : '') + '>Deseable</option></select></td>' +
        '<td class="text-center"><button type="button" class="btn btn-sm btn-outline-danger" onclick="$(this).closest(\'tr\').remove(); if (typeof renumerarExperienciaGlobal === \'function\') renumerarExperienciaGlobal(); else renumerarExperienciaTable();"><i class="fas fa-trash"></i></button></td>' +
        '</tr>';
}

function renumerarExperienciaTable() {
    $('#experienciaTableBody tr').each(function(index) {
        $(this).find('.experiencia-codigo-text').text(index + 1);
    });
}

function addCompetenciaTecnicaRow() {
    ensureCompetenciasTecnicasTable();
    $('#competenciasTecnicasTableBody').append(buildCompetenciaTecnicaTableRow('', '', 'SI'));
    renumerarCompetenciasTecnicasTable();
}

function addCompetenciaTecnicaRowWithData(nombre, nivel, aplicabilidad) {
    ensureCompetenciasTecnicasTable();
    $('#competenciasTecnicasTableBody').append(buildCompetenciaTecnicaTableRow(nombre, nivel, aplicabilidad));
    renumerarCompetenciasTecnicasTable();
}

function addCompetenciaConductualRow() {
    ensureCompetenciasConductualesTable();
    $('#competenciasConductualesTableBody').append(buildCompetenciaConductualTableRow('', '', 'SI'));
    renumerarCompetenciasConductualesTable();
    if (typeof actualizarCompetenciasConductualesPorFormato === 'function') actualizarCompetenciasConductualesPorFormato();
}

function addCompetenciaConductualRowWithData(nombre, descripcion, aplicabilidad) {
    ensureCompetenciasConductualesTable();
    $('#competenciasConductualesTableBody').append(buildCompetenciaConductualTableRow(nombre, descripcion, aplicabilidad));
    renumerarCompetenciasConductualesTable();
    if (typeof actualizarCompetenciasConductualesPorFormato === 'function') actualizarCompetenciasConductualesPorFormato();
}

function ensureCompetenciasTecnicasTable() {
    if ($('#competenciasTecnicasTableBody').length > 0) return;
    $('#competenciasTecnicasContainer').html('<div class="table-responsive"><table class="table table-bordered funciones-table mb-2"><thead><tr><th style="width:80px;">Código</th><th>Competencia técnica</th><th style="width:170px;">Nivel</th><th style="width:170px;">Aplicabilidad</th><th style="width:54px;" class="text-center">Acción</th></tr></thead><tbody id="competenciasTecnicasTableBody"></tbody></table></div>');
}

function buildCompetenciaTecnicaTableRow(nombre, nivel, aplicabilidad) {
    return '<tr class="dynamic-row competencia-tecnica-row">' +
        '<td class="funcion-codigo"><span class="comp-tec-codigo-text"></span></td>' +
        '<td><input type="text" class="form-control" name="compTecNombre[]" placeholder="Competencia técnica" value="' + (nombre || '').replace(/"/g, '&quot;') + '"></td>' +
        '<td><select class="form-select" name="compTecNivel[]"><option ' + (nivel === 'Básico' ? 'selected' : '') + '>Básico</option><option ' + (nivel === 'Intermedio' ? 'selected' : '') + '>Intermedio</option><option ' + (nivel === 'Avanzado' ? 'selected' : '') + '>Avanzado</option></select></td>' +
        '<td><select class="form-select" name="compTecAplicabilidad[]"><option value="SI" ' + (aplicabilidad === 'SI' ? 'selected' : '') + '>Requerida</option><option value="NO" ' + (aplicabilidad === 'NO' ? 'selected' : '') + '>No aplica</option><option value="DESEABLE" ' + (aplicabilidad === 'DESEABLE' ? 'selected' : '') + '>Deseable</option></select></td>' +
        '<td class="text-center"><button type="button" class="btn btn-sm btn-outline-danger" onclick="$(this).closest(\'tr\').remove(); if (typeof renumerarCompetenciasTecnicasGlobal === \'function\') renumerarCompetenciasTecnicasGlobal(); else renumerarCompetenciasTecnicasTable();"><i class="fas fa-trash"></i></button></td>' +
        '</tr>';
}

function renumerarCompetenciasTecnicasTable() {
    $('#competenciasTecnicasTableBody tr').each(function(index) {
        $(this).find('.comp-tec-codigo-text').text(index + 1);
    });
}

function ensureCompetenciasConductualesTable() {
    if ($('#competenciasConductualesTableBody').length > 0) return;
    $('#competenciasConductualesContainer').html('<div class="table-responsive"><table class="table table-bordered funciones-table mb-2"><thead><tr><th style="width:80px;">Código</th><th>Competencia conductual</th><th class="comp-cond-extra">Descripción</th><th class="comp-cond-extra" style="width:170px;">Aplicabilidad</th><th style="width:54px;" class="text-center">Acción</th></tr></thead><tbody id="competenciasConductualesTableBody"></tbody></table></div>');
}

function buildCompetenciaConductualTableRow(nombre, descripcion, aplicabilidad) {
    return '<tr class="dynamic-row competencia-conductual-row">' +
        '<td class="funcion-codigo"><span class="comp-cond-codigo-text"></span></td>' +
        '<td><input type="text" class="form-control" name="compCondNombre[]" placeholder="Competencia conductual" value="' + (nombre || '').replace(/"/g, '&quot;') + '"></td>' +
        '<td class="comp-cond-extra"><input type="text" class="form-control" name="compCondDescripcion[]" placeholder="Descripción" value="' + (descripcion || '').replace(/"/g, '&quot;') + '"></td>' +
        '<td class="comp-cond-extra"><select class="form-select" name="compCondAplicabilidad[]"><option value="SI" ' + (aplicabilidad === 'SI' ? 'selected' : '') + '>Requerida</option><option value="NO" ' + (aplicabilidad === 'NO' ? 'selected' : '') + '>No aplica</option><option value="DESEABLE" ' + (aplicabilidad === 'DESEABLE' ? 'selected' : '') + '>Deseable</option></select></td>' +
        '<td class="text-center"><button type="button" class="btn btn-sm btn-outline-danger" onclick="$(this).closest(\'tr\').remove(); if (typeof renumerarCompetenciasConductualesGlobal === \'function\') renumerarCompetenciasConductualesGlobal(); else renumerarCompetenciasConductualesTable();"><i class="fas fa-trash"></i></button></td>' +
        '</tr>';
}

function renumerarCompetenciasConductualesTable() {
    $('#competenciasConductualesTableBody tr').each(function(index) {
        $(this).find('.comp-cond-codigo-text').text(index + 1);
    });
}

function addRelacionInternaRow() {
    if (typeof window.addRelacionInternaFormRow === 'function') {
        window.addRelacionInternaFormRow('', '');
    }
}

function addRelacionInternaRowWithData(puesto, razon) {
    if (typeof window.addRelacionInternaFormRow === 'function') {
        window.addRelacionInternaFormRow(puesto, razon);
    }
}

function addRelacionExternaRow() {
    if (typeof window.addRelacionExternaFormRow === 'function') {
        window.addRelacionExternaFormRow('', '');
    }
}

function addRelacionExternaRowWithData(entidad, razon) {
    if (typeof window.addRelacionExternaFormRow === 'function') {
        window.addRelacionExternaFormRow(entidad, razon);
    }
}

function addRequerimientoRowWithData(texto) {
    if (typeof window.addRequerimientoFormRow === 'function') {
        window.addRequerimientoFormRow(texto);
    }
}

function addRiesgoRow() {
    if (typeof window.addRiesgoFormRow === 'function') {
        window.addRiesgoFormRow('');
    }
}

function addRiesgoRowWithData(texto) {
    if (typeof window.addRiesgoFormRow === 'function') {
        window.addRiesgoFormRow(texto);
    }
}

window.DescriptorController = DescriptorController;