/** CRM integration: creates contact and deal upon order payment. */

import type { Order, Customer, OrderItem, Product } from "@prisma/client";

type OrderWithRelations = Order & {
  customer: Customer;
  items: (OrderItem & { product: Product })[];
};

export interface CrmClient {
  upsertDeal(order: OrderWithRelations): Promise<{ dealId: string; contactId: string }>;
}

const provider = process.env.CRM_PROVIDER ?? "mock";

/** amoCRM: deals via Leads API. */
class AmoCrmClient implements CrmClient {
  private baseUrl = process.env.CRM_API_URL;
  private token = process.env.CRM_API_TOKEN;
  private pipelineId = process.env.CRM_PIPELINE_ID;

  async upsertDeal(order: OrderWithRelations) {
    if (!this.baseUrl || !this.token) {
      throw new Error("amoCRM credentials are not configured");
    }

    const headers = {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };

    // Create contact by email
    const contactRes = await fetch(`${this.baseUrl}/contacts`, {
      method: "POST",
      headers,
      body: JSON.stringify([
        {
          name: order.customer.name ?? order.shippingName,
          custom_fields_values: [
            { field_code: "EMAIL", values: [{ value: order.shippingEmail }] },
            { field_code: "PHONE", values: [{ value: order.shippingPhone }] },
          ],
        },
      ]),
    });
    const contactData = await contactRes.json();
    const contactId = contactData._embedded?.contacts?.[0]?.id?.toString() ?? "";

    // Create deal, link contact
    const dealRes = await fetch(`${this.baseUrl}/leads`, {
      method: "POST",
      headers,
      body: JSON.stringify([
        {
          name: `Order ${order.number}`,
          price: Math.round(order.totalCents / 100),
          pipeline_id: this.pipelineId ? Number(this.pipelineId) : undefined,
          _embedded: { contacts: [{ id: Number(contactId) }] },
        },
      ]),
    });
    const dealData = await dealRes.json();
    const dealId = dealData._embedded?.leads?.[0]?.id?.toString() ?? "";

    return { dealId, contactId };
  }
}

/** Mock client so demo works without CRM keys. */
class MockCrmClient implements CrmClient {
  async upsertDeal(order: OrderWithRelations) {
    console.log(
      `[CRM mock] Deal created for order ${order.number} in the amount of ${(
        order.totalCents / 100
      ).toFixed(2)} ${order.currency}`
    );
    return {
      dealId: `mock_deal_${order.id}`,
      contactId: `mock_contact_${order.customer.id}`,
    };
  }
}

export function getCrmClient(): CrmClient {
  switch (provider) {
    case "amocrm":
      return new AmoCrmClient();
    // case "hubspot": return new HubSpotCrmClient(); — added similarly
    default:
      return new MockCrmClient();
  }
}
