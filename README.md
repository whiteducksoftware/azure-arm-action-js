# GitHub Action for Azure Resource Manager (ARM) deployment

With the Azure Resource Manager (ARM) Action, you can deploy ARM templates inside your GitHub workflow.

## Dependencies

* [Azure Login](https://github.com/Azure/login) Login with your Azure credentials
* [Checkout](https://github.com/actions/checkout) To checks-out your repository so the workflow can access any specified ARM template.

## Inputs

### `resourceGroupName`

**Required** Provide the name of a resource group.

### `templateLocation`

**Required** Specify the path to the Azure Resource Manager template.

### `deploymentMode`

Incremental (only add resources to resource group) or Complete (remove extra resources from resource group). Default: `Incremental`.
  
### `deploymentName`

Specifies the name of the resource group deployment to create.

### `parameters`

description: "Supply deployment parameter values."

## Usage

```yml
- uses: whiteducksoftware/azure-arm-action-js@v1
  with:
    resourceGroupName: <YourResourceGroup>
    templateLocation: <path/to/azuredeploy.json>
```

## Example

```yml
on: [push]
name: AzureLoginSample

jobs:

  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@master
    - uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    - uses: whiteducksoftware/azure-arm-action-js@v1
      with:
        resourceGroupName: github-action-arm-rg
        templateLocation: ./azuredeploy.json
        parameters: storageAccountType=Standard_LRS
```