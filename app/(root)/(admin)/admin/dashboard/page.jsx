'use client'

import { useState, useEffect } from 'react'
import { useCallback, useMemo } from 'react'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute"
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Search, TrendingUp, Package, Users, ShoppingCart, Star } from 'lucide-react'

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState(null)
  const [latestOrders, setLatestOrders] = useState([])
  const [latestReviews, setLatestReviews] = useState([])
  const [loading, setLoading] = useState(true)

  // Mock data for charts
  const orderTrendData = [
    { date: 'Jan', orders: 400, revenue: 24000 },
    { date: 'Feb', orders: 520, revenue: 31200 },
    { date: 'Mar', orders: 480, revenue: 28800 },
    { date: 'Apr', orders: 620, revenue: 37200 },
    { date: 'May', orders: 750, revenue: 45000 },
    { date: 'Jun', orders: 890, revenue: 53400 },
  ]

  const orderSummaryData = [
    { status: 'Completed', count: 850, fill: '#10b981' },
    { status: 'Pending', count: 120, fill: '#f59e0b' },
    { status: 'Cancelled', count: 45, fill: '#ef4444' },
    { status: 'Failed', count: 35, fill: '#6b7280' },
  ]

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch stats
        try {
          const statsRes = await axios.get('/api/dashboard/stats')
          if (statsRes.data.success) {
            setStats(statsRes.data.data)
          }
        } catch (error) {
          console.error('Stats fetch error:', error)
          setStats({ totalCategories: 0, totalProducts: 0, totalCustomers: 0, totalOrders: 0 })
        }

        // Fetch orders
        try {
          const ordersRes = await axios.get('/api/dashboard/orders')
          if (ordersRes.data.success) {
            setLatestOrders(ordersRes.data.data || [])
          }
        } catch (error) {
          console.error('Orders fetch error:', error)
          setLatestOrders([])
        }

        // Fetch reviews
        try {
          const reviewsRes = await axios.get('/api/dashboard/reviews')
          if (reviewsRes.data.success) {
            setLatestReviews(reviewsRes.data.data || [])
          }
        } catch (error) {
          console.error('Reviews fetch error:', error)
          setLatestReviews([])
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Dashboard' },
  ]

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      failed: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <BreadCrumb breadcrumbData={breadcrumbData} />

      {/* Search Bar */}
      <Card className="rounded shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search orders, products, or customers..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Categories */}
        <Card className="rounded shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Package className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCategories || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Active categories</p>
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="rounded shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-gray-500 mt-1">In inventory</p>
          </CardContent>
        </Card>

        {/* Customers */}
        <Card className="rounded shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Registered users</p>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card className="rounded shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order Trend Chart */}
        <Card className="lg:col-span-2 rounded shadow-sm">
          <CardHeader>
            <CardTitle>Order Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={orderTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  name="Orders"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  name="Revenue"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="rounded shadow-sm">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orderSummaryData.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    ></div>
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <span className="text-sm font-bold">{item.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Total: <span className="font-bold">{orderSummaryData.reduce((sum, item) => sum + item.count, 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Orders */}
      <Card className="rounded shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Latest Orders</CardTitle>
          <Button variant="outline" size="sm">View All</Button>
        </CardHeader>
        <CardContent>
          {latestOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Order ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Payment ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Items</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {latestOrders.map((order) => (
                    <tr key={order._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium">{order.orderId}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{order.paymentId}</td>
                      <td className="py-3 px-4 text-sm">{order.items}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold">₹{order.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Latest Reviews */}
      <Card className="rounded shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Latest Reviews</CardTitle>
          <Button variant="outline" size="sm">View All</Button>
        </CardHeader>
        <CardContent>
          {latestReviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No reviews yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestReviews.map((review) => (
                <Card key={review._id} className="rounded shadow-sm">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {/* Product info */}
                      <div className="flex gap-3">
                        {review.productImage && (
                          <img
                            src={review.productImage}
                            alt={review.productName}
                            className="h-12 w-12 rounded object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/48?text=Product'
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-semibold line-clamp-1">
                            {review.productName || 'Product'}
                          </p>
                          <p className="text-xs text-gray-500">{review.userName}</p>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Review title */}
                      <div>
                        <p className="text-sm font-semibold">{review.title}</p>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {review.review}
                        </p>
                      </div>

                      {/* Date */}
                      <p className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
