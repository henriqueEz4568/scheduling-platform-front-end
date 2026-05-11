"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { AuthUser } from "@/types/user";

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
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const persistedUser = localStorage.getItem("auth_user");
    if (!persistedUser) {
      setAuthUser(null);
      return;
    }

    try {
      setAuthUser(JSON.parse(persistedUser) as AuthUser);
    } catch {
      setAuthUser(null);
    }
  }, []);

  const displayName = authUser?.name?.trim() || "Usuario";

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
    <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Header */}
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                Welcome back, {displayName}!
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
                  <Button className="flex items-center space-x-2" asChild>
                    <Link href="/dashboard/new-appointment">
                      <Plus className="h-4 w-4" />
                      <span>New Appointment</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2 bg-transparent"
                    asChild
                  >
                    <Link href="/dashboard/new-service">
                      <Sparkles className="h-4 w-4" />
                      <span>New Service</span>
                    </Link>
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
                    asChild
                  >
                    <Link href="/dashboard/bookings">
                      <FileText className="h-4 w-4" />
                      <span>View Bookings</span>
                    </Link>
                  </Button>
                </div>
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
    </div>
  );
}
