import api from "@/api/axios.ts";
import {
  customerListSchema,
  customerResultSchema,
  type Customer,
  type CustomerInput,
} from "@/feature/customers/schema/customer.ts";

export async function getCustomers(includeArchived: boolean): Promise<Customer[]> {
  const response = await api.get("/customers", { params: includeArchived ? { includeArchived: "1" } : {} });
  return customerListSchema.parse(response.data.data).customers;
}

export async function getCustomer(customerId: string): Promise<Customer> {
  const response = await api.get(`/customers/${customerId}`);
  return customerResultSchema.parse(response.data.data).customer;
}

export async function createCustomer(data: CustomerInput): Promise<Customer> {
  const response = await api.post("/customers", data);
  return customerResultSchema.parse(response.data.data).customer;
}

export async function updateCustomer(customerId: string, data: CustomerInput): Promise<Customer> {
  const response = await api.patch(`/customers/${customerId}`, data);
  return customerResultSchema.parse(response.data.data).customer;
}

export async function archiveCustomer(customerId: string): Promise<Customer> {
  const response = await api.post(`/customers/${customerId}/archive`);
  return customerResultSchema.parse(response.data.data).customer;
}
