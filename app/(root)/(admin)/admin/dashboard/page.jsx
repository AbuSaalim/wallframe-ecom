'use client'

import { useState, useEffect } from 'react'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute"
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Search, TrendingUp, Package, Users, ShoppingCart, Star, ArrowUpRight } from 'lucide-react'

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState(null)
  const [latestOrders, setLatestOrders] = useState([])
  const [latestReviews, setLatestReviews] = useState([])
  const [loading, setLoading] = useState(true)

  // Dynamic chart data
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

  // Stat card component
  const StatCard = ({ title, value, icon: Icon, color, increase }) => (
    <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl md:text-3xl font-bold text-gray-900">
            {stats ? (typeof value === 'string' ? stats[value] || 0 : value) : 0}
          </div>
          {increase && (
            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <ArrowUpRight className="h-3 w-3" />
              <span>{increase} from last month</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
        {/* Header */}
        <BreadCrumb breadcrumbData={breadcrumbData} />

        {/* Search Bar */}
        <div className="mt-6 mb-8">
          <Card className="rounded-lg shadow-sm border-0">
            <CardContent className="pt-4 sm:pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders, products, or customers..."
                  className="pl-10 h-10 sm:h-11 text-sm sm:text-base border-gray-200 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
          <StatCard 
            title="Total Categories" 
            value="totalCategories" 
            icon={Package} 
            color="text-blue-500"
            increase="12%"
          />
          <StatCard 
            title="Total Products" 
            value="totalProducts" 
            icon={TrendingUp} 
            color="text-purple-500"
            increase="8%"
          />
          <StatCard 
            title="Total Customers" 
            value="totalCustomers" 
            icon={Users} 
            color="text-green-500"
            increase="15%"
          />
          <StatCard 
            title="Total Orders" 
            value="totalOrders" 
            icon={ShoppingCart} 
            color="text-orange-500"
            increase="23%"
          />
        </div>

        {/* Charts Section - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
          {/* Order Trend Chart */}
          <Card className="lg:col-span-2 rounded-lg shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold">Order Trends</CardTitle>
            </CardHeader>
            <CardContent className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={orderTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    name="Orders"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    name="Revenue"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="rounded-lg shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderSummaryData.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="h-3 w-3 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700 truncate">{item.status}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 ml-2">{item.count}</span>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs sm:text-sm text-gray-600">
                    Total: <span className="font-bold text-gray-900">{orderSummaryData.reduce((sum, item) => sum + item.count, 0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Latest Orders - Responsive Table */}
        <Card className="rounded-lg shadow-sm border-0 mb-8">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-200">
            <CardTitle className="text-base sm:text-lg font-semibold">Latest Orders</CardTitle>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">View All</Button>
          </CardHeader>
          <CardContent className="pt-0">
            {latestOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">No orders yet</p>
            ) : (
              <>
                {/* Mobile Cards */}
                <div className="block md:hidden space-y-3 py-4">
                  {latestOrders.map((order) => (
                    <div key={order._id} className="p-4 border border-gray-200 rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{order.orderId}</p>
                          <p className="text-xs text-gray-500">{order.paymentId}</p>
                        </div>
                        <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{order.items} items</span>
                        <span className="font-semibold text-gray-900">₹{order.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestOrders.map((order) => (
                        <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900">{order.orderId}</td>
                          <td className="py-3 px-4 text-gray-600">{order.paymentId}</td>
                          <td className="py-3 px-4 text-gray-600">{order.items}</td>
                          <td className="py-3 px-4">
                            <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-900 text-right">₹{order.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Latest Reviews - Responsive Grid */}
        <Card className="rounded-lg shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-200">
            <CardTitle className="text-base sm:text-lg font-semibold">Latest Reviews</CardTitle>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">View All</Button>
          </CardHeader>
          <CardContent className="pt-6">
            {latestReviews.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">No reviews yet</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestReviews.map((review) => (
                  <div key={review._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      {/* Product Info */}
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          {review.productImage ? (
                            <img
                              src={review.productImage}
                              alt={review.productName}
                              className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg object-cover bg-gray-100"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/56?text=Product'
                              }}
                            />
                          ) : (
                            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {review.productName || 'Product'}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-1">{review.userName}</p>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Review Content */}
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{review.title}</p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {review.review || 'No review text'}
                        </p>
                      </div>

                      {/* Date */}
                      <p className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
