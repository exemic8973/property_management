import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import DashboardLayout from "@/components/layout/DashboardLayout"

async function getDashboardStats(userRole: string, userId: string) {
  const stats = {
    properties: 0,
    units: 0,
    tenants: 0,
    activeLeases: 0,
    pendingPayments: 0,
    maintenanceRequests: 0,
  }

  if (userRole === "ADMIN") {
    stats.properties = await prisma.property.count()
    stats.units = await prisma.unit.count()
    stats.tenants = await prisma.user.count({ where: { role: "TENANT" } })
    stats.activeLeases = await prisma.lease.count({ where: { status: "ACTIVE" } })
    stats.pendingPayments = await prisma.payment.count({ where: { status: "PENDING" } })
    stats.maintenanceRequests = await prisma.maintenanceRequest.count()
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

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">P</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Properties</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.properties}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">U</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Units</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.units}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">T</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tenants</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.tenants}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">L</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Leases</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.activeLeases}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">$</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Payments</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.pendingPayments}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">M</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Maintenance Requests</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.maintenanceRequests}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
