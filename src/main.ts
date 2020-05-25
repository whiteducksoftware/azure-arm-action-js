import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as assert from 'assert';
import { ExecOptions } from '@actions/exec/lib/interfaces';

// Action Main code
type outputs = { [index: string]: { value: string } }
export async function main(): Promise<{ exitCode: number, outputs: outputs }> {
    try {
        // determine az path
        const azPath = await io.which("az", true);

        // retrieve action variables
        const resourceGroupName = core.getInput('resourceGroupName')
        const templateLocation = core.getInput('templateLocation')
        const deploymentMode = core.getInput('deploymentMode')
        const deploymentName = core.getInput('deploymentName')
        const parameters = core.getInput('parameters')

        // create the parameter list
        const azDeployParameters = [
            resourceGroupName ? `--resource-group ${resourceGroupName}` : undefined,
            templateLocation ? `--template-file ${templateLocation}` : undefined,
            deploymentMode ? `--mode ${deploymentMode}` : undefined,
            deploymentName ? `--name ${deploymentName}` : undefined,
            parameters ? `--parameters ${parameters}` : undefined
        ].filter(Boolean).join(' ');

        // configure exec to write the json output to a buffer
        let commandOutput = '';
        const options: ExecOptions = {
            listeners: {
                stdout: (data: Buffer) => {
                    let string = data.toString();
                    if (!string.startsWith("[command]"))
                        commandOutput += string;
                    console.log(string);
                },   
            }
        }

        // execute the deployment
        let status = await exec.exec(`"${azPath}" deployment group create ${azDeployParameters} -o json`, [], options);
        if (status != 0) {
            return { exitCode: status, outputs: {} }
        }

        // parse the result and save the outputs
        var result = JSON.parse(commandOutput) as { properties: { outputs: outputs } }
        var object = result.properties.outputs
        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                core.setOutput(key, object[key].value)
            }
        }

        return {
            exitCode: 0,
            outputs: object
        }
    } catch (error) {
        core.setFailed(error.message);
        return { exitCode: 1, outputs: {} }
    }
}

// Unit Tests
export async function runTests() {
    let result = await main()
    assert.equal(result.exitCode, 0, `Expected exit code 0 but got ${result.exitCode}`)
    assert.equal(Object.keys(result.outputs).length, 2, `Expected output count of 2 but got ${Object.keys(result.outputs).length}`)
    assert.equal(result.outputs["containerName"].value, "github-action", `Got invalid value for location key, expected github-action but got ${result.outputs["containerName"].value}`)
    assert.equal(result.outputs["location"].value, "westeurope", `Got invalid value for location key, expected westeurope but got ${result.outputs["location"].value}`)
}

if (process.env.RUN_TESTS != undefined) {
    runTests().catch(e => {
        console.error(e)
        process.exit(1)
    })
} else {
    main().then(result => {
        process.exit(result.exitCode)
    })
}