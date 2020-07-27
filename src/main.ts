import { info } from '@actions/core';
import { which } from '@actions/io';
import { DeployResourceGroupScope } from './deploy/scope_resourcegroup';
import { exec } from '@actions/exec';
import { DeployManagementGroupScope } from './deploy/scope_managementgroup';
import { DeploySubscriptionScope } from './deploy/scope_subscription';
import { Outputs } from './utils/utils';
import { getInput } from '@actions/core';

// Action Main code
export async function main(): Promise<Outputs> {
    // determine az path
    const azPath = await which("az", true);

    // retrieve action variables
    const scope = getInput('scope')
    const subscriptionId = getInput('subscriptionId')
    const location = getInput('location')
    const resourceGroupName = getInput('resourceGroupName')
    const templateLocation = getInput('templateLocation')
    const deploymentMode = getInput('deploymentMode')
    const deploymentName = getInput('deploymentName')
    const parameters = getInput('parameters')

    // change the subscription context
    info("Changing subscription context...")
    await exec(`"${azPath}" account set --subscription ${subscriptionId}`, [], { silent: true })

    // Run the Deployment
    let result: Outputs = {};
    switch(scope) {
        case "resourcegroup":
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

    return result
}