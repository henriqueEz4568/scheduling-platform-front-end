export type CreateServiceFormValues = {
  name: string;
  duration: string;
  price: string;
  description: string;
};

export type CreatedService = {
  id: string;
  dbId: number;
  name: string;
  duration: number;
  price: number;
  description?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  created: string;
};
