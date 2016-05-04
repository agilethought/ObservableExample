import {Component} from 'angular2/core';
import {Inject} from 'angular2/core';
/**
 * Created by michael.cooper on 2/20/2016.
 */

export class MouseAction {
    constructor(public direction: MouseDirection) {
    }
}

export enum MouseDirection {
    up,
    down,
    synthetic
}
