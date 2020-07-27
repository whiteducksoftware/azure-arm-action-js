import * as core from '@actions/core';
import * as io from '@actions/io';
import { DeployResourceGroupScope } from './deploy/scope_resourcegroup';
import { exec } from '@actions/exec';
import { DeployManagementGroupScope } from './deploy/scope_managementgroup';
import { DeploySubscriptionScope } from './deploy/scope_subscription';

// Action Main code
export async function main(): Promise<number> {
    // determine az path
    const azPath = await io.which("az", true);

    // retrieve action variables
    const scope = core.getInput('scope')
    const subscriptionId = core.getInput('subscriptionId')
    const location = core.getInput('location')
    const resourceGroupName = core.getInput('resourceGroupName')
    const templateLocation = core.getInput('templateLocation')
    const deploymentMode = core.getInput('deploymentMode')
    const deploymentName = core.getInput('deploymentName')
    const parameters = core.getInput('parameters')

    // change the subscription context
    await exec(`"${azPath}" account set --subscription ${subscriptionId}`)

    // Run the Deployment
    let result = false;
    switch(scope) {
        case "resourceGroup":
            result = await DeployResourceGroupScope(azPath, resourceGroupName, templateLocation, deploymentMode, deploymentName, parameters)
            break
        case "managementgroup":
            result = await DeployManagementGroupScope(azPath, location, templateLocation, deploymentMode, deploymentName, parameters)
            break
        case "subscription":
            result = await DeploySubscriptionScope(azPath, location, templateLocation, deploymentMode, deploymentName, parameters)
            break
        default:
            throw new Error("Invalid scope. Valid values are: 'resourcegroup', 'managementgroup', 'subscription'")
    }

    return result ? 0 : 1;
}

main()
    .then(statusCode => {
        process.exit(statusCode)
    })
    .catch((err: Error) => {
        console.log()
        core.setFailed(err.message);
        process.exit(1);
    });