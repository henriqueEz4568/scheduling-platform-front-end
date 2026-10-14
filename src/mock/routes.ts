import type { CreatedAppointment, Customer } from "@/types/appointments";
import type { CreatedService } from "@/types/services";
import { createSeed } from "./data";

type MockDb = ReturnType<typeof createSeed>;
type MockBody = Record<string, unknown>;
type MockRequest = { body: MockBody; params: Record<string, unknown> };
type MockResult = { status: number; data: unknown };

// Shared by every API route and kept across hot reloads; restarting the
// server brings the fixed values back.
const store = globalThis as typeof globalThis & { __mockDb?: MockDb };
const db = (store.__mockDb ??= createSeed());

const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;

const base64url = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");

/** JWT-shaped token (no valid signature) so the route middleware accepts it. */
function createMockToken(userId: string) {
  const exp = Math.floor(Date.now() / 1000) + SEVEN_DAYS_IN_SECONDS;
  return `${base64url({ alg: "none", typ: "JWT" })}.${base64url({ sub: userId, exp })}.mock-signature`;
}

const text = (value: unknown) => (typeof value === "string" ? value : "");
const nextId = (list: unknown[]) => String(list.length + 1);

function login({ body }: MockRequest): MockResult {
  // Any e-mail and password are accepted: this only exists in release mode.
  const email = text(body.email) || "demo@schedulepro.dev";
  const user = db.users.find((item) => item.email === email) ?? {
    id: nextId(db.users),
    name: email.split("@")[0],
    email,
    role: "admin",
  };

  return {
    status: 200,
    data: { success: true, token: createMockToken(user.id), user },
  };
}

function signUp({ body }: MockRequest): MockResult {
  const user = {
    id: nextId(db.users),
    name: text(body.name),
    email: text(body.email),
    role: text(body.role) || "admin",
  };
  db.users.push(user);

  return { status: 201, data: { success: true, user } };
}

function listBookings({ params }: MockRequest): MockResult {
  const page = Math.max(Number(params.page) || 1, 1);
  const limit = Math.max(Number(params.limit) || 10, 1);
  const newestFirst = [...db.bookings].reverse();

  return {
    status: 200,
    data: {
      bookings: newestFirst.slice((page - 1) * limit, page * limit),
      totalRows: db.bookings.length,
      totalPages: Math.max(Math.ceil(db.bookings.length / limit), 1),
    },
  };
}

function createBooking({ body }: MockRequest): MockResult {
  const service = db.services.find((item) => item.id === body.serviceId);
  if (!service) {
    return { status: 404, data: { message: "Serviço não encontrado." } };
  }

  let customer = db.customers.find((item) => String(item.id) === body.customerId);
  if (!customer) {
    const newCustomer = (body.customer ?? {}) as MockBody;
    customer = {
      id: nextId(db.customers),
      name: text(newCustomer.name),
      email: text(newCustomer.email),
      phone: text(newCustomer.phone),
    } satisfies Customer;
    db.customers.push(customer);
  }

  const booking: CreatedAppointment = {
    id: nextId(db.bookings),
    start: text(body.start),
    end: text(body.end),
    customer,
    service: { ...service, description: service.description ?? undefined },
    status: { id: "pending", name: "pending" },
    paymentStatus: { id: "pending", name: "pending" },
  };
  db.bookings.push(booking);

  return { status: 201, data: booking };
}

function createService({ body }: MockRequest): MockResult {
  const id = nextId(db.services);
  const service: CreatedService = {
    id,
    dbId: Number(id),
    name: text(body.name),
    duration: Number(body.duration),
    price: Number(body.price),
    description: text(body.description) || null,
    user: { id: "1", name: "Usuário Demo", email: "demo@schedulepro.dev", role: "admin" },
    created: new Date().toISOString(),
  };
  db.services.push(service);

  return { status: 201, data: service };
}

const routes: Record<string, (request: MockRequest) => MockResult> = {
  "POST /auth/login": login,
  "POST /auth/sign_up": signUp,
  "GET /bookings": listBookings,
  "POST /bookings": createBooking,
  "GET /customers": () => ({ status: 200, data: { customers: db.customers } }),
  "GET /services": () => ({ status: 200, data: { services: db.services } }),
  "POST /services": createService,
};

/** Returns null when the route is not mocked. */
export function handleMockRoute(
  method: string,
  path: string,
  request: MockRequest,
): MockResult | null {
  const handler = routes[`${method} ${path}`];
  return handler ? handler(request) : null;
}
