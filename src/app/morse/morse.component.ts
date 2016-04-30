import {Component, EventEmitter, Injectable, OnInit} from 'angular2/core';
import {Observable, Subject } from 'rxjs';
import {MouseService} from './mouse.service';
import {MouseAction, MouseDirection} from './mouseAction.model';
import {Observer} from 'rxjs/Observer';
import {Rates} from './rates.model';
import { FORM_DIRECTIVES } from 'angular2/common';
import {ControlGroup, Control} from 'angular2/common';
import {Router} from 'angular2/router';

@Component({
    selector: 'home',
    template: require('./home.html'),
    directives: [FORM_DIRECTIVES],
    providers: [MouseService, Rates],
    styles: [require('./home.css')]
})
export default class Morse implements OnInit {
    public title = 'Morse';
    public rateControl: ControlGroup;
    public rates: Rates;
    public morse: string;

    public word: string = '';

    constructor(private mouseService: MouseService,
                private router: Router) {
        this.rates = Rates.getInstance();
        this.rateControl = new ControlGroup({
            ditRate: new Control(this.rates.ditRate),
            letterPause: new Control(this.rates.letterPause),
            wordPause: new Control(this.rates.wordPause)
        });

        this.router.subscribe((value: any) => {

        });
    }

    ngOnInit() {
        this.mouseService.letters.subscribe(s => {
            this.word += s;
        });
        this.mouseService.morseList.subscribe(s => {
            this.morse = s;
        });
    }

    public catchDown($event): void {
        var m = new MouseAction(MouseDirection.down);

        this.mouseService.addMouseEvent(m);
    }

    public catchUp($event): void {
        var m = new MouseAction(MouseDirection.up);

        this.mouseService.addMouseEvent(m);
    }

    public clear() {
        this.word = '';
        this.morse = '';
    }

    public backup() {
        if (this.word) {
            this.word = this.word.substr(0, this.word.length - 1);
        }
    }

    // private downs: Observable = new Observable.fromEvent()

}



