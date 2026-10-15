import type { CreatedAppointment, Customer } from "@/types/appointments";
import type { CreatedService } from "@/types/services";
import type { AuthUser } from "@/types/user";

const owner = {
  id: "1",
  name: "Usuário Demo",
  email: "demo@schedulepro.dev",
  role: "admin",
};

const customers: Customer[] = [
  { id: "1", name: "Ana Souza", email: "ana.souza@example.com", phone: "(11) 91234-0001" },
  { id: "2", name: "Bruno Lima", email: "bruno.lima@example.com", phone: "(11) 91234-0002" },
  { id: "3", name: "Carla Mendes", email: "carla.mendes@example.com", phone: "(21) 98765-0003" },
  { id: "4", name: "Diego Rocha", email: "diego.rocha@example.com", phone: "(31) 99876-0004" },
  { id: "5", name: "Elisa Martins", email: "elisa.martins@example.com", phone: "(41) 99654-0005" },
];

const services: CreatedService[] = [
  { id: "1", dbId: 1, name: "Corte de cabelo", duration: 30, price: 50, description: "Corte masculino ou feminino", user: owner, created: "2026-10-01T12:00:00.000Z" },
  { id: "2", dbId: 2, name: "Barba", duration: 20, price: 35, description: "Barba com toalha quente", user: owner, created: "2026-10-01T12:00:00.000Z" },
  { id: "3", dbId: 3, name: "Coloração", duration: 90, price: 180, description: "Coloração completa", user: owner, created: "2026-10-01T12:00:00.000Z" },
  { id: "4", dbId: 4, name: "Manicure", duration: 45, price: 40, description: "Mãos com esmaltação", user: owner, created: "2026-10-01T12:00:00.000Z" },
];

const status = (name: string) => ({ id: name, name });

const booking = (
  id: string,
  start: string,
  end: string,
  customer: Customer,
  service: CreatedService,
  statusName: string,
  paymentStatusName: string,
): CreatedAppointment => ({
  id,
  start,
  end,
  customer,
  service: { ...service, description: service.description ?? undefined },
  status: status(statusName),
  paymentStatus: status(paymentStatusName),
});

const [ana, bruno, carla, diego, elisa] = customers;
const [corte, barba, coloracao, manicure] = services;

const bookings: CreatedAppointment[] = [
  booking("1", "2026-10-20T12:00:00.000Z", "2026-10-20T12:30:00.000Z", ana, corte, "confirmed", "paid"),
  booking("2", "2026-10-20T13:00:00.000Z", "2026-10-20T13:20:00.000Z", bruno, barba, "pending", "pending"),
  booking("3", "2026-10-21T14:00:00.000Z", "2026-10-21T15:30:00.000Z", carla, coloracao, "confirmed", "pending"),
  booking("4", "2026-10-21T17:00:00.000Z", "2026-10-21T17:45:00.000Z", diego, manicure, "cancelled", "refunded"),
  booking("5", "2026-10-22T12:30:00.000Z", "2026-10-22T13:00:00.000Z", elisa, corte, "confirmed", "paid"),
  booking("6", "2026-10-23T16:00:00.000Z", "2026-10-23T16:20:00.000Z", ana, barba, "pending", "pending"),
  booking("7", "2026-10-24T13:00:00.000Z", "2026-10-24T13:45:00.000Z", carla, manicure, "cancelled", "pending"),
  booking("8", "2026-10-27T18:00:00.000Z", "2026-10-27T19:30:00.000Z", bruno, coloracao, "confirmed", "paid"),
];

const users: AuthUser[] = [owner];

/** Fresh copy of the fixed values (used once per server process). */
export function createSeed() {
  return structuredClone({ users, customers, services, bookings });
}
