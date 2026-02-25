import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import ModernDashboardLayout from "@/components/layout/ModernDashboardLayout"
import { 
  BuildingOfficeIcon, 
  HomeIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  SparklesIcon
} from "@heroicons/react/24/outline"

async function getDashboardStats(userRole: string, userId: string) {
  const stats = {
    properties: 0,
    units: 0,
    tenants: 0,
    activeLeases: 0,
    pendingPayments: 0,
    maintenanceRequests: 0,
    totalRevenue: 0,
    occupancyRate: 0,
  }

  if (userRole === "ADMIN") {
    stats.properties = await prisma.property.count()
    stats.units = await prisma.unit.count()
    stats.tenants = await prisma.user.count({ where: { role: "TENANT" } })
    stats.activeLeases = await prisma.lease.count({ where: { status: "ACTIVE" } })
    stats.pendingPayments = await prisma.payment.count({ where: { status: "PENDING" } })
    stats.maintenanceRequests = await prisma.maintenanceRequest.count()
    
    const occupiedUnits = await prisma.unit.count({ where: { isOccupied: true } })
    stats.occupancyRate = stats.units > 0 ? Math.round((occupiedUnits / stats.units) * 100) : 0
    
    const totalRent = await prisma.lease.aggregate({
      where: { status: "ACTIVE" },
      _sum: { monthlyRent: true }
    })
    stats.totalRevenue = totalRent._sum.monthlyRent || 0
  } else if (userRole === "EMPLOYEE") {
    stats.properties = await prisma.property.count({
      where: {
        employees: {
          some: {
            employee: {
              id: userId,
            },
          },
        },
      },
    })
    stats.units = await prisma.unit.count({
      where: {
        property: {
          employees: {
            some: {
              employee: {
                id: userId,
              },
            },
          },
        },
      },
    })
    stats.activeLeases = await prisma.lease.count({
      where: {
        unit: {
          property: {
            employees: {
              some: {
                employee: {
                  id: userId,
                },
              },
            },
          },
        },
        status: "ACTIVE",
      },
    })
    stats.pendingPayments = await prisma.payment.count({
      where: {
        lease: {
          unit: {
            property: {
              employees: {
                some: {
                  employee: {
                    id: userId,
                  },
                },
              },
            },
          },
        },
        status: "PENDING",
      },
    })
    stats.maintenanceRequests = await prisma.maintenanceRequest.count({
      where: {
        unit: {
          property: {
            employees: {
              some: {
                employee: {
                  id: userId,
                },
              },
            },
          },
        },
      },
    })
    
    const occupiedUnits = await prisma.unit.count({
      where: {
        isOccupied: true,
        property: {
          employees: {
            some: {
              employee: {
                id: userId,
              },
            },
          },
        },
      },
    })
    stats.occupancyRate = stats.units > 0 ? Math.round((occupiedUnits / stats.units) * 100) : 0
    
    const totalRent = await prisma.lease.aggregate({
      where: {
        status: "ACTIVE",
        unit: {
          property: {
            employees: {
              some: {
                employee: {
                  id: userId,
                },
              },
            },
          },
        },
      },
      _sum: { monthlyRent: true }
    })
    stats.totalRevenue = totalRent._sum.monthlyRent || 0
  } else if (userRole === "TENANT") {
    stats.activeLeases = await prisma.lease.count({
      where: {
        tenantId: userId,
        status: "ACTIVE",
      },
    })
    stats.pendingPayments = await prisma.payment.count({
      where: {
        lease: {
          tenantId: userId,
        },
        status: "PENDING",
      },
    })
    stats.maintenanceRequests = await prisma.maintenanceRequest.count({
      where: {
        tenantId: userId,
      },
    })
  }

  return stats
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const stats = await getDashboardStats(session.user.role, session.user.id)

  const statCards = [
    {
      title: "Properties",
      value: stats.properties,
      icon: BuildingOfficeIcon,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Units",
      value: stats.units,
      icon: HomeIcon,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      title: "Tenants",
      value: stats.tenants,
      icon: UserGroupIcon,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Active Leases",
      value: stats.activeLeases,
      icon: DocumentTextIcon,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments,
      icon: CurrencyDollarIcon,
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      title: "Maintenance",
      value: stats.maintenanceRequests,
      icon: WrenchScrewdriverIcon,
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
  ]

  return (
    <ModernDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="mt-2 text-gray-600">Here's what's happening with your properties today</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button className="btn-secondary">
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Export Report
            </button>
            <button className="btn-primary">
              <SparklesIcon className="w-5 h-5 mr-2" />
              Quick Actions
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">12% from last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue and Occupancy */}
        {(session.user.role === "ADMIN" || session.user.role === "EMPLOYEE") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue</h3>
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <CurrencyDollarIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">This month</span>
                  <span className="text-green-600 font-medium">+8.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Occupancy Rate</h3>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <HomeIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.occupancyRate}%</p>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Occupied units</span>
                  <span className="text-blue-600 font-medium">{stats.units > 0 ? Math.round(stats.units * stats.occupancyRate / 100) : 0} / {stats.units}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full" style={{ width: `${stats.occupancyRate}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="glass-morphism rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-lg transition-all duration-300 group">
              <BuildingOfficeIcon className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-900">Add Property</p>
            </button>
            <button className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl hover:shadow-lg transition-all duration-300 group">
              <UserGroupIcon className="w-8 h-8 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-900">Add Tenant</p>
            </button>
            <button className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow-lg transition-all duration-300 group">
              <DocumentTextIcon className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-900">Create Lease</p>
            </button>
            <button className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl hover:shadow-lg transition-all duration-300 group">
              <WrenchScrewdriverIcon className="w-8 h-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-900">Maintenance</p>
            </button>
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
