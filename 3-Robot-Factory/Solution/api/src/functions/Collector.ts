import { app, InvocationContext, output } from "@azure/functions";
import { Resource } from "../models/resources";
import { CosmosClient } from "@azure/cosmos";

const cosmosClient = new CosmosClient(process.env.COSMOSDB_CONNECTION_STRING);

export async function CollectorHandler(
  message: Resource,
  context: InvocationContext
): Promise<void> {
  context.log("Service bus queue function processed message:", message);
  context.log("EnqueuedTimeUtc =", context.triggerMetadata.enqueuedTimeUtc);
  context.log("DeliveryCount =", context.triggerMetadata.deliveryCount);
  context.log("MessageId =", context.triggerMetadata.messageId);

  try {
    const { container } = await cosmosClient
      .database(process.env.COSMOSDB_DATABASE_NAME)
      .containers.createIfNotExists({ id: "Resources" });

    // update the item with message.resource as the partition key and increase the current quantity by message.quantity
    const { resource, quantity } = message;
    const id = resource;
    const { resource: existingResource } = await container
      .item(id, resource)
      .read<Resource>();

    if (existingResource) {
      existingResource.quantity += quantity;
      await container.items.upsert(existingResource);
    } else {
      await container.items.create({ id, resource, quantity });
    }
  } catch (error) {
    context.error("Error processing message:", error);
    throw error;
  }
}

app.serviceBusQueue("Collector", {
  connection: "SERVICEBUS_CONNECTION_STRING",
  queueName: process.env.SERVICEBUS_QUEUE_NAME,
  handler: CollectorHandler,
});
