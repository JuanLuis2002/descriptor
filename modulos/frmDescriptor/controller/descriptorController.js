// Controlador para Crear Descriptor
var DescriptorController = {
    currentUser: null,
    
    init: function(user) {
        this.currentUser = user;
        this.loadForm();
    },
    
    loadForm: function() {
        const self = this;
        $.get('modulos/frmDescriptor/view/descriptorForm.html', function(html) {
            $('#contentContainer').html(html);
            // Inicializar el formulario después de cargar el HTML
            self.initForm();
        }).fail(function() {
            $('#contentContainer').html(`
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Error al cargar el formulario. Verifique la ruta.
                </div>
            `);
        });
    },
    
    initForm: function() {
        const currentUserForm = this.currentUser;
        
        // Configurar valores iniciales
        $('#areaUsuario').val(currentUserForm.area || '');
        $('#fechaEmision').val(new Date().toISOString().split('T')[0]);
        
        // Variables de estado
        let currentStep = 1;
        const totalSteps = 14;
        
        // Inicializar filas
        function addFuncionClaveRow() {
            $('#funcionesClavesContainer').append(`<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest('.dynamic-row').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-3"><input type="text" class="form-control" name="funcionCodigo[]" placeholder="Código"></div><div class="col-md-9"><input type="text" class="form-control" name="funcionNombre[]" placeholder="Nombre"></div></div></div>`);
        }
        
        function addFuncionSecundariaRow() {
            $('#funcionesSecundariasContainer').append(`<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest('.dynamic-row').remove()"><i class="fas fa-trash"></i></div><textarea class="form-control" name="funcionSecundaria[]" rows="2" placeholder="Describa la función secundaria"></textarea></div>`);
        }
        
        function addKPIRow() {
            $('#kpisContainer').append(`<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest('.dynamic-row').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-5"><input type="text" class="form-control" name="kpiIndicador[]" placeholder="Indicador"></div><div class="col-md-4"><select class="form-select" name="kpiFrecuencia[]"><option>Diaria</option><option>Semanal</option><option>Mensual</option><option>Trimestral</option><option>Semestral</option><option>Anual</option></select></div><div class="col-md-3"><input type="text" class="form-control" name="kpiMeta[]" placeholder="Meta"></div></div></div>`);
        }
        
        function addEducacionRow() {
            $('#educacionContainer').append(`<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest('.dynamic-row').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-5"><input type="text" class="form-control" name="eduRequisito[]" placeholder="Requisito"></div><div class="col-md-5"><input type="text" class="form-control" name="eduEspecificaciones[]" placeholder="Especificaciones"></div><div class="col-md-2"><select class="form-select" name="eduRequerido[]"><option value="1">Requerido</option><option value="0">Deseable</option></select></div></div></div>`);
        }
        
        function addExperienciaRow() {
            $('#experienciaContainer').append(`<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest('.dynamic-row').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-9"><textarea class="form-control" name="expRequisito[]" rows="2" placeholder="Requisito"></textarea></div><div class="col-md-3"><select class="form-select" name="expRequerido[]"><option value="1">Requerido</option><option value="0">Deseable</option></select></div></div></div>`);
        }
        
        function addCompetenciaTecnicaRow() {
            $('#competenciasTecnicasContainer').append(`<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest('.dynamic-row').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-5"><input type="text" class="form-control" placeholder="Competencia técnica"></div><div class="col-md-4"><select class="form-select"><option>Básico</option><option>Intermedio</option><option>Avanzado</option></select></div><div class="col-md-3"><select class="form-select"><option value="SI">Requerida</option><option value="NO">No aplica</option><option value="DESEABLE">Deseable</option></select></div></div></div>`);
        }
        
        function addCompetenciaConductualRow() {
            $('#competenciasConductualesContainer').append(`<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest('.dynamic-row').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-5"><input type="text" class="form-control" placeholder="Competencia conductual"></div><div class="col-md-4"><input type="text" class="form-control" placeholder="Descripción"></div><div class="col-md-3"><select class="form-select"><option value="SI">Requerida</option><option value="NO">No aplica</option><option value="DESEABLE">Deseable</option></select></div></div></div>`);
        }
        
        function addRelacionInternaRow() {
            $('#relacionesInternasContainer').append(`<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest('.dynamic-row').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-6"><input type="text" class="form-control" placeholder="Puesto/Área"></div><div class="col-md-6"><input type="text" class="form-control" placeholder="Razón"></div></div></div>`);
        }
        
        function addRelacionExternaRow() {
            $('#relacionesExternasContainer').append(`<div class="dynamic-row"><div class="remove-row" onclick="$(this).closest('.dynamic-row').remove()"><i class="fas fa-trash"></i></div><div class="row"><div class="col-md-6"><input type="text" class="form-control" placeholder="Entidad externa"></div><div class="col-md-6"><input type="text" class="form-control" placeholder="Razón"></div></div></div>`);
        }
        
        // Inicializar datos por defecto
        for(let i = 1; i <= 4; i++) addFuncionClaveRow();
        for(let i = 1; i <= 4; i++) addFuncionSecundariaRow();
        for(let i = 1; i <= 3; i++) addKPIRow();
        for(let i = 1; i <= 2; i++) addEducacionRow();
        for(let i = 1; i <= 2; i++) addExperienciaRow();
        for(let i = 1; i <= 1; i++) addRelacionInternaRow();
        for(let i = 1; i <= 1; i++) addRelacionExternaRow();
        addCompetenciaTecnicaRow();
        addCompetenciaTecnicaRow();
        addCompetenciaConductualRow();
        addCompetenciaConductualRow();
        
        // Actualizar display de pasos
        function updateStepDisplay() {
            $('.form-section').removeClass('active-section');
            $(`.form-section[data-section="${currentStep}"]`).addClass('active-section');
            $('.step').removeClass('active completed');
            for(let i = 1; i <= totalSteps; i++) {
                if (i < currentStep) $(`.step[data-step="${i}"]`).addClass('completed');
                else if (i === currentStep) $(`.step[data-step="${i}"]`).addClass('active');
            }
            $('#prevBtn').toggle(currentStep > 1);
            $('#nextBtn').toggle(currentStep < totalSteps);
            $('#saveBtn').toggle(currentStep === totalSteps);
            if (currentStep === totalSteps) updateResumen();
        }
        
        function nextStep() { if (currentStep < totalSteps) { currentStep++; updateStepDisplay(); } }
        function prevStep() { if (currentStep > 1) { currentStep--; updateStepDisplay(); } }
        
        function updateResumen() {
            $('#resumenContent').html(`<h6>Resumen</h6><table class="table table-sm"><tr><td><strong>Puesto:</strong></td><td>${$('select[name="puesto"]').val() || '-'}</td></tr><tr><td><strong>Funciones Claves:</strong></td><td>${$('#funcionesClavesContainer .dynamic-row').length}</td></tr><tr><td><strong>Funciones Secundarias:</strong></td><td>${$('#funcionesSecundariasContainer .dynamic-row').length}</td></tr><tr><td><strong>KPIs:</strong></td><td>${$('#kpisContainer .dynamic-row').length}</td></tr></table><div class="alert alert-info">Revise antes de guardar</div>`);
        }
        
        function saveDescriptor() {
            const funcionesClaves = [];
            $('#funcionesClavesContainer .dynamic-row').each(function() {
                funcionesClaves.push({
                    codigo: $(this).find('input[name="funcionCodigo[]"]').val(),
                    nombre: $(this).find('input[name="funcionNombre[]"]').val()
                });
            });
            
            const funcionesSecundarias = [];
            $('#funcionesSecundariasContainer textarea').each(function() {
                if($(this).val()) funcionesSecundarias.push($(this).val());
            });
            
            const kpis = [];
            $('#kpisContainer .dynamic-row').each(function() {
                kpis.push({
                    indicador: $(this).find('input[name="kpiIndicador[]"]').val(),
                    frecuencia: $(this).find('select[name="kpiFrecuencia[]"]').val(),
                    meta: $(this).find('input[name="kpiMeta[]"]').val()
                });
            });
            
            const formData = {
                puesto: $('select[name="puesto"]').val(),
                area: $('input[name="area"]').val(),
                reportaA: $('input[name="reportaA"]').val(),
                fechaEmision: $('input[name="fechaEmision"]').val(),
                objetivo: $('textarea[name="objetivo"]').val(),
                funcionesClaves: funcionesClaves,
                funcionesSecundarias: funcionesSecundarias,
                kpis: kpis,
                perfil: {
                    edadMin: $('input[name="edadMin"]').val(),
                    edadMax: $('input[name="edadMax"]').val(),
                    sexo: $('select[name="sexo"]').val(),
                    estadoFamiliar: $('select[name="estadoFamiliar"]').val(),
                    disponibilidadHorario: $('select[name="disponibilidadHorario"]').val(),
                    modalidadTrabajo: $('select[name="modalidadTrabajo"]').val(),
                    poseerLicencia: $('select[name="poseerLicencia"]').val()
                },
                responsabilidades: {
                    equipo: $('select[name="respEquipo"]').val(),
                    fondos: $('textarea[name="respFondos"]').val(),
                    documentos: $('textarea[name="respDocumentos"]').val(),
                    tomaDecisiones: $('textarea[name="tomaDecisiones"]').val(),
                    personal: $('textarea[name="respPersonal"]').val(),
                    impactoEconomico: $('select[name="impactoEconomico"]').val()
                },
                entrenamiento: {
                    personalCargo: $('input[name="personalCargo"]').val(),
                    tipoEntrenamiento: $('select[name="tipoEntrenamiento"]').val(),
                    duracion: $('select[name="duracionInduccion"]').val(),
                    puestosResponsables: $('input[name="puestosResponsables"]').val()
                },
                creador: currentUserForm.nombre,
                estado: 'BORRADOR'
            };
            
            DescriptorService.save(formData);
            Swal.fire('Éxito', 'Descriptor guardado como borrador', 'success').then(() => {
                cargarNuevoDescriptor();
            });
        }
        
        // Eventos
        $('#nextBtn').off('click').click(nextStep);
        $('#prevBtn').off('click').click(prevStep);
        $('#saveBtn').off('click').click(saveDescriptor);
        $('.step').off('click').click(function() { const step = parseInt($(this).data('step')); if (step < currentStep) { currentStep = step; updateStepDisplay(); } });
        $('#addFuncionClave').off('click').click(addFuncionClaveRow);
        $('#addFuncionSecundaria').off('click').click(addFuncionSecundariaRow);
        $('#addKPI').off('click').click(addKPIRow);
        $('#addEducacion').off('click').click(addEducacionRow);
        $('#addExperiencia').off('click').click(addExperienciaRow);
        $('#addCompetenciaTecnica').off('click').click(addCompetenciaTecnicaRow);
        $('#addCompetenciaConductual').off('click').click(addCompetenciaConductualRow);
        $('#addRelacionInterna').off('click').click(addRelacionInternaRow);
        $('#addRelacionExterna').off('click').click(addRelacionExternaRow);
        
        updateStepDisplay();
    }
};