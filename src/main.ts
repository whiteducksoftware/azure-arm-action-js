import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';

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
        let azDeployParameters = [
            resourceGroupName ? `--resource-group ${resourceGroupName}` : undefined,
            templateLocation ? `--template-file ${templateLocation}` : undefined,
            deploymentMode ? `--mode ${deploymentMode}` : undefined,
            deploymentName ? `--name ${deploymentName}` : undefined,
            parameters ? `--parameters ${parameters}` : undefined
        ].filter(Boolean).join(' ');

        await executeAzureCliCommand(azPath, `group deployment create ${azDeployParameters}`)
    } catch (error) {
        core.setFailed(error.message);
    }

}

async function executeAzureCliCommand(cliPath: string, command: string) {
    try {
        await exec.exec(`"${cliPath}" ${command}`, [], {});
    }
    catch (error) {
        throw new Error(error);
    }
}

main();
