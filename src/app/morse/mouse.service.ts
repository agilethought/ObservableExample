/**
 * Created by michael.cooper on 2/20/2016.
 */

import {Component, EventEmitter, Injectable} from 'angular2/core';
import {Observable, Subject} from 'rxjs';
import {MouseAction, MouseDirection, Signal, Spacing,
    IsWord, IsLetter, DitDash} from './mouseAction.model';
import {Rates} from './rates.model';
import {MorseLookup} from './morseLookup.model';
let initialMouseEvents: MouseAction[] = [];


@Injectable()
export class MouseService {
    newMice: Subject<MouseAction> = new Subject<MouseAction>();
    dits: Subject<string> = new Subject<string>();
    morseList: Subject<string> = new Subject<string>();
    letters: Subject<string> = new Subject<string>();

    create: Subject<MouseAction> = new Subject<MouseAction>();

    lastEvent: MouseAction = null;
    lastSignal: Signal;
    private timer: any; // timer handle
    private rates: Rates;

    constructor() {
        this.rates = Rates.getInstance();
        this.create.map((mouseEvent: MouseAction) => {
                if (this.lastEvent) {
                    this.lastSignal = this.lastEvent.difference(mouseEvent);

                    if (this.lastSignal) {
                        this.dits.next(this.lastSignal.asString());
                        if (this.lastSignal.spacing === Spacing.none) {
                            // set a timer
                            this.timer = setTimeout(this.fireNewLetter.bind(this),
                                this.rates.letterPause + 1);
                        }
                    }
                }
                this.lastEvent = mouseEvent;
            })
            .subscribe(() => {
                var i = 0;

            });

        this.newMice
            .subscribe(this.create);

            /*
        this.dits
            .scan((acc: string, value: string) => {
                return acc += value;
            })
            .filter((s: string) => {
                if (!s) return false;
                var last = s[s.length - 1];
                return (last === IsLetter || last === IsWord);
            })
            .map((s: string) => {
                // strips out to last blank
                var last = s[s.length - 1];
                if (last === IsWord) {
                    return ' ';
                }
                var lastBlank: number = s.lastIndexOf(IsLetter, s.length - 2);
                if (lastBlank < 0) lastBlank = -1;
                var segment = s.substr(lastBlank + 1, s.length - lastBlank - 2);
                segment = segment.replace(IsWord, '');
                    this.morseList.next(segment);
                return segment;
            })
            .map((code: string) => {
                if (code === ' ') {
                    return ' ';
                }
                // to letters
                return MorseLookup.look(code);
            })
            .subscribe(this.letters);
           */

        let timeStampedMouseSignals = this.newMice.map(v => ({ value: v, timestamp: Date.now() }));

        let mouseDowns = timeStampedMouseSignals.filter(s => (s.value.direction === MouseDirection.down));
        let mouseUps = timeStampedMouseSignals.filter(s => (s.value.direction === MouseDirection.up));

        let mouseSignals = mouseUps.withLatestFrom(mouseDowns, (up, down) => {
            let duration = up.timestamp - down.timestamp;
            return (duration < this.rates.ditRate) ? DitDash.dit : DitDash.dash;
        });

        let letterBoundaries = mouseSignals.debounceTime(this.rates.letterPause);
        let wordBoundaries = mouseSignals.debounceTime(this.rates.wordPause);

        let letters = mouseSignals
                        .window(letterBoundaries)
                        .flatMap(x => x.toArray())
                        .map(letterArray => {
                            return letterArray.map(l => l === DitDash.dit ? '.' : '-').join('');
                        });

        let convertedLetters = letters.map(code => MorseLookup.look(code));
        let words = convertedLetters
                        .window(wordBoundaries)
                        .flatMap(x => x.toArray())
                        .map(letterArray => letterArray.join(''));

        letters.subscribe(this.morseList);
        convertedLetters.subscribe(this.letters);
        wordBoundaries.map((wb) => ' ').subscribe(this.letters);

        let debugging = true;
        if (debugging) {
            letterBoundaries.subscribe((wb) => { console.log('--- Letter Boundary ---'); });
            wordBoundaries.subscribe((wb) => { console.log('--- Word Boundary ---'); });
            letters.subscribe((letterGroup) => { console.log('Read morse letter:', letterGroup); });
            convertedLetters.subscribe((convertedLetters) => { console.log('Read converted letter:', convertedLetters); });
            words.subscribe((watch) => { console.log('Read word:', watch); });
        }
    }

    // imperative fn to add events
    addMouseEvent(mouseEvent: MouseAction): void {

        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.newMice.next(mouseEvent);
    }

    private fireNewLetter() {
        clearTimeout(this.timer);
        this.addMouseEvent(new MouseAction(MouseDirection.down));
    }

    private stripLastToken(s: string): string {
        var last = s[s.length - 1];
        if (last === IsWord) {
            return ' ';
        }
        var lastBlank: number = s.lastIndexOf(IsLetter, s.length - 2);
        if (lastBlank < 0) lastBlank = -1;
        var segment = s.substr(lastBlank + 1, s.length - lastBlank - 2);
        segment = segment.replace(IsWord, '');

        return segment;
    };

}


