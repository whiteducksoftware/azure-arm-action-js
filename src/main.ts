import { DeployResourceGroupScope } from './deploy/scope_resourcegroup';
import { DeployManagementGroupScope } from './deploy/scope_managementgroup';
import { DeploySubscriptionScope } from './deploy/scope_subscription';
import { getInput } from '@actions/core';
import { ResourceManagementClient, ResourceManagementModels } from '@azure/arm-resources';
import { Outputs, ReadTemplate, ReadParameters } from './utils/utils';
import * as msRestNodeAuth from "@azure/ms-rest-nodeauth";

type SDKAuth = {
	clientId: string
	clientSecret: string
	subscriptionId: string
	tenantId: string
}

type Scope = 'resourcegroup' | 'managementgroup' | 'subscription'

// Action Main code
export async function main(): Promise<Outputs> {
    // retrieve action variables
    const scope = getInput('scope') as Scope
    const credentials = JSON.parse(getInput(`credentials`)) as SDKAuth
    const location = getInput('location')
    const resourceGroupName = getInput('resourceGroupName')
    const templateLocation = getInput('templateLocation')
    const deploymentMode = getInput('deploymentMode') as ResourceManagementModels.DeploymentMode
    const deploymentName = getInput('deploymentName')
    const parameters = getInput('parameters')
    const overrideParameters = getInput('overrideParameters')
    const managementGroupdId = getInput('managementGroupId')

    // Parse the inputs
    const template = ReadTemplate(templateLocation)
    const mergedParameters = { parameters: { ...ReadParameters(parameters).parameters, ...ReadParameters(overrideParameters).parameters } }

    // retrive the credentials
    const creds = await msRestNodeAuth.loginWithServicePrincipalSecret(credentials.clientId, credentials.clientSecret, credentials.tenantId)
    const client = new ResourceManagementClient(creds, credentials.subscriptionId);

    // Run the Deployment
    let result: Outputs = {};
    switch(scope) {
        case "resourcegroup":
            result = await DeployResourceGroupScope(client, resourceGroupName, location, template, deploymentMode, deploymentName, mergedParameters)
            break
        case "managementgroup":
            result = await DeployManagementGroupScope(client, managementGroupdId, location, template, deploymentMode, deploymentName, mergedParameters)
            break
        case "subscription":
            result = await DeploySubscriptionScope(client, location, template, deploymentMode, deploymentName, mergedParameters)
            break
        default:
            throw new Error("Invalid scope. Valid values are: 'resourcegroup', 'managementgroup', 'subscription'")
    }

    return result
}