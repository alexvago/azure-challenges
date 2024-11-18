# Challenge 1 solutions

## 1. Install dependencies

```bash
npm install
```

## 2. Test locally

To test locally you will need the VS Code Azurite extension. Once installed, you can run the emulator by running the following command in the VS command palette:

```
Azurite: Start
```

Then you can run the functions locally by running the following command:

```bash
npm start
```

You should then see your function being invoked every minute.

## 3. Create Azure resources

We need to create a resource group, storage account, and function app. You can do this by running the following command:

```bash
resourceGroup=avago-rg
storageAccount=avagostorage$RANDOM
functionAppName=avago-miner-app
location=westeurope

az group create --name $resourceGroup --location $location

az storage account create --name $storageAccount --location $location --resource-group $resourceGroup --sku Standard_LRS

az functionapp create --resource-group $resourceGroup --consumption-plan-location $location --runtime node --runtime-version 20 --functions-version 4 --name $functionAppName --storage-account $storageAccount
```

## 4. Deploy to Azure

Finally, you can deploy your function to Azure by running the following command:

```bash
func azure functionapp publish $functionAppName
```

Your function should now be running in Azure every 5 minutes, pushing data into Table Storage.

## 5. Clean up

Delete all resources by running the following command:

```
az group delete --name $resourceGroup --yes
```
