# Order Module Implementation Plan

## Information Gathered
- Project is a Next.js e-commerce app with Firebase authentication
- Has MongoDB database with models for Cart, Product, User, etc.
- Has existing dashboard orders API at `/api/dashboard/orders` (currently returns mock data)
- Has auth middleware for Firebase token verification
- Admin dashboard at `/admin/dashboard` shows latest orders in a table

## Plan: Complete Order Module

### Phase 1: Create Order Model
- [ ] Create `/models/Order.model.js` - MongoDB schema for orders

### Phase 2: Create Order API Routes
- [ ] Create `/app/api/order/route.js` - GET all orders, POST new order
- [ ] Create `/app/api/order/route.js` - PUT (update status), DELETE order
- [ ] Create `/app/api/order/create/` - Create order from cart
- [ ] Create `/app/api/order/get/` - Get single order
- [ ] Create `/app/api/order/update/` - Update order status
- [ ] Create `/app/api/order/delete/` - Delete/cancel order

### Phase 3: Admin Dashboard Orders Page
- [ ] Create `/app/(root)/(admin)/admin/orders/page.jsx` - Orders list page
- [ ] Create Order Details Modal component
- [ ] Add status update functionality
- [ ] Add pagination and filtering

### Phase 4: Website Order Pages (Customer)
- [ ] Create `/app/(storefront)/orders/page.jsx` - Customer orders list
- [ ] Create `/app/(storefront)/order/[id]/page.jsx` - Order details page

### Phase 5: Connect Dashboard API to Frontend
- [ ] Update `/app/api/dashboard/orders/route.js` to use real Order model
- [ ] Add more order details to the API response

## Files to Create
1. `models/Order.model.js`
2. `app/api/order/route.js`
3. `app/api/order/create/route.js`
4. `app/api/order/get/route.js`
5. `app/api/order/update/route.js`
6. `app/api/order/delete/route.js`
7. `app/(root)/(admin)/admin/orders/page.jsx`
8. `components/Application/Admin/OrderModal.jsx` (or reuse existing modal)
9. `app/(storefront)/orders/page.jsx`
10. `app/(storefront)/order/[id]/page.jsx`

## Files to Edit
1. `app/api/dashboard/orders/route.js` - Connect to real Order model
2. `lib/adminSidebarMenu.js` - Add Orders menu item

## Follow-up Steps
- Run build to check for errors
- Test the order creation flow
- Test order status updates

