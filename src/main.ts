import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import { ExecOptions } from '@actions/exec/lib/interfaces';

// main
async function main() {

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
        await exec.exec(`"${azPath}" deployment group create ${azDeployParameters} -o json`, [], options);

        // parse the result and save the outputs
        var result = JSON.parse(commandOutput) as { properties: { outputs: { [index: string]: object } } }
        var object = result.properties.outputs
        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                const element = object[key] as { value: string }
                core.setOutput(key, element.value)
            }
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

main();
