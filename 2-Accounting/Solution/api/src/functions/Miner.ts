import { app, output, InvocationContext, Timer } from "@azure/functions";

const tableOutput = output.table({
  tableName: "Resources",
  connection: "AzureWebJobsStorage",
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
): Promise<void> {
  context.log("Timer function processed request.");

  context.extraOutputs.set(tableOutput, {
    PartitionKey: "Miner",
    RowKey: new Date().toISOString(),
    Resource: resourceTypes[Math.floor(Math.random() * resourceTypes.length)],
    Quantity: 5,
  });
}

app.timer("Miner", {
  schedule: "0 */1 * * * *",
  handler: Miner,
  extraOutputs: [tableOutput],
});
