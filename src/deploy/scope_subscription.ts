import { info } from '@actions/core';
import { Outputs, Parameters, Template } from '../utils/utils';
import { ResourceManagementClient, ResourceManagementModels } from '@azure/arm-resources';
import { v4 as uuidv4 } from 'uuid';

export async function DeploySubscriptionScope(client: ResourceManagementClient, location: string,  template: Template, mode: ResourceManagementModels.DeploymentMode, deploymentName: string, parameters: Parameters): Promise<Outputs> {    
    // Check if location is set
    if (!location) {
        throw Error("Location must be set.")
    }
    
    // generate deploymentName
   const uuid = uuidv4()
   const _deploymentName = `${deploymentName}-${uuid}`
   info(`Creating deployment ${deploymentName} with uuid ${uuid} -> ${_deploymentName}, mode: ${mode}`)

    // build deployment
    const deployment: ResourceManagementModels.Deployment = {
        location,
        properties: {
            mode,
            ...template,
            ...parameters
        }
    }
    console.log(deployment)

    // validate the deployment
    info(`Validating deployment ${_deploymentName}`)
    await client.deployments.validateAtSubscriptionScope(_deploymentName, deployment)
    info("Validation finished.")

    // execute the deployment
    info(`Creating deployment ${_deploymentName}`)
    var response = await client.deployments.createOrUpdateAtSubscriptionScope(_deploymentName, deployment)
    info("Template deployment finished.")

    return response.properties?.outputs
}