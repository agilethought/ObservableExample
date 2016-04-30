/**
 * Created by michael.cooper on 2/20/2016.
 */


export class Rates {
    static instance: Rates;
    static isCreating: boolean = false;
    ditRate: number = 200;
    letterPause: number = 800;
    wordPause: number = 1500;

    constructor() {
        if (!Rates.isCreating) {
            throw new Error('You can\'t call new in Rates instances!');
        }
    }

    static getInstance() {
        if (Rates.instance == null) {
            Rates.isCreating = true;
            Rates.instance = new Rates();
            Rates.isCreating = false;
        }

        return Rates.instance;
    }

}
