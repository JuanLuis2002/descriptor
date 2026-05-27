// Controlador para Listar Descriptores
var DescriptorListController = {
    currentUser: null,
    
    init: function(user) {
        this.currentUser = user;
        console.log('DescriptorListController iniciado para:', user.nombre);
        this.loadList();
    },
    
    loadList: function() {
        $.get('modulos/frmDescriptor/view/descriptorList.html', function(html) {
            $('#contentContainer').html(html);
        }).fail(function() {
            $('#contentContainer').html(`
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Error al cargar la lista de descriptores.<br>
                    Verifique: <strong>modulos/frmDescriptor/view/descriptorList.html</strong>
                </div>
            `);
        });
    }
};

window.DescriptorListController = DescriptorListController;