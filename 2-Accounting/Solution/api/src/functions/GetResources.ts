import {
  app,
  HttpRequest,
  HttpResponseInit,
  input,
  InvocationContext,
} from "@azure/functions";

const tableInput = input.table({
  tableName: "Resources",
  partitionKey: "Miner",
  connection: "AzureWebJobsStorage",
});

export async function GetResources(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const tableItems: any = context.extraInputs.get(tableInput);

  const resources = tableItems.reduce((acc: any, item: any) => {
    if (!acc[item.Resource]) {
      acc[item.Resource] = 0;
    }
    acc[item.Resource] += item.Quantity;
    return acc;
  }, {});

  return { body: JSON.stringify(resources) };
}

app.http("GetResources", {
  methods: ["GET"],
  authLevel: "anonymous",
  extraInputs: [tableInput],
  handler: GetResources,
});
