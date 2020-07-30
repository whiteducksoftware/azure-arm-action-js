import { info } from '@actions/core';
import { Outputs, Parameters, Template } from '../utils/utils';
import { ResourceManagementClient, ResourceManagementModels } from '@azure/arm-resources';
import { v4 as uuidv4 } from 'uuid';

export async function ValidateManagementGroupScope(client: ResourceManagementClient, mangedmentGroupId: string, location: string, deploymentName: string, deploymentProperties: ResourceManagementModels.DeploymentProperties): Promise<ResourceManagementModels.DeploymentsValidateResponse> {
    // build deployment
    const deployment: ResourceManagementModels.ScopedDeployment = {
        location,
        properties: deploymentProperties
    }

    // validate the deployment
    info(`Validating deployment \x1b[32m${deploymentName}\x1b[0m`)
    var result = await client.deployments.validateAtManagementGroupScope(mangedmentGroupId, deploymentName, deployment)
    info("Validation finished.")

    return result
}


export async function DeployManagementGroupScope(client: ResourceManagementClient, mangedmentGroupId: string, location: string, deploymentName: string, deploymentProperties: ResourceManagementModels.DeploymentProperties): Promise<Outputs> {    
    // Check if location is set
    if (!location) {
        throw Error("Location must be set.")
    }
    
    // build deployment
    const deployment: ResourceManagementModels.ScopedDeployment = {
        location,
        properties: deploymentProperties
    }

    // execute the deployment
    info(`Creating deployment \x1b[32m${deploymentName}\x1b[0m`)
    var response = await client.deployments.createOrUpdateAtManagementGroupScope(mangedmentGroupId, deploymentName, deployment)
    info("Template deployment finished.")

    return response.properties?.outputs
}