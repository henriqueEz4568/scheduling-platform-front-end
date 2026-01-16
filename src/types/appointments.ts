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

export type ScheduleFormValues = {
  start: string;
  end: string;
  serviceId: string;
  existingCustomerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};
