// Controlador para Listar Descriptores
var DescriptorListController = {
    currentUser: null,
    
    init: function(user) {
        this.currentUser = user;
        console.log('DescriptorListController iniciado para:', user.nombre);
        this.loadList();
    },
    
    loadList: function() {
        var self = this;
        
        // Limpiar el contenedor
        $('#contentContainer').empty();
        
        // Resetear la bandera global de la lista
        if (window._listInitialized) {
            window._listInitialized = false;
        }
        
        $.get('modulos/frmDescriptor/view/descriptorList.html', function(html) {
            $('#contentContainer').html(html);
            console.log('Lista de descriptores cargada correctamente');
            // Inicializar la lista después de cargar el HTML
            self.initList();
        }).fail(function() {
            $('#contentContainer').html(`
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Error al cargar la lista de descriptores.<br>
                    Verifique: <strong>modulos/frmDescriptor/view/descriptorList.html</strong>
                </div>
            `);
        });
    },
    
    initList: function() {
        // Esperar un poco para asegurar que el DOM esté listo
        setTimeout(function() {
            if (typeof window.initDescriptorList === 'function') {
                window.initDescriptorList();
            } else {
                console.log('initDescriptorList no está disponible aún, reintentando...');
                setTimeout(function() {
                    if (typeof window.initDescriptorList === 'function') {
                        window.initDescriptorList();
                    }
                }, 100);
            }
        }, 50);
    }
};

window.DescriptorListController = DescriptorListController;