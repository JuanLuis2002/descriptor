// Controlador del Descriptor - Módulo frmDescriptor
const DescriptorController = {
    currentUser: null,
    
    init: function(user) {
        this.currentUser = user;
        this.loadForm();
    },
    
    loadForm: function() {
        // Cargar la vista del formulario
        $.get('modulos/frmDescriptor/view/descriptorForm.html', function(html) {
            $('#contentContainer').html(html);
        }).fail(function() {
            $('#contentContainer').html(`
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Error al cargar el formulario. Verifique la ruta.
                </div>
            `);
        });
    }
};