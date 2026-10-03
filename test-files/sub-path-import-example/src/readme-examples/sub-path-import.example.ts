import {doThing} from '../index.js';
import {doNestedThing} from '../nested/index.js';
import {doOtherThing} from '../nested/other.ts';
import {sharedValue} from './shared.example.js';
import {otherSharedValue} from './shared.example.ts';

console.info(doThing(), doNestedThing(), doOtherThing(), sharedValue, otherSharedValue);
