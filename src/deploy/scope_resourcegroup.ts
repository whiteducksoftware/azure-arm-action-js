import { info } from '@actions/core';
import { Outputs } from '../utils';
import { ResourceManagementClient, ResourceManagementModels } from '@azure/arm-resources';

export async function ValidateResourceGroupScope(client: ResourceManagementClient, resourceGroupName: string, deploymentName: string, deploymentProperties: ResourceManagementModels.DeploymentProperties): Promise<ResourceManagementModels.DeploymentsValidateResponse> {
    // build deployment
    const deployment: ResourceManagementModels.Deployment = {
        properties: deploymentProperties
    }

    // validate the deployment
    info(`Validating deployment \x1b[32m${deploymentName}\x1b[0m`)
    var result = await client.deployments.validate(resourceGroupName, deploymentName, deployment)
    info("Validation finished.")

    return result
}

export async function DeployResourceGroupScope(client: ResourceManagementClient, resourceGroupName: string, location: string , deploymentName: string, deploymentProperties: ResourceManagementModels.DeploymentProperties): Promise<Outputs> {    
    // Check if location is set
    if (!location) {
        throw Error("Location must be set.")
    }
    
    // Check if resourceGroupName is set
    if (!resourceGroupName) {
        throw Error("ResourceGroup name must be set.")
    }

    // Create or update the resource group
    client.resourceGroups.createOrUpdate(resourceGroupName, { location })

    // build deployment
    const deployment: ResourceManagementModels.Deployment = {
        properties: deploymentProperties
    }

    // execute the deployment
    info(`Creating deployment \x1b[32m${deploymentName}\x1b[0m`)
    var response = await client.deployments.createOrUpdate(resourceGroupName, deploymentName, deployment)
    info("Template deployment finished.")

    return response.properties?.outputs
}