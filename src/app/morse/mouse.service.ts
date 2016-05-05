/**
 * Created by michael.cooper on 2/20/2016.
 */

import {Component, EventEmitter, Injectable} from 'angular2/core';
import {Observable, Subject} from 'rxjs';
import {MouseAction, MouseDirection } from './mouseAction.model';
import {Rates} from './rates.model';
import {MorseLookup} from './morseLookup.model';

export enum DitDash {
    dit,
    dash
}

@Injectable()
export class MouseService {
    newMice: Subject<MouseAction> = new Subject<MouseAction>();
    morseList: Subject<string> = new Subject<string>();
    letters: Subject<string> = new Subject<string>();

    private rates: Rates;

    constructor() {
        this.rates = Rates.getInstance();

        let mouseDowns = this.newMice.filter(s => (s.direction === MouseDirection.down));
        let mouseUps = this.newMice.filter(s => (s.direction === MouseDirection.up));

        let mouseSignals = mouseUps.withLatestFrom(mouseDowns, (up, down) => {
            let duration = up.stamp - down.stamp;
            return (duration < this.rates.ditRate) ? DitDash.dit : DitDash.dash;
        });

        let letterBoundaries = mouseSignals.debounceTime(this.rates.letterPause);
        let wordBoundaries = mouseSignals.debounceTime(this.rates.wordPause);

        let morseLetters = mouseSignals
                            .window(letterBoundaries)
                            .flatMap(x => x.toArray())
                            .map(letterArray => {
                                return letterArray.map(l => l === DitDash.dit ? '.' : '-').join('');
                            });
        let convertedLetters = morseLetters.map(code => MorseLookup.look(code));

        let words = convertedLetters
                        .window(wordBoundaries)
                        .flatMap(x => x.toArray())
                        .map(letterArray => letterArray.join(''));

        morseLetters.subscribe(this.morseList);
        convertedLetters.subscribe(this.letters);
        wordBoundaries.map((wb) => ' ').subscribe(this.letters);

        let debugging = true;
        if (debugging) {
            letterBoundaries.subscribe((wb) => { console.log('--- Letter Boundary ---'); });
            wordBoundaries.subscribe((wb) => { console.log('--- Word Boundary ---'); });
            morseLetters.subscribe((letterGroup) => { console.log('Read morse letter:', letterGroup); });
            convertedLetters.subscribe((convertedLetters) => { console.log('Read converted letter:', convertedLetters); });
            words.subscribe((watch) => { console.log('Read word:', watch); });
        }
    }

    // imperative fn to add events
    addMouseEvent(mouseEvent: MouseAction): void {
        this.newMice.next(mouseEvent);
    }
}
