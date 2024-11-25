import { app, InvocationContext } from "@azure/functions";
import { Resource } from "../models/resources";
import { CosmosClient } from "@azure/cosmos";

export async function RobotFactory(
  documents: Resource[],
  context: InvocationContext
): Promise<void> {
  context.log(`Cosmos DB function processed ${documents.length} documents`);

  documents.forEach(async (document) => {
    context.log(
      `Robot Factory: ${document.resource} has ${document.quantity} units`
    );
    if (document.quantity >= 50) {
      context.log(
        `Robot Factory: ${document.resource} has enough resources to build a robot`
      );

      const cosmosClient = new CosmosClient(
        process.env.COSMOSDB_CONNECTION_STRING
      );
      // First, remove 50 units from the resource container
      const resourcesContainer = cosmosClient
        .database(process.env.COSMOSDB_DATABASE_NAME)
        .container("Resources");

      const { resource } = document;
      const id = resource;
      const { resource: existingResource } = await resourcesContainer
        .item(id, resource)
        .read<Resource>();

      if (existingResource) {
        existingResource.quantity -= 50;
        await resourcesContainer.items.upsert(existingResource);
      }
      // Next, create the robot in the Robots container

      const { container } = await cosmosClient
        .database(process.env.COSMOSDB_DATABASE_NAME)
        .containers.createIfNotExists({ id: "Robots", partitionKey: "/model" });

      const robot = {
        id: crypto.randomUUID(),
        model: `${document.resource}Robot`,
        resourceType: document.resource,
      };

      await container.items.create(robot);
      context.log(`Robot Factory: ${robot.model} has been built`);
    }
  });
}

app.cosmosDB("RobotFactory", {
  connection: "COSMOSDB_CONNECTION_STRING",
  databaseName: process.env.COSMOSDB_DATABASE_NAME,
  containerName: "Resources",
  createLeaseContainerIfNotExists: true,
  handler: RobotFactory,
});
