import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api/auth': { target: process.env.AUTH_SERVICE_URL || 'http://localhost:8081', changeOrigin: true },
      '/api/customers': { target: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:8082', changeOrigin: true },
      '/api/products': { target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:8083', changeOrigin: true },
      '/api/orders': { target: process.env.ORDER_SERVICE_URL || 'http://localhost:8084', changeOrigin: true },
      '/api/inventory': { target: process.env.INVENTORY_SERVICE_URL || 'http://localhost:8085', changeOrigin: true },
      '/api/invoices': { target: process.env.BILLING_SERVICE_URL || 'http://localhost:8086', changeOrigin: true },
      '/api/shipments': { target: process.env.WAREHOUSE_SERVICE_URL || 'http://localhost:8087', changeOrigin: true },
    },
  },
})

