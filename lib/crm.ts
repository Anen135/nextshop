/**
 * Интеграция с CRM.
 *
 * Задача этого модуля — при оплаченном заказе создать/обновить контакт и
 * сделку в CRM, чтобы отдел продаж видел заказы из интернет-магазина в
 * привычном интерфейсе. Реализовано как провайдер-агностичный интерфейс:
 * конкретная система (amoCRM, HubSpot, Bitrix24) подключается через
 * CRM_PROVIDER без изменений в бизнес-логике заказа.
 */

import type { Order, Customer, OrderItem, Product } from "@prisma/client";

type OrderWithRelations = Order & {
  customer: Customer;
  items: (OrderItem & { product: Product })[];
};

export interface CrmClient {
  upsertDeal(order: OrderWithRelations): Promise<{ dealId: string; contactId: string }>;
}

const provider = process.env.CRM_PROVIDER ?? "mock";

/** amoCRM: сделки создаются через Leads API, контакт привязывается к сделке. */
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

    // 1. Находим или создаём контакт по email заказчика
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

    // 2. Создаём сделку и линкуем контакт
    const dealRes = await fetch(`${this.baseUrl}/leads`, {
      method: "POST",
      headers,
      body: JSON.stringify([
        {
          name: `Заказ ${order.number}`,
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

/** Мок-клиент — используется по умолчанию, чтобы демо работало без реальных API-ключей CRM. */
class MockCrmClient implements CrmClient {
  async upsertDeal(order: OrderWithRelations) {
    console.log(
      `[CRM mock] Сделка создана для заказа ${order.number} на сумму ${(
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
    // case "hubspot": return new HubSpotCrmClient(); — добавляется аналогично
    default:
      return new MockCrmClient();
  }
}
