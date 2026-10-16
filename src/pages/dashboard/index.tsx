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
import { StatusBadge } from "@/components/status-badge";
import { getAppLayout } from "@/components/app-layout";
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
import { useTranslation } from "@/i18n/use-translation";

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
  const { t } = useTranslation();

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

  const displayName = authUser?.name?.trim() || t("layout.defaultUserName");

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
                {t("dashboard.welcome", { name: displayName })}
              </h2>
              <p className="text-muted-foreground">
                {t("dashboard.subtitle")}
              </p>
            </div>

            {/* Quick Actions + WebSocket Messages */}
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.quickActionsTitle")}</CardTitle>
                <CardDescription>
                  {t("dashboard.quickActionsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-4">
                  <Button className="flex items-center space-x-2" asChild>
                    <Link href="/dashboard/new-appointment">
                      <Plus className="h-4 w-4" />
                      <span>{t("dashboard.newAppointment")}</span>
                    </Link>
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex items-center space-x-2"
                    asChild
                  >
                    <Link href="/dashboard/new-service">
                      <Sparkles className="h-4 w-4" />
                      <span>{t("dashboard.newService")}</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2 bg-transparent"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>{t("dashboard.registerCustomer")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2 bg-transparent"
                    asChild
                  >
                    <Link href="/dashboard/bookings">
                      <FileText className="h-4 w-4" />
                      <span>{t("dashboard.viewBookings")}</span>
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
                    <CardTitle>{t("dashboard.todaysSchedule")}</CardTitle>
                    <CardDescription>December 16, 2024</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {todaysSchedule.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex flex-wrap items-center justify-between gap-2 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
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
                          <StatusBadge
                            status={appointment.status}
                            icon={getStatusIcon(appointment.status)}
                          />
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
                    <CardTitle>{t("dashboard.upcomingTitle")}</CardTitle>
                    <CardDescription>
                      {t("dashboard.upcomingDescription")}
                    </CardDescription>
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

DashboardPage.getLayout = getAppLayout;
