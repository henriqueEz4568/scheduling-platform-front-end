export type Customer = {
  id: string | number;
  name: string;
  email: string;
  phone: string;
};

export type Service = {
  id: string;
  dbId: number;
  name: string;
  duration: number;
  price: number;
  description?: string;
};

export type BookingService = Partial<Service> & {
  user?: {
    id?: string;
    dbId?: number;
    name?: string;
    role?: string;
    email?: string;
    created?: string;
    modified?: string;
    removed?: string | null;
  };
  created?: string;
  modified?: string;
  removed?: string | null;
};

export type BookingCustomer = Partial<Customer> & {
  dbId?: number;
  created?: string;
  modified?: string;
  removed?: string | null;
};

export type BookingFlowStatus = {
  id?: string;
  dbId?: number;
  name?: string;
  created?: string;
  modified?: string;
  removed?: string | null;
};

export type CreatedAppointment = {
  id?: string;
  start?: string;
  end?: string;
  service?: BookingService;
  customer?: BookingCustomer;
  status?: BookingFlowStatus;
  paymentStatus?: BookingFlowStatus;
};

export type ScheduleFormValues = {
  start: string;
  end: string;
  serviceId: string;
  existingCustomerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};
