import { DeployResourceGroupScope } from './deploy/scope_resourcegroup';
import { DeployManagementGroupScope } from './deploy/scope_managementgroup';
import { DeploySubscriptionScope } from './deploy/scope_subscription';
import { getInput } from '@actions/core';
import { ResourceManagementClient, ResourceManagementModels } from '@azure/arm-resources';
import { Outputs } from './utils/utils';
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
    const parametersLocation = getInput('parametersLocation')
    
    // retrive the credentials
    const creds = await msRestNodeAuth.loginWithServicePrincipalSecret(credentials.clientId, credentials.clientSecret, credentials.tenantId)
    const client = new ResourceManagementClient(creds, credentials.subscriptionId);

    // Run the Deployment
    let result: Outputs = {};
    switch(scope) {
        case "resourcegroup":
            result = await DeployResourceGroupScope(client, resourceGroupName, location, templateLocation, deploymentMode, deploymentName, parametersLocation)
            break
        case "managementgroup":
            result = await DeployManagementGroupScope(client, "", location, templateLocation, deploymentMode, deploymentName, parametersLocation)
            break
        case "subscription":
            result = await DeploySubscriptionScope(client, location, templateLocation, deploymentMode, deploymentName, parametersLocation)
            break
        default:
            throw new Error("Invalid scope. Valid values are: 'resourcegroup', 'managementgroup', 'subscription'")
    }

    return result
}