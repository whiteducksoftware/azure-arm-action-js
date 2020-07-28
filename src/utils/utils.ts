import * as core from '@actions/core';
import { readFile, readFileSync } from 'fs';

export type Outputs = { [index: string]: { type: string, value: any } }

export function ParseJsonFile(filePath: string) {
    return JSON.parse(readFileSync(filePath, 'utf8'));
}

export function ParseParametersJsonFile(filePath: string) {
    var object = ParseJsonFile(filePath);
    if ("parameters" in object) {
        return object["parameters"]
    }

    return object
}