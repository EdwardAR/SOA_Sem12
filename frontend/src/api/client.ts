import axios from 'axios'
import type { AxiosInstance } from 'axios'

const AUTH = import.meta.env.VITE_AUTH_API_BASE_URL ?? 'http://localhost:8081/api'
const CUSTOMER = import.meta.env.VITE_CUSTOMER_API_BASE_URL ?? 'http://localhost:8082/api'
const PRODUCT = import.meta.env.VITE_PRODUCT_API_BASE_URL ?? 'http://localhost:8083/api'
const ORDER = import.meta.env.VITE_ORDER_API_BASE_URL ?? 'http://localhost:8084/api'
const INVENTORY = import.meta.env.VITE_INVENTORY_API_BASE_URL ?? 'http://localhost:8085/api'
const BILLING = import.meta.env.VITE_BILLING_API_BASE_URL ?? 'http://localhost:8086/api'
const WAREHOUSE = import.meta.env.VITE_WAREHOUSE_API_BASE_URL ?? 'http://localhost:8087/api'

export function authClient(): AxiosInstance {
  return axios.create({ baseURL: AUTH })
}

export function apiClient(token?: string): AxiosInstance {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return axios.create({ baseURL: ORDER, headers })
}

export function client(baseURL: string, token?: string): AxiosInstance {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return axios.create({ baseURL, headers })
}

export type CustomerResponse = { id: number; code: string; name: string; email: string; phone: string; address: string; status: string }
export type ProductResponse = { id: number; sku: string; name: string; description: string; unitPrice: number; status: string }
export type OrderResponse = { id: number; orderNumber: string; customerId: number; status: string; totalAmount: number; items: { productId: number; quantity: number; unitPrice: number; lineTotal: number }[]; invoiceNumber: string; trackingCode: string }
export type InventoryResponse = { productId: number; availableQuantity: number; reservedQuantity: number; status: string }
export type InvoiceResponse = { id: number; invoiceNumber: string; orderId: number; amount: number; status: string }
export type ShipmentResponse = { id: number; shipmentNumber: string; orderId: number; trackingCode: string; status: string }
export type LoginResponse = { token: string; role: string; username: string }

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await authClient().post('/auth/login', { username, password })
  return data
}

export async function listCustomers(token: string): Promise<CustomerResponse[]> {
  const { data } = await client(CUSTOMER, token).get('/customers')
  return data
}

export async function createCustomer(token: string, payload: { code: string; name: string; email: string; phone: string; address: string }): Promise<CustomerResponse> {
  const { data } = await client(CUSTOMER, token).post('/customers', payload)
  return data
}

export async function listProducts(token: string): Promise<ProductResponse[]> {
  const { data } = await client(PRODUCT, token).get('/products')
  return data
}

export async function createProduct(token: string, payload: { sku: string; name: string; description: string; unitPrice: number }): Promise<ProductResponse> {
  const { data } = await client(PRODUCT, token).post('/products', payload)
  return data
}

export async function listOrders(token: string): Promise<OrderResponse[]> {
  const { data } = await client(ORDER, token).get('/orders')
  return data
}

export async function createOrder(token: string, payload: { customerId: number; items: { productId: number; quantity: number; unitPrice: number }[] }): Promise<OrderResponse> {
  const { data } = await client(ORDER, token).post('/orders', payload)
  return data
}

export async function getInventory(token: string, productId: number): Promise<InventoryResponse> {
  const { data } = await client(INVENTORY, token).get(`/inventory/${productId}`)
  return data
}

export async function checkInventory(token: string, items: { productId: number; quantity: number; unitPrice: number }[]): Promise<any> {
  const { data } = await client(INVENTORY, token).post('/inventory/check', { items })
  return data
}

export async function reserveInventory(token: string, items: { productId: number; quantity: number; unitPrice: number }[]): Promise<any> {
  const { data } = await client(INVENTORY, token).post('/inventory/reserve', { items })
  return data
}

export async function restockInventory(token: string, items: { productId: number; quantity: number; unitPrice: number }[]): Promise<any> {
  const { data } = await client(INVENTORY, token).post('/inventory/restock', { items })
  return data
}

export async function listInvoices(token: string): Promise<InvoiceResponse[]> {
  const { data } = await client(BILLING, token).get('/invoices')
  return data
}

export async function createInvoice(token: string, payload: { orderId: number; amount: number }): Promise<InvoiceResponse> {
  const { data } = await client(BILLING, token).post('/invoices', payload)
  return data
}

export async function listShipments(token: string): Promise<ShipmentResponse[]> {
  const { data } = await client(WAREHOUSE, token).get('/shipments')
  return data
}

export async function createShipment(token: string, payload: { orderId: number; orderNumber: string }): Promise<ShipmentResponse> {
  const { data } = await client(WAREHOUSE, token).post('/shipments', payload)
  return data
}


