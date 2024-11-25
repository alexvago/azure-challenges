import { app, output, InvocationContext, Timer } from "@azure/functions";
import { Resource } from "../models/resources";

const queueOutput = output.serviceBusQueue({
  queueName: process.env.SERVICEBUS_QUEUE_NAME,
  connection: "SERVICEBUS_CONNECTION_STRING",
});

const resourceTypes = [
  "Unobtanium",
  "Dilithium",
  "Adamantium",
  "Kryptonite",
  "Vibranium",
  "Mithril",
];

export async function Miner(
  myTimer: Timer,
  context: InvocationContext
): Promise<Resource> {
  context.log("Timer function processed request.");

  return {
    id: crypto.randomUUID(),
    source: "Miner1",
    resource: resourceTypes[Math.floor(Math.random() * resourceTypes.length)],
    quantity: 5,
  };
}

app.timer("Miner", {
  schedule: "0 */1 * * * *",
  handler: Miner,
  return: queueOutput,
});
