import { info } from '@actions/core';
import { Outputs } from '../utils';
import { ResourceManagementClient, ResourceManagementModels } from '@azure/arm-resources';

export async function ValidateSubscriptionScope(client: ResourceManagementClient, location: string, deploymentName: string, deploymentProperties: ResourceManagementModels.DeploymentProperties): Promise<ResourceManagementModels.DeploymentsValidateResponse> {
    // build deployment
    const deployment: ResourceManagementModels.Deployment = {
        location,
        properties: deploymentProperties
    }

    // validate the deployment
    info(`Validating deployment \x1b[32m${deploymentName}\x1b[0m`)
    var result = await client.deployments.validateAtSubscriptionScope(deploymentName, deployment)
    info("Validation finished.")

    return result
}

export async function DeploySubscriptionScope(client: ResourceManagementClient, location: string, deploymentName: string, deploymentProperties: ResourceManagementModels.DeploymentProperties): Promise<Outputs> {    
    // Check if location is set
    if (!location) {
        throw Error("Location must be set.")
    }
    
    // build deployment
    const deployment: ResourceManagementModels.Deployment = {
        location,
        properties: deploymentProperties
    }

    // execute the deployment
    info(`Creating deployment \x1b[32m${deploymentName}\x1b[0m`)
    var response = await client.deployments.createOrUpdateAtSubscriptionScope(deploymentName, deployment)
    info("Template deployment finished.")

    return response.properties?.outputs
}