import { useEffect, useState } from 'react'
import {
  AppBar, Avatar, Box, Button, Card, CardContent, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, Drawer, IconButton,
  List, ListItemButton, ListItemIcon, ListItemText, Snackbar,
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
  getInventory, listInvoices, listShipments,
} from './api/client'
import type { CustomerResponse, ProductResponse, OrderResponse, InvoiceResponse, ShipmentResponse, LoginResponse } from './api/client'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'customers', label: 'Clientes', icon: <CustomerIcon /> },
  { id: 'products', label: 'Productos', icon: <ProductIcon /> },
  { id: 'orders', label: 'Pedidos', icon: <OrderIcon /> },
  { id: 'inventory', label: 'Inventario', icon: <InventoryIcon /> },
  { id: 'invoices', label: 'Facturas', icon: <Receipt /> },
  { id: 'shipments', label: 'Despachos', icon: <ShipmentIcon /> },
]

const statusColors: Record<string, string> = {
  ACTIVE: '#4caf50', CONFIRMED: '#2196f3', PENDING: '#ff9800',
  SHIPPED: '#9c27b0', READY_FOR_BILLING: '#ff9800', ISSUED: '#4caf50',
  AVAILABLE: '#4caf50', OUT_OF_STOCK: '#f44336',
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
  const [productForm, setProductForm] = useState({ sku: '', name: '', description: '', unitPrice: '' })
  const [orderForm, setOrderForm] = useState({ customerId: '', productId: '', quantity: '', unitPrice: '' })
  const [createDialog, setCreateDialog] = useState<'customer' | 'product' | 'order' | null>(null)

  const [inventorySearch, setInventorySearch] = useState('')
  const [inventoryResult, setInventoryResult] = useState<any>(null)

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

  async function handleCreateCustomer() {
    try {
      const c = await createCustomer(token, { ...customerForm, phone: customerForm.phone || 'N/A', address: customerForm.address || 'N/A' })
      setCustomers(prev => [...prev, c])
      setCreateDialog(null)
      setCustomerForm({ code: '', name: '', email: '', phone: '', address: '' })
      setSnack('Cliente creado')
    } catch { setError('Error al crear cliente') }
  }

  async function handleCreateProduct() {
    try {
      const p = await createProduct(token, { ...productForm, unitPrice: Number(productForm.unitPrice) })
      setProducts(prev => [...prev, p])
      setCreateDialog(null)
      setProductForm({ sku: '', name: '', description: '', unitPrice: '' })
      setSnack('Producto creado')
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
      setSnack(`Pedido ${o.orderNumber} → ${o.status}`)
    } catch { setError('Error al crear pedido') }
  }

  async function handleInventorySearch() {
    if (!inventorySearch) return
    try {
      const r = await getInventory(token, Number(inventorySearch))
      setInventoryResult(r)
    } catch { setError('Producto no encontrado') }
  }

  const sidebar = (
    <Box sx={{ width: 240, bgcolor: '#0a1628', height: '100%', color: '#eaf1ff', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Typography variant="h6" fontWeight={900} sx={{ color: '#7cf0c8' }}>Northwind SOA</Typography>
        <Typography variant="caption" color="#9fb2d4">Sistema de gestión</Typography>
      </Box>
      <List sx={{ pt: 1, flex: 1, overflow: 'auto' }}>
        {navItems.map(item => (
          <ListItemButton key={item.id} selected={page === item.id} onClick={() => { setPage(item.id); setMobileOpen(false) }}
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
              {navItems.find(n => n.id === page)?.label ?? 'Dashboard'}
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
                sx={{ borderColor: '#7cf0c8', color: '#7cf0c8', flexShrink: 0 }}>Login</Button>
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
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                      sx={{ '& .MuiInputBase-root': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }, '& .MuiInputLabel-root': { color: '#9fb2d4' } }} />
                    <TextField size="small" label="Contraseña" type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                      sx={{ '& .MuiInputBase-root': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }, '& .MuiInputLabel-root': { color: '#9fb2d4' } }} />
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
                <Typography variant="h4" fontWeight={900} sx={{ mb: 1, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' } }}>Panel de control</Typography>
                <Typography color="#9fb2d4" sx={{ mb: 3 }}>Sistema de gestión comercial Northwind Traders</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
                  {[
                    { label: 'Clientes', value: customers.length, icon: <CustomerIcon />, color: '#4caf50' },
                    { label: 'Productos', value: products.length, icon: <ProductIcon />, color: '#2196f3' },
                    { label: 'Pedidos', value: orders.length, icon: <OrderIcon />, color: '#ff9800' },
                    { label: 'Servicios', value: '7 activos', icon: <Storage />, color: '#9c27b0' },
                  ].map(stat => (
                    <Card key={stat.label} sx={{ bgcolor: 'rgba(18,35,60,0.9)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                        <Avatar sx={{ bgcolor: `${stat.color}22`, color: stat.color, width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}>{stat.icon}</Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="h4" fontWeight={900} sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, lineHeight: 1.2 }}>{stat.value}</Typography>
                          <Typography variant="body2" color="#9fb2d4" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{stat.label}</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Arquitectura del sistema</Typography>
                <Card sx={{ bgcolor: 'rgba(18,35,60,0.9)', borderRadius: 3, p: { xs: 2, sm: 3 }, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Chip icon={<Storage />} label="MySQL" size="small" sx={{ bgcolor: '#ff980022', color: '#ff9800', fontWeight: 700 }} />
                    <Typography color="#9fb2d4" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>→</Typography>
                    {['Auth', 'Customers', 'Products', 'Orders', 'Inventory', 'Billing', 'Warehouse'].map(s => (
                      <Chip key={s} label={s} size="small" sx={{ bgcolor: 'rgba(124,240,200,0.1)', color: '#7cf0c8', fontSize: { xs: '0.7rem', sm: '0.8125rem' } }} />
                    ))}
                    <Typography color="#9fb2d4" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>→</Typography>
                    <Chip icon={<LocalShipping />} label="Frontend" size="small" sx={{ bgcolor: '#2196f322', color: '#2196f3', fontWeight: 700 }} />
                  </Box>
                </Card>
              </>
            )
          )}

          {page === 'customers' && <DataTable title="Clientes" rows={customers} columns={['ID', 'Código', 'Nombre', 'Email', 'Teléfono', 'Dirección', 'Estado']}
            renderRow={r => [r.id, r.code, r.name, r.email, r.phone, r.address, <StatusChip value={r.status} />]}
            onAdd={() => setCreateDialog('customer')} loading={loading} />}

          {page === 'products' && <DataTable title="Productos" rows={products} columns={['ID', 'SKU', 'Nombre', 'Descripción', 'Precio', 'Estado']}
            renderRow={r => [r.id, r.sku, r.name, r.description, `$${r.unitPrice.toFixed(2)}`, <StatusChip value={r.status} />]}
            onAdd={() => setCreateDialog('product')} loading={loading} />}

          {page === 'orders' && (
            <>
              <DataTable title="Pedidos" rows={orders} columns={['N° Pedido', 'Cliente', 'Total', 'Estado', 'Factura', 'Tracking']}
                renderRow={r => [r.orderNumber, r.customerId, `$${r.totalAmount.toFixed(2)}`, <StatusChip value={r.status} />,
                  r.invoiceNumber || '—', r.trackingCode || '—']}
                onAdd={() => setCreateDialog('order')} loading={loading} />
              <OrderFlowDiagram orders={orders} />
            </>
          )}

          {page === 'invoices' && <DataTable title="Facturas" rows={invoices}
            columns={['N° Factura', 'Order ID', 'Monto', 'Estado']}
            renderRow={r => [r.invoiceNumber, r.orderId, `$${r.amount.toFixed(2)}`, <StatusChip value={r.status} />]}
            loading={loading} />}

          {page === 'shipments' && <DataTable title="Despachos" rows={shipments}
            columns={['N° Despacho', 'Order ID', 'Tracking', 'Estado']}
            renderRow={r => [r.shipmentNumber, r.orderId, r.trackingCode || '—', <StatusChip value={r.status} />]}
            loading={loading} />}

          {page === 'inventory' && (
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ mb: 2, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>Inventario</Typography>
              <Card sx={{ bgcolor: 'rgba(18,35,60,0.9)', borderRadius: 3, p: { xs: 2, sm: 3 }, mb: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField size="small" label="ID del producto" value={inventorySearch} onChange={e => setInventorySearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleInventorySearch()}
                    sx={{ width: { xs: '100%', sm: 240 }, '& .MuiInputBase-root': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }, '& .MuiInputLabel-root': { color: '#9fb2d4' } }} />
                  <Button variant="contained" onClick={handleInventorySearch}
                    sx={{ width: { xs: '100%', sm: 'auto' }, bgcolor: '#7cf0c8', color: '#07111f', fontWeight: 700, '&:hover': { bgcolor: '#5dd4a8' } }}>Consultar</Button>
                </Box>
              </Card>
              {inventoryResult && (
                <Card sx={{ bgcolor: 'rgba(18,35,60,0.9)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Producto #{inventoryResult.productId}</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                      {[
                        { l: 'Disponible', v: inventoryResult.availableQuantity, c: '#4caf50' },
                        { l: 'Reservado', v: inventoryResult.reservedQuantity, c: '#ff9800' },
                        { l: 'Estado', v: inventoryResult.status, c: statusColors[inventoryResult.status] || '#9fb2d4' },
                      ].map(s => (
                        <Box key={s.l} sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }}>
                          <Typography variant="h4" fontWeight={900} sx={{ color: s.c, fontSize: { xs: '1.5rem', sm: '2rem' } }}>{s.v}</Typography>
                          <Typography variant="body2" color="#9fb2d4" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{s.l}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </Box>
      </Box>

      <Dialog open={!!createDialog} onClose={() => setCreateDialog(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: '#0a1628', color: '#eaf1ff', borderRadius: 3, m: 2 } }}>
        {createDialog === 'customer' && (
          <>
            <DialogTitle fontWeight={800}>Nuevo cliente</DialogTitle>
            <DialogContent>
              <DialogFields fields={[
                { label: 'Código', value: customerForm.code, onChange: v => setCustomerForm(f => ({ ...f, code: v })) },
                { label: 'Nombre', value: customerForm.name, onChange: v => setCustomerForm(f => ({ ...f, name: v })) },
                { label: 'Email', value: customerForm.email, onChange: v => setCustomerForm(f => ({ ...f, email: v })) },
                { label: 'Teléfono', value: customerForm.phone, onChange: v => setCustomerForm(f => ({ ...f, phone: v })) },
                { label: 'Dirección', value: customerForm.address, onChange: v => setCustomerForm(f => ({ ...f, address: v })) },
              ]} />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setCreateDialog(null)} sx={{ color: '#9fb2d4' }}>Cancelar</Button>
              <Button variant="contained" onClick={handleCreateCustomer}
                sx={{ bgcolor: '#7cf0c8', color: '#07111f', '&:hover': { bgcolor: '#5dd4a8' } }}>Crear</Button>
            </DialogActions>
          </>
        )}
        {createDialog === 'product' && (
          <>
            <DialogTitle fontWeight={800}>Nuevo producto</DialogTitle>
            <DialogContent>
              <DialogFields fields={[
                { label: 'SKU', value: productForm.sku, onChange: v => setProductForm(f => ({ ...f, sku: v })) },
                { label: 'Nombre', value: productForm.name, onChange: v => setProductForm(f => ({ ...f, name: v })) },
                { label: 'Descripción', value: productForm.description, onChange: v => setProductForm(f => ({ ...f, description: v })) },
                { label: 'Precio unitario', value: productForm.unitPrice, onChange: v => setProductForm(f => ({ ...f, unitPrice: v })) },
              ]} />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setCreateDialog(null)} sx={{ color: '#9fb2d4' }}>Cancelar</Button>
              <Button variant="contained" onClick={handleCreateProduct}
                sx={{ bgcolor: '#7cf0c8', color: '#07111f', '&:hover': { bgcolor: '#5dd4a8' } }}>Crear</Button>
            </DialogActions>
          </>
        )}
        {createDialog === 'order' && (
          <>
            <DialogTitle fontWeight={800}>Nuevo pedido</DialogTitle>
            <DialogContent>
              <DialogFields fields={[
                { label: 'Customer ID', value: orderForm.customerId, onChange: v => setOrderForm(f => ({ ...f, customerId: v })) },
                { label: 'Product ID', value: orderForm.productId, onChange: v => setOrderForm(f => ({ ...f, productId: v })) },
                { label: 'Cantidad', value: orderForm.quantity, onChange: v => setOrderForm(f => ({ ...f, quantity: v })) },
                { label: 'Precio unitario', value: orderForm.unitPrice, onChange: v => setOrderForm(f => ({ ...f, unitPrice: v })) },
              ]} />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setCreateDialog(null)} sx={{ color: '#9fb2d4' }}>Cancelar</Button>
              <Button variant="contained" onClick={handleCreateOrder}
                sx={{ bgcolor: '#7cf0c8', color: '#07111f', '&:hover': { bgcolor: '#5dd4a8' } }}>Crear pedido</Button>
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

function DataTable({ title, rows, columns, renderRow, onAdd, loading }: {
  title: string; rows: any[]; columns: string[]; renderRow: (row: any) => any[]; onAdd?: () => void; loading?: boolean
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>{title}</Typography>
        {onAdd && <Button startIcon={<AddIcon />} variant="contained" onClick={onAdd} size="small"
          sx={{ bgcolor: '#7cf0c8', color: '#07111f', fontWeight: 700, whiteSpace: 'nowrap', '&:hover': { bgcolor: '#5dd4a8' } }}>Nuevo</Button>}
      </Box>
      <Card sx={{ bgcolor: 'rgba(18,35,60,0.9)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress sx={{ color: '#7cf0c8' }} /></Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {columns.map(c => <TableCell key={c} sx={{ color: '#7cf0c8', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap', px: { xs: 1, sm: 2 } }}>{c}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} sx={{ textAlign: 'center', color: '#9fb2d4', py: 4, borderBottom: 'none' }}>Sin datos</TableCell>
                  </TableRow>
                ) : rows.map((row, i) => (
                  <TableRow key={i} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                    {renderRow(row).map((cell, j) => (
                      <TableCell key={j} sx={{ color: '#eaf1ff', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap', px: { xs: 1, sm: 2 } }}>{cell}</TableCell>
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
  return <Chip label={value} size="small" sx={{ bgcolor: `${statusColors[value] || '#9fb2d4'}22`, color: statusColors[value] || '#9fb2d4', fontWeight: 700, fontSize: '0.7rem' }} />
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
        <Typography variant="body2" color="#9fb2d4" sx={{ mb: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{lastOrder.orderNumber} — Estado: {lastOrder.status}</Typography>
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
