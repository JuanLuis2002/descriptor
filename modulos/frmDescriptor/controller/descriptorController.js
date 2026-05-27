// Controlador del Descriptor - Módulo frmDescriptor
const DescriptorController = {
    currentUser: null,
    
    init: function(user) {
        this.currentUser = user;
        console.log('DescriptorController iniciado para:', user.nombre);
        this.loadForm();
    },
    
    loadForm: function() {
        const self = this;
        // Cargar la vista del formulario
        $.get('modulos/frmDescriptor/view/descriptorForm.html', function(html) {
            $('#contentContainer').html(html);
            console.log('Formulario cargado correctamente');
            // Inicializar eventos del formulario después de cargar
            self.initFormEvents();
        }).fail(function(err) {
            console.error('Error cargando formulario:', err);
            $('#contentContainer').html(`
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Error al cargar el formulario. Verifique la ruta:<br>
                    <strong>modulos/frmDescriptor/view/descriptorForm.html</strong>
                </div>
            `);
        });
    },
    
    initFormEvents: function() {
        // Inicializar el formulario si la función existe en el HTML
        if (typeof initFormularioDescriptor === 'function') {
            initFormularioDescriptor();
        }
    }
};

// Hacer disponible globalmente
window.DescriptorController = DescriptorController;