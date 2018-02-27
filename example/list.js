capivara.component('my-component', {
    template: `        
        <h1 cp-if="mostrar">Exemplo</h1>
        
        <button cp-click="alterar()">Clique para Mostrar</button>
    `,
    controller: function(scope){
        scope.mostrar = false;

        scope.alterar = function(){
            scope.mostrar = !scope.mostrar;
        }

    }
});