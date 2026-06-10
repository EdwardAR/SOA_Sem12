import { useEffect, useState } from 'react'
import {
  AppBar, Avatar, Box, Button, Card, CardContent, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, Drawer, IconButton,
  FormControl, InputLabel, List, ListItemButton, ListItemIcon, ListItemText,
  MenuItem, Select, Snackbar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Toolbar, Typography, useMediaQuery, useTheme,
} from '@mui/material'
import {
  Assessment as DashboardIcon, Business as CustomerIcon,
  Inventory as ProductIcon, Receipt as OrderIcon,
  Warehouse as InventoryIcon, LocalShipping as ShipmentIcon,
  Login as LoginIcon, Logout as LogoutIcon, Add as AddIcon,
  Menu as MenuIcon, CheckCircle, LocalShipping, Receipt, Storage,
} from '@mui/icons-material'
import {
  login, listCustomers, createCustomer,
  listProducts, createProduct,
  listOrders, createOrder,
  getInventory, listInvoices, listShipments, restockInventory,
  createInvoice, createShipment,
} from './api/client'
import type { CustomerResponse, ProductResponse, OrderResponse, InvoiceResponse, ShipmentResponse, LoginResponse } from './api/client'

const navItems = [
  { id: 'dashboard', label: 'Panel', icon: <DashboardIcon /> },
  { id: 'customers', label: 'Clientes', icon: <CustomerIcon /> },
  { id: 'products', label: 'Productos', icon: <ProductIcon /> },
  { id: 'orders', label: 'Pedidos', icon: <OrderIcon /> },
  { id: 'inventory', label: 'Inventario', icon: <InventoryIcon /> },
  { id: 'invoices', label: 'Facturas', icon: <Receipt /> },
  { id: 'shipments', label: 'Despachos', icon: <ShipmentIcon /> },
]

const statusLabels: Record<string, string> = {
  ACTIVE: 'Activo', CONFIRMED: 'Confirmado', PENDING: 'Pendiente',
  SHIPPED: 'Enviado', READY_FOR_BILLING: 'Pendiente de factura', ISSUED: 'Emitido',
  AVAILABLE: 'Disponible', OUT_OF_STOCK: 'Sin stock', NOT_FOUND: 'Sin inventario',
  LOW_STOCK: 'Stock bajo',
}

const statusColors: Record<string, string> = {
  ACTIVE: '#4caf50', CONFIRMED: '#2196f3', PENDING: '#ff9800',
  SHIPPED: '#9c27b0', READY_FOR_BILLING: '#ff9800', ISSUED: '#4caf50',
  AVAILABLE: '#4caf50', OUT_OF_STOCK: '#f44336', NOT_FOUND: '#9e9e9e',
  LOW_STOCK: '#ff9800',
}

const textFieldSx = {
  '& .MuiInputBase-root': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1.5 },
  '& .MuiInputLabel-root': { color: '#9fb2d4' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(124,240,200,0.3)' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7cf0c8' },
}

export default function App() {
  const theme = useTheme()
  const isSm = useMediaQuery(theme.breakpoints.down('md'))
  const [page, setPage] = useState('dashboard')
  const [token, setToken] = useState('')
  const [user, setUser] = useState<LoginResponse | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loginUser, setLoginUser] = useState('admin')
  const [loginPass, setLoginPass] = useState('admin')
  const [error, setError] = useState('')
  const [snack, setSnack] = useState('')
  const [loading, setLoading] = useState(false)

  const [customers, setCustomers] = useState<CustomerResponse[]>([])
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([])
  const [shipments, setShipments] = useState<ShipmentResponse[]>([])

  const [customerForm, setCustomerForm] = useState({ code: '', name: '', email: '', phone: '', address: '' })
  const [productForm, setProductForm] = useState({ sku: '', name: '', description: '', unitPrice: '', stock: '' })
  const [orderForm, setOrderForm] = useState({ customerId: '', productId: '', quantity: '', unitPrice: '' })
  const [createDialog, setCreateDialog] = useState<'customer' | 'product' | 'order' | 'invoice' | 'shipment' | null>(null)

  const [inventorySearch, setInventorySearch] = useState('')
  const [inventoryResult, setInventoryResult] = useState<any>(null)

  const [customerErrors, setCustomerErrors] = useState({ email: '', phone: '' })

  const [detailInvoice, setDetailInvoice] = useState<InvoiceResponse | null>(null)
  const [detailShipment, setDetailShipment] = useState<ShipmentResponse | null>(null)
  const [invoiceForm, setInvoiceForm] = useState({ orderId: '', amount: '' })
  const [shipmentForm, setShipmentForm] = useState({ orderId: '', orderNumber: '' })

  useEffect(() => {
    if (!token) return
    setLoading(true)
    Promise.allSettled([
      listCustomers(token).then(setCustomers).catch(() => {}),
      listProducts(token).then(setProducts).catch(() => {}),
      listOrders(token).then(setOrders).catch(() => {}),
      listInvoices(token).then(setInvoices).catch(() => {}),
      listShipments(token).then(setShipments).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [token])

  async function handleLogin() {
    try {
      const res = await login(loginUser, loginPass)
      setToken(res.token)
      setUser(res)
      setError('')
      setSnack(`Bienvenido ${res.username}`)
    } catch { setError('Credenciales inválidas') }
  }

  function validateEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Correo inválido'
  }
  function validatePhone(v: string) {
    return /^9\d{8}$/.test(v) ? '' : 'Debe ser 9 dígitos empezando con 9'
  }

  async function handleCreateCustomer() {
    const emailErr = validateEmail(customerForm.email)
    const phoneErr = validatePhone(customerForm.phone)
    setCustomerErrors({ email: emailErr, phone: phoneErr })
    if (emailErr || phoneErr) return
    try {
      const c = await createCustomer(token, { ...customerForm, phone: customerForm.phone || 'N/A', address: customerForm.address || 'N/A' })
      setCustomers(prev => [...prev, c])
      setCreateDialog(null)
      setCustomerForm({ code: '', name: '', email: '', phone: '', address: '' })
      setCustomerErrors({ email: '', phone: '' })
      setSnack('Cliente creado')
    } catch { setError('Error al crear cliente') }
  }

  async function handleCreateProduct() {
    try {
      const p = await createProduct(token, { ...productForm, unitPrice: Number(productForm.unitPrice) })
      setProducts(prev => [...prev, p])
      const stockQty = Number(productForm.stock)
      if (stockQty > 0) {
        await restockInventory(token, [{ productId: p.id, quantity: stockQty, unitPrice: Number(productForm.unitPrice) }])
      }
      setCreateDialog(null)
      setProductForm({ sku: '', name: '', description: '', unitPrice: '', stock: '' })
      setSnack(stockQty > 0 ? 'Producto creado con stock' : 'Producto creado')
    } catch { setError('Error al crear producto') }
  }

  async function handleCreateOrder() {
    try {
      const o = await createOrder(token, {
        customerId: Number(orderForm.customerId),
        items: [{ productId: Number(orderForm.productId), quantity: Number(orderForm.quantity), unitPrice: Number(orderForm.unitPrice) }],
      })
      setOrders(prev => [o, ...prev])
      setCreateDialog(null)
      setOrderForm({ customerId: '', productId: '', quantity: '', unitPrice: '' })
      setSnack(`Pedido ${o.orderNumber} → ${statusLabels[o.status] || o.status}`)
    } catch { setError('Error al crear pedido') }
  }

  async function handleInventorySearch() {
    if (!inventorySearch) return
    try {
      const r = await getInventory(token, Number(inventorySearch))
      setInventoryResult(r)
    } catch { setError('Producto no encontrado') }
  }

  async function handleCreateInvoice() {
    try {
      const inv = await createInvoice(token, { orderId: Number(invoiceForm.orderId), amount: Number(invoiceForm.amount) })
      setInvoices(prev => [...prev, inv])
      setSnack(`Factura ${inv.invoiceNumber} creada`)
      setInvoiceForm({ orderId: '', amount: '' })
      setCreateDialog(null)
    } catch { setError('Error al crear factura') }
  }

  async function handleCreateShipment() {
    try {
      const s = await createShipment(token, { orderId: Number(shipmentForm.orderId), orderNumber: shipmentForm.orderNumber })
      setShipments(prev => [...prev, s])
      setSnack(`Despacho ${s.shipmentNumber} creado`)
      setShipmentForm({ orderId: '', orderNumber: '' })
      setCreateDialog(null)
    } catch { setError('Error al crear despacho') }
  }

  const sidebar = (
    <Box sx={{ width: 240, bgcolor: '#0a1628', height: '100%', color: '#eaf1ff', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Typography variant="h6" fontWeight={900} sx={{ color: '#7cf0c8' }}>Northwind SOA</Typography>
        <Typography variant="caption" color="#9fb2d4">Sistema de gestión</Typography>
      </Box>
      <List sx={{ pt: 1, flex: 1, overflow: 'auto' }}>
        {navItems.map(item => (
          <ListItemButton key={item.id} selected={page === item.id} onClick={() => {
            if (!user && item.id !== 'dashboard') { setError('Debe iniciar sesión para acceder'); return }
            setPage(item.id); setMobileOpen(false)
          }}
            sx={{ mx: 1, borderRadius: 2, my: 0.3, '&.Mui-selected': { bgcolor: 'rgba(124,240,200,0.1)', color: '#7cf0c8' } }}>
            <ListItemIcon sx={{ color: page === item.id ? '#7cf0c8' : '#9fb2d4', minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: page === item.id ? 700 : 400 }} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#07111f', color: '#eaf1ff' }}>
      {!isSm && (
        <Drawer variant="permanent" PaperProps={{ sx: { width: 240, bgcolor: '#0a1628', borderRight: '1px solid rgba(255,255,255,0.06)', position: 'relative' } }}>
          {sidebar}
        </Drawer>
      )}
      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
        sx={{ display: isSm ? 'block' : 'none', '& .MuiDrawer-paper': { width: 240, bgcolor: '#0a1628' } }}>
        {sidebar}
      </Drawer>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, maxWidth: '100%' }}>
        <AppBar position="sticky" sx={{ bgcolor: 'rgba(7,17,31,0.92)', backdropFilter: 'blur(12px)' }}>
          <Toolbar>
            {isSm && (
              <IconButton edge="start" color="inherit" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ flex: 1, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {navItems.find(n => n.id === page)?.label ?? 'Panel'}
            </Typography>
            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                <Chip label={user.role} size="small" sx={{ bgcolor: 'rgba(124,240,200,0.15)', color: '#7cf0c8', fontWeight: 700, display: { xs: 'none', sm: 'inline-flex' } }} />
                <Typography variant="body2" sx={{ color: '#9fb2d4', display: { xs: 'none', sm: 'block' } }}>{user.username}</Typography>
                <IconButton color="inherit" size="small" onClick={() => { setToken(''); setUser(null); setPage('dashboard'); setError('') }}>
                  <LogoutIcon />
                </IconButton>
              </Box>
            ) : (
              <Button startIcon={<LoginIcon />} variant="outlined" size="small" onClick={() => setPage('dashboard')}
                sx={{ borderColor: '#7cf0c8', color: '#7cf0c8', flexShrink: 0 }}>Iniciar sesión</Button>
            )}
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, flex: 1, overflow: 'auto', maxWidth: '100%' }}>
          {page === 'dashboard' && (
            !user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}>
                <Card sx={{ bgcolor: 'rgba(18,35,60,0.9)', borderRadius: 4, p: { xs: 3, sm: 4 }, maxWidth: 420, width: '100%', mx: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#7cf0c822', color: '#7cf0c8', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                      <Storage sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Typography variant="h5" fontWeight={900}>Northwind SOA</Typography>
                    <Typography color="#9fb2d4" variant="body2" sx={{ mt: 0.5 }}>Sistema de gestión comercial</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField size="small" label="Usuario" value={loginUser} onChange={e => setLoginUser(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()} sx={textFieldSx} />
                    <TextField size="small" label="Contraseña" type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()} sx={textFieldSx} />
                    {error && <Typography color="#f44336" variant="body2" sx={{ textAlign: 'center' }}>{error}</Typography>}
                    <Button fullWidth variant="contained" onClick={handleLogin} size="large"
                      sx={{ bgcolor: '#7cf0c8', color: '#07111f', fontWeight: 800, py: 1.2, '&:hover': { bgcolor: '#5dd4a8' } }}>
                      <LoginIcon sx={{ mr: 1 }} /> Iniciar sesión
                    </Button>
                  </Box>
                  <Typography color="#9fb2d4" variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
                    Demo: admin / admin
                  </Typography>
                </Card>
              </Box>
            ) : (
              <>
                <Typography variant="h4" fontWeight={900} sx={{ mb: 1, fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' } }}>Panel de control</Typography>
                <Typography color="#9fb2d4" sx={{ mb: 3, fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>Sistema de gestión comercial Northwind Traders</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
                  {[
                    { label: 'Clientes', value: customers.length, icon: <CustomerIcon />, color: '#4caf50' },
                    { label: 'Productos', value: products.length, icon: <ProductIcon />, color: '#2196f3' },
                    { label: 'Pedidos', value: orders.length, icon: <OrderIcon />, color: '#ff9800' },
                    { label: 'Servicios', value: '7 activos', icon: <Storage />, color: '#9c27b0' },
                  ].map(stat => (
                    <Card key={stat.label} sx={{ bgcolor: 'rgba(18,35,60,0.9)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                        <Avatar sx={{ bgcolor: `${stat.color}22`, color: stat.color, width: { xs: 42, sm: 48 }, height: { xs: 42, sm: 48 } }}>{stat.icon}</Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="h4" fontWeight={900} sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' }, lineHeight: 1.2 }}>{stat.value}</Typography>
                          <Typography variant="body2" color="#9fb2d4" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>{stat.label}</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Arquitectura del sistema</Typography>
                <Card sx={{ bgcolor: 'rgba(18,35,60,0.9)', borderRadius: 3, p: { xs: 2, sm: 3 }, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Chip icon={<Storage />} label="MySQL" size="small" sx={{ bgcolor: '#ff980022', color: '#ff9800', fontWeight: 700 }} />
                    <Typography color="#9fb2d4" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>→</Typography>
                    {['Autenticación', 'Clientes', 'Productos', 'Pedidos', 'Inventario', 'Facturación', 'Despachos'].map(s => (
                      <Chip key={s} label={s} size="small" sx={{ bgcolor: 'rgba(124,240,200,0.1)', color: '#7cf0c8', fontSize: { xs: '0.7rem', sm: '0.8125rem' } }} />
                    ))}
                    <Typography color="#9fb2d4" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>→</Typography>
                    <Chip icon={<LocalShipping />} label="Frontend" size="small" sx={{ bgcolor: '#2196f322', color: '#2196f3', fontWeight: 700 }} />
                  </Box>
                </Card>
              </>
            )
          )}

          {page !== 'dashboard' && !user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}>
              <Card sx={{ bgcolor: 'rgba(18,35,60,0.9)', borderRadius: 4, p: { xs: 3, sm: 4 }, maxWidth: 400, width: '100%', mx: 2, textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Avatar sx={{ bgcolor: '#7cf0c822', color: '#7cf0c8', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                  <LoginIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Acceso restringido</Typography>
                <Typography color="#9fb2d4" variant="body2" sx={{ mb: 3 }}>Debe iniciar sesión para acceder a este módulo</Typography>
                <Button variant="contained" onClick={() => setPage('dashboard')}
                  sx={{ bgcolor: '#7cf0c8', color: '#07111f', fontWeight: 700, '&:hover': { bgcolor: '#5dd4a8' } }}>
                  Ir al inicio de sesión
                </Button>
              </Card>
            </Box>
          ) : (
            <>
              {page === 'customers' && <DataTable title="Clientes" rows={customers} columns={['ID', 'Código', 'Nombre', 'Email', 'Teléfono', 'Dirección', 'Estado']}
                renderRow={r => [r.id, r.code, r.name, r.email, r.phone, r.address, <StatusChip value={r.status} />]}
                onAdd={() => { setCustomerForm(f => ({ ...f, code: `CLI-${String(customers.length + 1).padStart(3, '0')}` })); setCreateDialog('customer') }} loading={loading} />}

              {page === 'products' && <DataTable title="Productos" rows={products} columns={['ID', 'Código', 'Nombre', 'Descripción', 'Precio', 'Estado']}
                renderRow={r => [r.id, r.sku, r.name, r.description, `S/${r.unitPrice.toFixed(2)}`, <StatusChip value={r.status} />]}
                onAdd={() => { setProductForm(f => ({ ...f, sku: `PROD-${String(products.length + 1).padStart(3, '0')}` })); setCreateDialog('product') }} loading={loading} />}

              {page === 'orders' && (
                <>
                  <DataTable title="Pedidos" rows={orders} columns={['N° Pedido', 'Cliente', 'Total', 'Estado', 'Factura', 'Tracking']}
                    renderRow={r => [r.orderNumber, customers.find(c => c.id === r.customerId)?.name || `#${r.customerId}`, `S/${r.totalAmount.toFixed(2)}`, <StatusChip value={r.status} />,
                      r.invoiceNumber || '—', r.trackingCode || '—']}
                    onAdd={() => setCreateDialog('order')} loading={loading} />
                  <OrderFlowDiagram orders={orders} />
                </>
              )}

              {page === 'invoices' && <DataTable title="Facturas" rows={invoices}
                columns={['N° Factura', 'Pedido ID', 'Monto', 'Estado']}
                renderRow={r => [r.invoiceNumber, r.orderId, `S/${r.amount.toFixed(2)}`, <StatusChip value={r.status} />]}
                onRowClick={r => setDetailInvoice(r)} onAdd={() => setCreateDialog('invoice')} addLabel="Nueva factura" loading={loading} />}

              {page === 'shipments' && <DataTable title="Despachos" rows={shipments}
                columns={['N° Despacho', 'Pedido ID', 'Tracking', 'Estado']}
                renderRow={r => [r.shipmentNumber, r.orderId, r.trackingCode || '—', <StatusChip value={r.status} />]}
                onRowClick={r => setDetailShipment(r)} onAdd={() => setCreateDialog('shipment')} addLabel="Nuevo despacho" loading={loading} />}

              {page === 'inventory' && (
                <Box>
                  <Typography variant="h5" fontWeight={800} sx={{ mb: 2, fontSize: { xs: '1.3rem', sm: '1.7rem' } }}>Inventario</Typography>
                  <Card sx={{ bgcolor: 'rgba(18,35,60,0.9)', borderRadius: 3, p: { xs: 2, sm: 3 }, mb: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexDirection: { xs: 'column', sm: 'row' } }}>
                      <FormControl size="small" sx={{ width: { xs: '100%', sm: 280 } }}>
                        <InputLabel sx={{ color: '#9fb2d4' }}>Producto</InputLabel>
                        <Select value={inventorySearch} onChange={e => { setInventorySearch(e.target.value); setInventoryResult(null) }}
                          sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(124,240,200,0.3)' }, '& .MuiSvgIcon-root': { color: '#9fb2d4' } }}>
                          {products.map(p => (
                            <MenuItem key={p.id} value={String(p.id)}>{p.sku} — {p.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button variant="contained" onClick={handleInventorySearch}
                        sx={{ width: { xs: '100%', sm: 'auto' }, bgcolor: '#7cf0c8', color: '#07111f', fontWeight: 700, '&:hover': { bgcolor: '#5dd4a8' } }}>Consultar</Button>
                    </Box>
                  </Card>
                  {inventoryResult && (() => {
                    const prod = products.find(p => p.id === inventoryResult.productId)
                    return (
                      <Card sx={{ bgcolor: 'rgba(18,35,60,0.9)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{prod?.name || `Producto #${inventoryResult.productId}`}</Typography>
                            {prod && <Typography variant="body2" color="#9fb2d4" sx={{ mt: 0.5 }}>{prod.sku} — {prod.description}</Typography>}
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                            {[
                              { l: 'Disponible', v: inventoryResult.availableQuantity, c: '#4caf50' },
                              { l: 'Reservado', v: inventoryResult.reservedQuantity, c: '#ff9800' },
                              { l: 'Estado', v: statusLabels[inventoryResult.status] || inventoryResult.status, c: statusColors[inventoryResult.status] || '#9fb2d4' },
                            ].map(s => (
                              <Box key={s.l} sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }}>
                                <Typography variant="h4" fontWeight={900} sx={{ color: s.c, fontSize: { xs: '1.8rem', sm: '2.3rem' } }}>{s.v}</Typography>
                                <Typography variant="body2" color="#9fb2d4" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>{s.l}</Typography>
                              </Box>
                            ))}
                          </Box>
                          {prod && (
                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              <Typography variant="body2" color="#9fb2d4">Precio: <strong style={{ color: '#eaf1ff' }}>S/{prod.unitPrice.toFixed(2)}</strong></Typography>
                              <Typography variant="body2" color="#9fb2d4">Código: <strong style={{ color: '#eaf1ff' }}>{prod.sku}</strong></Typography>
                              <Typography variant="body2" color="#9fb2d4">ID: <strong style={{ color: '#eaf1ff' }}>#{prod.id}</strong></Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })()}
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      <Dialog open={!!createDialog} onClose={() => setCreateDialog(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: '#0a1628', color: '#eaf1ff', borderRadius: 3, m: 2 } }}>
        {createDialog === 'customer' && (
          <>
            <DialogTitle fontWeight={800}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CustomerIcon sx={{ color: '#7cf0c8' }} /> Nuevo cliente
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField size="small" label="Código" value={customerForm.code} onChange={e => setCustomerForm(f => ({ ...f, code: e.target.value }))} fullWidth sx={textFieldSx} />
                  <TextField size="small" label="Nombre" value={customerForm.name} onChange={e => setCustomerForm(f => ({ ...f, name: e.target.value }))} fullWidth sx={textFieldSx} />
                </Box>
                <TextField size="small" label="Email" type="email" value={customerForm.email}
                  onChange={e => { setCustomerForm(f => ({ ...f, email: e.target.value })); setCustomerErrors(p => ({ ...p, email: '' })) }}
                  onBlur={e => setCustomerErrors(p => ({ ...p, email: validateEmail(e.target.value) }))}
                  error={!!customerErrors.email} helperText={customerErrors.email} fullWidth sx={textFieldSx} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField size="small" label="Teléfono" value={customerForm.phone}
                    onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 9); setCustomerForm(f => ({ ...f, phone: v })); setCustomerErrors(p => ({ ...p, phone: '' })) }}
                    onBlur={e => setCustomerErrors(p => ({ ...p, phone: validatePhone(e.target.value) }))}
                    error={!!customerErrors.phone} helperText={customerErrors.phone} fullWidth sx={textFieldSx} />
                  <TextField size="small" label="Dirección" value={customerForm.address} onChange={e => setCustomerForm(f => ({ ...f, address: e.target.value }))} fullWidth sx={textFieldSx} />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setCreateDialog(null)} sx={{ color: '#9fb2d4', fontSize: '0.9rem' }}>Cancelar</Button>
              <Button variant="contained" onClick={handleCreateCustomer}
                sx={{ bgcolor: '#7cf0c8', color: '#07111f', fontSize: '0.9rem', fontWeight: 700, '&:hover': { bgcolor: '#5dd4a8' } }}>Crear cliente</Button>
            </DialogActions>
          </>
        )}
        {createDialog === 'product' && (
          <>
            <DialogTitle fontWeight={800}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ProductIcon sx={{ color: '#7cf0c8' }} /> Nuevo producto
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                <TextField size="small" label="Código" value={productForm.sku} onChange={e => setProductForm(f => ({ ...f, sku: e.target.value }))} fullWidth
                  sx={textFieldSx} />
                <TextField size="small" label="Nombre" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} fullWidth
                  sx={textFieldSx} />
                <TextField size="small" label="Descripción" value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} fullWidth multiline rows={2}
                  sx={textFieldSx} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField size="small" label="Precio (S/)" value={productForm.unitPrice} onChange={e => setProductForm(f => ({ ...f, unitPrice: e.target.value }))} fullWidth
                    sx={textFieldSx} />
                  <TextField size="small" label="Stock inicial" type="number" value={productForm.stock} onChange={e => setProductForm(f => ({ ...f, stock: e.target.value.replace(/\D/g, '') }))} fullWidth
                    sx={textFieldSx} inputProps={{ min: 0 }} />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setCreateDialog(null)} sx={{ color: '#9fb2d4' }}>Cancelar</Button>
              <Button variant="contained" onClick={handleCreateProduct}
                sx={{ bgcolor: '#7cf0c8', color: '#07111f', '&:hover': { bgcolor: '#5dd4a8' } }}>Crear producto</Button>
            </DialogActions>
          </>
        )}
        {createDialog === 'order' && (
          <>
            <DialogTitle fontWeight={800}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <OrderIcon sx={{ color: '#7cf0c8' }} /> Nuevo pedido
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ color: '#9fb2d4' }}>Cliente</InputLabel>
                  <Select value={orderForm.customerId} onChange={e => setOrderForm(f => ({ ...f, customerId: e.target.value }))}
                    sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(124,240,200,0.3)' }, '& .MuiSvgIcon-root': { color: '#9fb2d4' } }}>
                    {customers.map(c => <MenuItem key={c.id} value={String(c.id)}>{c.code} — {c.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ color: '#9fb2d4' }}>Producto</InputLabel>
                  <Select value={orderForm.productId} onChange={e => {
                    const p = products.find(p => String(p.id) === e.target.value)
                    setOrderForm(f => ({ ...f, productId: e.target.value, unitPrice: p ? String(p.unitPrice) : '' }))
                  }}
                    sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(124,240,200,0.3)' }, '& .MuiSvgIcon-root': { color: '#9fb2d4' } }}>
                    {products.map(p => <MenuItem key={p.id} value={String(p.id)}>{p.sku} — {p.name} (S/{p.unitPrice.toFixed(2)})</MenuItem>)}
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField size="small" label="Cantidad" value={orderForm.quantity} onChange={e => setOrderForm(f => ({ ...f, quantity: e.target.value }))} fullWidth sx={textFieldSx} />
                  <TextField size="small" label="Precio unitario" value={orderForm.unitPrice} onChange={e => setOrderForm(f => ({ ...f, unitPrice: e.target.value }))} fullWidth sx={textFieldSx} />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setCreateDialog(null)} sx={{ color: '#9fb2d4' }}>Cancelar</Button>
              <Button variant="contained" onClick={handleCreateOrder}
                sx={{ bgcolor: '#7cf0c8', color: '#07111f', '&:hover': { bgcolor: '#5dd4a8' } }}>Crear pedido</Button>
            </DialogActions>
          </>
        )}
        {createDialog === 'invoice' && (
          <>
            <DialogTitle fontWeight={800}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Receipt sx={{ color: '#7cf0c8' }} /> Nueva factura
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ color: '#9fb2d4' }}>Pedido</InputLabel>
                  <Select value={invoiceForm.orderId} onChange={e => {
                    const o = orders.find(o => String(o.id) === e.target.value)
                    setInvoiceForm(f => ({ ...f, orderId: e.target.value, amount: o ? String(o.totalAmount) : '' }))
                  }}
                    sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(124,240,200,0.3)' }, '& .MuiSvgIcon-root': { color: '#9fb2d4' } }}>
                    {orders.filter(o => !o.invoiceNumber).map(o => (
                      <MenuItem key={o.id} value={String(o.id)}>{o.orderNumber} — S/{o.totalAmount.toFixed(2)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField size="small" label="Monto (S/)" value={invoiceForm.amount} onChange={e => setInvoiceForm(f => ({ ...f, amount: e.target.value }))} fullWidth sx={textFieldSx} />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setCreateDialog(null)} sx={{ color: '#9fb2d4' }}>Cancelar</Button>
              <Button variant="contained" onClick={handleCreateInvoice}
                sx={{ bgcolor: '#7cf0c8', color: '#07111f', '&:hover': { bgcolor: '#5dd4a8' } }}>Crear factura</Button>
            </DialogActions>
          </>
        )}
        {createDialog === 'shipment' && (
          <>
            <DialogTitle fontWeight={800}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShipping sx={{ color: '#7cf0c8' }} /> Nuevo despacho
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ color: '#9fb2d4' }}>Pedido</InputLabel>
                  <Select value={shipmentForm.orderId} onChange={e => {
                    const o = orders.find(o => String(o.id) === e.target.value)
                    setShipmentForm(f => ({ ...f, orderId: e.target.value, orderNumber: o ? o.orderNumber : '' }))
                  }}
                    sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(124,240,200,0.3)' }, '& .MuiSvgIcon-root': { color: '#9fb2d4' } }}>
                    {orders.filter(o => !o.trackingCode).map(o => (
                      <MenuItem key={o.id} value={String(o.id)}>{o.orderNumber}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setCreateDialog(null)} sx={{ color: '#9fb2d4' }}>Cancelar</Button>
              <Button variant="contained" onClick={handleCreateShipment}
                sx={{ bgcolor: '#7cf0c8', color: '#07111f', '&:hover': { bgcolor: '#5dd4a8' } }}>Crear despacho</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={!!detailInvoice} onClose={() => setDetailInvoice(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: '#0a1628', color: '#eaf1ff', borderRadius: 3, m: 2 } }}>
        {detailInvoice && (
          <>
            <DialogTitle fontWeight={800}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Receipt sx={{ color: '#7cf0c8' }} /> Factura {detailInvoice.invoiceNumber}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                {[
                  { l: 'N° Factura', v: detailInvoice.invoiceNumber },
                  { l: 'Pedido', v: `#${detailInvoice.orderId}` },
                  { l: 'Monto', v: `S/${detailInvoice.amount.toFixed(2)}` },
                  { l: 'Estado', v: <StatusChip value={detailInvoice.status} /> },
                ].map(f => (
                  <Box key={f.l} sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.03)' }}>
                    <Typography color="#9fb2d4" variant="body2">{f.l}</Typography>
                    <Typography fontWeight={600}>{f.v}</Typography>
                  </Box>
                ))}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDetailInvoice(null)} sx={{ color: '#9fb2d4' }}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={!!detailShipment} onClose={() => setDetailShipment(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: '#0a1628', color: '#eaf1ff', borderRadius: 3, m: 2 } }}>
        {detailShipment && (
          <>
            <DialogTitle fontWeight={800}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShipping sx={{ color: '#7cf0c8' }} /> Despacho {detailShipment.shipmentNumber}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                {[
                  { l: 'N° Despacho', v: detailShipment.shipmentNumber },
                  { l: 'Pedido', v: `#${detailShipment.orderId}` },
                  { l: 'Código de tracking', v: detailShipment.trackingCode || '—' },
                  { l: 'Estado', v: <StatusChip value={detailShipment.status} /> },
                ].map(f => (
                  <Box key={f.l} sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.03)' }}>
                    <Typography color="#9fb2d4" variant="body2">{f.l}</Typography>
                    <Typography fontWeight={600}>{f.v}</Typography>
                  </Box>
                ))}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDetailShipment(null)} sx={{ color: '#9fb2d4' }}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack}
        ContentProps={{ sx: { bgcolor: '#1b5e20', fontWeight: 600 } }} />
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')} message={error}
        ContentProps={{ sx: { bgcolor: '#b71c1c', fontWeight: 600 } }} />
    </Box>
  )
}

function DataTable({ title, rows, columns, renderRow, onAdd, onRowClick, addLabel, loading }: {
  title: string; rows: any[]; columns: string[]; renderRow: (row: any) => any[]; onAdd?: () => void; onRowClick?: (row: any) => void; addLabel?: string; loading?: boolean
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.3rem', sm: '1.7rem' } }}>{title}</Typography>
        {onAdd && <Button startIcon={<AddIcon />} variant="contained" onClick={onAdd}
          sx={{ bgcolor: '#7cf0c8', color: '#07111f', fontWeight: 700, whiteSpace: 'nowrap', fontSize: { xs: '0.8rem', sm: '0.9rem' }, py: { xs: 0.8, sm: 1 }, px: { xs: 1.5, sm: 2.5 }, '&:hover': { bgcolor: '#5dd4a8' } }}>{addLabel || 'Nuevo'}</Button>}
      </Box>
      <Card sx={{ bgcolor: 'rgba(18,35,60,0.9)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress sx={{ color: '#7cf0c8' }} /></Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {columns.map(c => <TableCell key={c} sx={{ color: '#7cf0c8', fontWeight: 700, fontSize: { xs: '0.8rem', sm: '0.9rem' }, borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap', px: { xs: 1.5, sm: 2.5 } }}>{c}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} sx={{ textAlign: 'center', color: '#9fb2d4', py: 4, fontSize: '0.9rem', borderBottom: 'none' }}>Sin datos</TableCell>
                  </TableRow>
                ) : rows.map((row, i) => (
                  <TableRow key={i} onClick={() => onRowClick?.(row)} sx={{ cursor: onRowClick ? 'pointer' : 'default', '&:hover': { bgcolor: onRowClick ? 'rgba(124,240,200,0.05)' : 'rgba(255,255,255,0.03)' } }}>
                    {renderRow(row).map((cell, j) => (
                      <TableCell key={j} sx={{ color: '#eaf1ff', fontSize: { xs: '0.8rem', sm: '0.9rem' }, borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap', px: { xs: 1.5, sm: 2.5 } }}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  )
}

function StatusChip({ value }: { value: string }) {
  return <Chip label={statusLabels[value] || value} size="small" sx={{ bgcolor: `${statusColors[value] || '#9fb2d4'}22`, color: statusColors[value] || '#9fb2d4', fontWeight: 700, fontSize: '0.8rem', height: 28 }} />
}

function DialogFields({ fields }: { fields: { label: string; value: string; onChange: (v: string) => void; type?: string }[] }) {
  return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
    {fields.map(f => (
      <TextField key={f.label} size="small" label={f.label} type={f.type || 'text'} value={f.value} onChange={e => f.onChange(e.target.value)} fullWidth
        onKeyDown={e => e.key === 'Enter' && (document.activeElement as HTMLElement)?.blur()}
        sx={{ '& .MuiInputBase-root': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }, '& .MuiInputLabel-root': { color: '#9fb2d4' } }} />
    ))}
  </Box>
}

function OrderFlowDiagram({ orders }: { orders: OrderResponse[] }) {
  const lastOrder = orders[0]
  if (!lastOrder) return null
  const steps = [
    { label: 'Pedido', icon: <Receipt />, done: true },
    { label: 'Stock', icon: <CheckCircle />, done: ['CONFIRMED', 'SHIPPED'].includes(lastOrder.status) },
    { label: 'Factura', icon: <Receipt />, done: !!lastOrder.invoiceNumber },
    { label: 'Despacho', icon: <LocalShipping />, done: !!lastOrder.trackingCode },
  ]
  return (
    <Card sx={{ bgcolor: 'rgba(18,35,60,0.9)', borderRadius: 3, mt: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Flujo del último pedido</Typography>
        <Typography variant="body2" color="#9fb2d4" sx={{ mb: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{lastOrder.orderNumber} — Estado: {statusLabels[lastOrder.status] || lastOrder.status}</Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: { xs: 1.5, sm: 1 } }}>
          {steps.map((s, i) => (
            <Box key={s.label} sx={{ display: 'flex', flexDirection: { xs: 'row', sm: 'column' }, alignItems: 'center', gap: 1, flex: { sm: 1 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
                <Avatar sx={{ bgcolor: s.done ? '#4caf5022' : '#9fb2d422', color: s.done ? '#4caf50' : '#9fb2d4', width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}>
                  {s.icon}
                </Avatar>
                <Typography variant="body2" color={s.done ? '#4caf50' : '#9fb2d4'} fontWeight={600} sx={{ fontSize: { xs: '0.8rem', sm: '0.75rem' } }}>{s.label}</Typography>
              </Box>
              {i < steps.length - 1 && (
                <Box sx={{ flex: { xs: 1, sm: 'none' }, height: { xs: 2, sm: 'auto' }, width: { xs: 'auto', sm: '100%' }, minWidth: { sm: 20 }, bgcolor: s.done ? '#4caf50' : 'rgba(255,255,255,0.1)', borderRadius: 1 }} />
              )}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}
