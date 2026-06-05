// Controlador para Listar Descriptores
var DescriptorListController = {
    currentUser: null,
    navigationToken: null,
    
    init: function(user, options) {
        this.currentUser = user;
        this.navigationToken = options && options.navigationToken ? options.navigationToken : (window._currentNavigationToken || null);
        console.log('DescriptorListController iniciado para:', user.nombre);
        this.loadList();
    },
    
    loadList: function() {
        var self = this;
        var token = this.navigationToken;
        
        // Limpiar el contenedor
        $('#contentContainer').empty();
        
        // Resetear la bandera global de la lista
        if (window._listInitialized) {
            window._listInitialized = false;
        }
        
        $.get('modulos/frmDescriptor/view/descriptorList.html', function(html) {
            if (token && typeof window.isCurrentNavigationToken === 'function' && !window.isCurrentNavigationToken(token)) {
                return;
            }
            $('#contentContainer').html(html);
            console.log('Lista de descriptores cargada correctamente');
            // Inicializar la lista después de cargar el HTML
            self.initList(token);
        }).fail(function() {
            if (token && typeof window.isCurrentNavigationToken === 'function' && !window.isCurrentNavigationToken(token)) {
                return;
            }
            $('#contentContainer').html(`
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Error al cargar la lista de descriptores.<br>
                    Verifique: <strong>modulos/frmDescriptor/view/descriptorList.html</strong>
                </div>
            `);
        });
    },
    
    initList: function(token) {
        // Esperar un poco para asegurar que el DOM esté listo
        setTimeout(function() {
            if (token && typeof window.isCurrentNavigationToken === 'function' && !window.isCurrentNavigationToken(token)) {
                return;
            }
            if (typeof window.initDescriptorList === 'function') {
                window.initDescriptorList();
            } else {
                console.log('initDescriptorList no está disponible aún, reintentando...');
                setTimeout(function() {
                    if (token && typeof window.isCurrentNavigationToken === 'function' && !window.isCurrentNavigationToken(token)) {
                        return;
                    }
                    if (typeof window.initDescriptorList === 'function') {
                        window.initDescriptorList();
                    }
                }, 100);
            }
        }, 50);
    }
};

window.DescriptorListController = DescriptorListController;