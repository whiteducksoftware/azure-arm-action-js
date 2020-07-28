import { debug } from '@actions/core';
import { readFileSync } from 'fs';
import { ResourceManagementModels } from '@azure/arm-resources';

export type Template = { templateLink: ResourceManagementModels.TemplateLink } | { template: any }
export type Parameters = /* { parametersLink: ResourceManagementModels.ParametersLink } | */ { parameters: any }
export type Outputs = { [index: string]: { type: string, value: any } }

export function ReadTemplate(filePath: string): Template {
    if (filePath.startsWith("http")) {
        return { templateLink: { uri: filePath } }
    }

    debug(`Parsing raw json ${filePath}`)
    return { template: JSON.parse(readFileSync(filePath, 'utf8')) }
}

export function ReadParameters(input: string): { parameters: any } {
    if (input.startsWith("http")) {
        throw new Error("URLs are not supported for parameters.")
    }

    if (input.endsWith(".json")) {
        return ReadParametersJson(input)
    }

    return ReadParametersKVPairs(input)
}

export function ReadParametersJson(filePath: string): { parameters: any } {
    debug(`Parsing parameter json ${filePath}`)
    var object = JSON.parse(readFileSync(filePath, 'utf8'))

    // Check if the parameters are wrapped (https://github.com/Azure/azure-sdk-for-go/issues/9283)
    if ("parameters" in object) {
        return { parameters: object["parameters"] }
    }

    return { parameters: object }
}

export function ReadParametersKVPairs(kvPairs: string): { parameters: any } {
    var pairs = kvPairs.split(/[ ;,]+/)
    var parameters: { [index: string]: { value: string } } = {};
    for (let index = 0; index < pairs.length; index++) {
        var split = pairs[index].split("=")
        parameters[split[0]] = { value: split[1] }
    }

    return { parameters }
}