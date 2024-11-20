"use server";

import { AggregateAuthenticationError } from "@azure/identity";
import { Resources } from "../models/Resources";

export async function getResources() {
  try {
    const fetchResources = await fetch(
      `${process.env.API_HOST}/api/GetResources`
    );

    const resources = (await fetchResources.json()) as Resources;
    return resources;
  } catch (error) {
    if (error instanceof AggregateAuthenticationError) {
      console.error("Cannot authenticate");
    } else {
      console.error(error);
    }
    return {};
  }
}
