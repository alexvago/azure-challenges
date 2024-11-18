import { app, output, InvocationContext, Timer } from "@azure/functions";

const tableOutput = output.table({
    tableName: 'Resources',
    connection: 'AzureWebJobsStorage',
});

export async function Miner(myTimer: Timer, context: InvocationContext): Promise<void> {
    context.log('Timer function processed request.');


    context.extraOutputs.set(tableOutput, {
        PartitionKey: 'Miner',
        RowKey: new Date().toISOString(),
        Resource: 'Unobtainium',
        Quantity: 5,
    });
}

app.timer('Miner', {
    schedule: '0 */1 * * * *',
    handler: Miner,
    extraOutputs: [tableOutput],
});


