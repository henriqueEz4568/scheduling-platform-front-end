"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Cookies from "js-cookie";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Users,
  Settings,
  FileText,
  Bell,
  Plus,
  UserPlus,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  LogOut,
  Menu,
} from "lucide-react";
import Link from "next/link";

// Mock data
const todaysSchedule = [
  {
    id: 1,
    time: "09:00 AM",
    customer: "John Smith",
    service: "Consultation",
    staff: "Dr. Johnson",
    status: "confirmed",
  },
  {
    id: 2,
    time: "10:30 AM",
    customer: "Sarah Wilson",
    service: "Follow-up",
    staff: "Dr. Johnson",
    status: "in-progress",
  },
  {
    id: 3,
    time: "11:45 AM",
    customer: "Mike Brown",
    service: "Initial Assessment",
    staff: "Dr. Davis",
    status: "pending",
  },
  {
    id: 4,
    time: "02:00 PM",
    customer: "Emily Davis",
    service: "Consultation",
    staff: "Dr. Johnson",
    status: "confirmed",
  },
  {
    id: 5,
    time: "03:30 PM",
    customer: "Robert Taylor",
    service: "Follow-up",
    staff: "Dr. Davis",
    status: "confirmed",
  },
];

const upcomingAppointments = [
  {
    id: 1,
    date: "Tomorrow",
    time: "09:00 AM",
    customer: "Lisa Anderson",
    service: "Consultation",
  },
  {
    id: 2,
    date: "Tomorrow",
    time: "11:00 AM",
    customer: "David Wilson",
    service: "Follow-up",
  },
  {
    id: 3,
    date: "Dec 18",
    time: "10:00 AM",
    customer: "Maria Garcia",
    service: "Initial Assessment",
  },
  {
    id: 4,
    date: "Dec 18",
    time: "02:30 PM",
    customer: "James Miller",
    service: "Consultation",
  },
  {
    id: 5,
    date: "Dec 19",
    time: "09:30 AM",
    customer: "Anna Johnson",
    service: "Follow-up",
  },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const token = Cookies.get("token");
  const userId = "123"; // Substitua pelo ID do usuário real do login
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
      auth: {
        token,
      },
    });

    setSocket(s);

    s.on("ping", (data) => {
      setMessages((prev) => [data, ...prev]);
      console.log("Mensagem recebida:", data);
    });

    return () => {
      s.disconnect();
    };
  }, [userId, token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "in-progress":
        return <Clock className="h-4 w-4" />;
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="bg-primary rounded-lg p-2">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">SchedulePro</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {messages.length}
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/placeholder.svg?height=32&width=32"
                      alt="User"
                    />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      john@schedulepro.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => (window.location.href = "/")}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`bg-card border-r border-border w-64 min-h-screen transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static z-40`}
        >
          <nav className="p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/dashboard">
                <Calendar className="mr-2 h-4 w-4" />
                Appointments
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Customers
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Services
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              Reports
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:ml-0">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Header */}
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                Welcome back, John!
              </h2>
              <p className="text-muted-foreground">
                Heres whats happening with your schedule today.
              </p>
            </div>

            {/* Quick Actions + WebSocket Messages */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Manage your schedule efficiently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-4">
                  <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>New Appointment</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2 bg-transparent"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Register Customer</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2 bg-transparent"
                  >
                    <FileText className="h-4 w-4" />
                    <span>View Reports</span>
                  </Button>
                </div>

                {messages.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-foreground mb-2">
                      Notifications:
                    </h3>
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className="p-2 border border-border rounded-lg bg-muted/20"
                      >
                        {JSON.stringify(msg)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Todays Schedule</CardTitle>
                    <CardDescription>December 16, 2024</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {todaysSchedule.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="text-sm font-medium text-muted-foreground min-w-[80px]">
                              {appointment.time}
                            </div>
                            <div>
                              <div className="font-medium">
                                {appointment.customer}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {appointment.service} • {appointment.staff}
                              </div>
                            </div>
                          </div>
                          <Badge
                            className={`${getStatusColor(
                              appointment.status
                            )} flex items-center space-x-1`}
                          >
                            {getStatusIcon(appointment.status)}
                            <span className="capitalize">
                              {appointment.status}
                            </span>
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Appointments */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Next 5 bookings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upcomingAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="font-medium text-sm">
                              {appointment.customer}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {appointment.date}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.time} • {appointment.service}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
