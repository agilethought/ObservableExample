import {Component} from 'angular2/core';
import {Rates} from './rates.model';
import {Inject} from 'angular2/core';
/**
 * Created by michael.cooper on 2/20/2016.
 */


export const IsWord: string = '|';
export const IsLetter: string = ' ';

export class MouseAction {
    public stamp: number;
    private rates: Rates;

    constructor(public direction: MouseDirection) {
        this.stamp = new Date().valueOf();
        this.rates = Rates.getInstance();
    }

    /**
     * have to set a timer to emit a blank if we pass the NewLetter time limit
     *
     * @param mouseEvent
     * @returns {any}
     */
    public difference(mouseEvent: MouseAction): Signal {
        var timeDiff = mouseEvent.stamp - this.stamp;

        if (mouseEvent.direction === MouseDirection.down) {

            if (timeDiff > this.rates.wordPause) {
                return new Signal(null, Spacing.word);
            }
            if (timeDiff > this.rates.letterPause) {
                return new Signal(null, Spacing.letter);
            }
        }
        if (mouseEvent.direction === MouseDirection.up) {
            return (timeDiff < this.rates.ditRate) ?
                new Signal(DitDash.dit, Spacing.none) :
                new Signal(DitDash.dash, Spacing.none);
        }
        return null; // no signal
    };
}

export enum MouseDirection {
    up,
    down,
    synthetic
}

export enum Spacing {
    none,
    letter,
    word
}

export enum DitDash {
    dit,
    dash
}

/**
 * @class Signal - what did this last click say
 */
export class Signal {

    constructor(public ditDash: DitDash,
                public spacing: Spacing) {
        if (spacing === undefined) {
            spacing = Spacing.none;
        }
    }

    public asString(): string {
        if (this.spacing !== Spacing.none) {
            switch (this.spacing) {
                case Spacing.word:
                    return IsWord;

                case Spacing.letter:
                    return IsLetter;
            }
        }
        switch (this.ditDash) {
            case DitDash.dit:
                return '.';

            case DitDash.dash:
                return '-';
        }

    }
}
