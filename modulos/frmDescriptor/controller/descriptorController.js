// Controlador del Descriptor
var DescriptorController = {
    currentUser: null,
    
    init: function(user) {
        this.currentUser = user;
        console.log('DescriptorController iniciado para:', user.nombre);
        this.loadForm();
    },
    
    loadForm: function() {
        var self = this;
        $.get('modulos/frmDescriptor/view/descriptorForm.html', function(html) {
            $('#contentContainer').html(html);
            console.log('Formulario cargado correctamente');
        }).fail(function() {
            $('#contentContainer').html(`
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Error al cargar el formulario.<br>
                    Verifique: <strong>modulos/frmDescriptor/view/descriptorForm.html</strong>
                </div>
            `);
        });
    }
};

window.DescriptorController = DescriptorController;