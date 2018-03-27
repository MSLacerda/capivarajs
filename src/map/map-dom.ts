import * as _ from 'lodash';
import { Common } from '../common';
import { Constants } from '../constants';
import { CPClass } from "./directive/cp-class";
import { CPClick } from './directive/cp-click';
import { CPElse } from "./directive/cp-else";
import { CPElseIf } from "./directive/cp-else-if";
import { CPIf } from "./directive/cp-if";
import { CPInit } from "./directive/cp-init";
import { CPModel } from './directive/cp-model';
import { CPRepeat } from './directive/cp-repeat';
import { CPShow } from './directive/cp-show';
import { CPStyle } from "./directive/cp-style";

export class MapDom {

    /**
     * Elemento principal que está aplicado o escopo
     */
    private element: HTMLElement;

    /**
     * Mapa de atributos com os elementos que os observam.
     */
    private cpModels = {};

    /**
     * Array com os ng repeat
     */
    private repeats = [];

    private cpShows = [];

    private cpIfs = [];

    private cpElses = [];

    private cpElseIfs = [];

    private cpStyles = [];

    private cpClasses = [];

    private regexInterpolation;

    constructor(_element: HTMLElement) {
        this.element = _element;
        this.regexInterpolation = new RegExp(/({{).*?(}})/g);
        if (this.element) { this.addScope(); }
    }

    /**
     * @method void Percorre os elementos filhos do elemento principal criando os binds.
     */
    public addScope() {
        this.createDirectives(this.element);
        const recursiveBind = (element) => {
            Array.from(element.children).forEach((child: any) => {
                child[Constants.SCOPE_ATTRIBUTE_NAME] = Common.getScope(this.element);
                this.createDirectives(child);
                if (child.children) { recursiveBind(child); }
            });
        };
        recursiveBind(this.element);
    }

    /**
     * @method void Cria uma nova instancia de bind de acordo com o atributo declarado no elemento child.
     * @param child Elemento que utiliza algum tipo de bind.
     */
    public createDirectives(child) {
        if (child.hasAttribute(Constants.MODEL_ATTRIBUTE_NAME)) { this.createCPModel(child); }
        if (child.hasAttribute(Constants.CLICK_ATTRIBUTE_NAME)) { this.createCPClick(child); }
        if (child.hasAttribute(Constants.REPEAT_ATTRIBUTE_NAME)) { this.createCPRepeat(child); }
        if (child.hasAttribute(Constants.SHOW_ATTRIBUTE_NAME)) { this.createCPShow(child); }
        if (child.hasAttribute(Constants.IF_ATTRIBUTE_NAME)) { this.createCPIf(child); }
        if (child.hasAttribute(Constants.ELSE_ATTRIBUTE_NAME)) { this.createCPElse(child); }
        if (child.hasAttribute(Constants.ELSE_IF_ATTRIBUTE_NAME)) { this.createCPElseIf(child); }
        if (child.hasAttribute(Constants.INIT_ATTRIBUTE_NAME)) { this.createCPInit(child); }
        if (child.hasAttribute(Constants.STYLE_ATTRIBUTE_NAME)) { this.createCPStyle(child); }
        if (child.hasAttribute(Constants.CLASS_ATTRIBUTE_NAME)) { this.createCPClass(child); }
    }

    public reloadElementChildes(element) {
        if (element.children) {
            Array.from(element.children).forEach((child: any) => {
                const childScope = Common.getScope(child);
                if (childScope && childScope.mapDom) {
                    childScope.mapDom.reloadDirectives();
                    this.reloadElementChildes(child);
                }
            });
        }
    }

    public reloadDirectives() {
        // Update input values
        Object.keys(this.cpModels)
            .forEach((key) => {
                this.cpModels[key]
                    .forEach((bind) => bind.applyModelInValue());
            });
        // Update cp repeats
        this.repeats.forEach((repeat) => repeat.applyLoop());

        // Update cp show
        this.cpShows.forEach((cpShow) => cpShow.init());

        // Update cp if
        this.cpIfs.forEach((cpIf) => cpIf.init());

        // Update cp else-if
        this.cpElseIfs.forEach((cpElseIf) => cpElseIf.init());

        // Update cp else
        this.cpElses.forEach((cpElse) => cpElse.init());

        // Update cp style
        this.cpStyles.forEach((cpStyle) => cpStyle.init());

        // Update cp style
        this.cpClasses.forEach((cpClass) => cpClass.init());

        this.processInterpolation(this.element);
    }

    /**
     * @method void Atualiza os valores dos elementos HTML de acordo com o atributo que está sendo observado.
     */
    public reload() {
        this.reloadElementChildes(this.element);
        this.reloadDirectives();
    }

    /**
     * @description Percorre os elementos para processar os interpolations.
     * @param element
     */
    public processInterpolation(element) {
        Array.from(element.childNodes).forEach((childNode: any) => {
            this.interpolation(childNode);
        });
    }

    /**
     * @description Função que modifica o texto da interpolação pelo determinado valor.
     * @param childNode
     */
    public interpolation(childNode) {
        if (childNode.nodeName === '#text') {
            childNode.originalValue = childNode.originalValue || childNode.nodeValue;
            let nodeModified = childNode.originalValue;

            let str = window['capivara'].replaceAll(childNode.originalValue, Constants.START_INTERPOLATION, '{{');
            str = window['capivara'].replaceAll(str, Constants.END_INTERPOLATION, '}}');

            (str.match(this.regexInterpolation) || []).forEach((key) => {
                const content = key.replace('{{', '').replace('}}', '');
                let value = '';

                try {
                    const evalValue = Common.evalInContext(content, Common.getScopeParent(childNode));
                    value = evalValue !== undefined ? evalValue : '';
                } catch (e) { }

                key = window['capivara'].replaceAll(key, '{{', Constants.START_INTERPOLATION);
                key = window['capivara'].replaceAll(key, '}}', Constants.END_INTERPOLATION);

                nodeModified = nodeModified.replace(key, value);
                childNode.nodeValue = nodeModified;

            });

            childNode.nodeValue = childNode.nodeValue.replace(this.regexInterpolation, '');

        }
        if (childNode.childNodes) {
            this.processInterpolation(childNode);
        }
    }

    /**
     * @method void Retorna um mapa de atributos e elementos escutando alterações desse atributo.
     */
    public getCpModels() {
        return this.cpModels;
    }

    /**
     * @method void Adiciona um tipo de bind em um mapa, esse bind possui um elemento HTML que será atualizado quando o valor do atributo for alterado.
     * @param capivaraBind Tipo de bind que será monitorado.
     */
    public addCpModels(capivaraBind) {
        this.cpModels[capivaraBind.attribute] = this.cpModels[capivaraBind.attribute] || [];
        this.cpModels[capivaraBind.attribute].push(capivaraBind);
    }

    /**
     *
     * @param child Elemento que está sendo criado o bind de model
     */
    public createCPModel(child) {
        return new CPModel(child, this);
    }

    /**
     *
     * @param child Elemento que está sendo criado o bind de click
     */
    public createCPClick(child) {
        return new CPClick(child, this);
    }

    /**
     *
     * @param child Elemento que está sendo criado o bind de show
     */
    public createCPShow(child) {
        this.cpShows.push(new CPShow(child, this));
    }

    /**
     *
     * @param child Elemento que está sendo criado o bind do if
     */
    public createCPIf(child) {
        this.cpIfs.push(new CPIf(child, this));
    }

    /**
     *
     * @param child Elemento que está sendo criado o bind do else
     */
    public createCPElse(child) {
        this.cpElses.push(new CPElse(child, this));
    }

    /**
     *
     * @param child Elemento que está sendo criado o bind do else if
     */
    public createCPElseIf(child) {
        this.cpElseIfs.push(new CPElseIf(child, this));
    }

    /**
     *
     * @param child Elemento que está sendo criado o bind de repeat.
     */
    public createCPRepeat(child) {
        this.repeats.push(new CPRepeat(child, this));
    }

    /**
     *
     * @param child Elemento que está sendo criado o bind do init.
     */
    public createCPInit(child) {
       new CPInit(child, this);
    }

    /**
     *
     * @param child Elemento que está sendo criado o bind do style.
     */
    public createCPStyle(child) {
        this.cpStyles.push(new CPStyle(child, this));
    }

    /**
     *
     * @param child Elemento que está sendo criado o bind do style.
     */
    public createCPClass(child) {
        this.cpClasses.push(new CPClass(child, this));
    }
}
