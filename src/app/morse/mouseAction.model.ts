import {Component} from 'angular2/core';
import {Inject} from 'angular2/core';
/**
 * Created by michael.cooper on 2/20/2016.
 */

export class MouseAction {
    private _stamp: number;

    get stamp() : number {
        return this._stamp;
    }

    constructor(public direction: MouseDirection) {
        this._stamp = new Date().valueOf();
    }
}

export enum MouseDirection {
    up,
    down,
    synthetic
}
