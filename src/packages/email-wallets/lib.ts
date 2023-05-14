import assert from 'assert';
import { ethers } from 'ethers';

function randomPhraseIndex() {
    // returns 0-11
    return Math.ceil(Math.random() * (11 - 0) + 0)
}

function retrievePartFromPhrase(phrase: string, index: number) {
    const mnemonic = phrase.split(' ');
    const userWord = mnemonic[index];
    delete mnemonic[index];
    return { userWord, mnemonic: mnemonic.join(':'), index }
}

async function createWallet() {
    const index = randomPhraseIndex();
    const w = ethers.Wallet.createRandom();
    const phrase = w.mnemonic?.phrase;
    assert(phrase, "Unable to generate mnemonic phrase");

    const { userWord, mnemonic } = retrievePartFromPhrase(phrase.toString(), index);;
    const ret = {
        phrase: mnemonic.toString(),
        index,
        address: w.address,
        userWord,
    }

    return ret;
}

function recomposeMnemonic(phrase: string, userWord: string, index: number) {
    const arr = phrase.split(':');
    for (let index = 0; index < arr.length; index++) {
        if (arr[index] === '') {
            arr[index] = userWord;
        }
    }
    return arr.join(' ');
}

/**
 * Rebuild an EVM wallet from an incomplete phrase and user word
 * @param phrase 
 * @param userWord 
 * @param index 
 * @returns 
 */
function composeWallet(phrase: string, userWord: string, index: number) {
    const mnemonic = recomposeMnemonic(phrase, userWord, index)
    return ethers.Wallet.fromPhrase(mnemonic);
}

export {
    createWallet,
    composeWallet,
}