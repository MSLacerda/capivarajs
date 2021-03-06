import { } from 'jasmine';
import capivara from '../../src/index';

describe('test interpolation', () => {
    const template = `
        <h1>[[$ctrl.name]]</h1>
        <h2>[[:$ctrl.name]]</h2>
    `;
    const element = document.createElement('div');
    element.innerHTML = template;

    capivara.controller(element, function() {
        const $ctrl = this;

        $ctrl.$onInit = () => {
            $ctrl.name = 'Felipe';
        };

        $ctrl.$onViewInit = () => {
            setTimeout(() => {
                $ctrl.name = 'Felipe Sabadini';
            }, 1000);
            it("Expected field name is equal to scope", function(done) {
                setTimeout(function() {
                    expect(element.querySelector('h1').innerHTML).toEqual($ctrl.name);
                    done();
                }, 2000);
            }, 3000);
            it("Expected field name not equal to scope", function(done) {
                setTimeout(function() {
                    expect(element.querySelector('h2').innerHTML).toEqual('Felipe');
                    done();
                }, 2000);
            }, 3000);
        };
    });
});
