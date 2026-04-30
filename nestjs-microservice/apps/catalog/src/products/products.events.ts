export type ProductCreatedEvent = {
  productId: string;
  name: string;
  description: string;
  status: 'Draft' | 'Active';
  price: number;
  imageUrl?: string;
  createdByClerkUserId: string;
};

export type ProductDeletedEvent = {
  productId: string;
  createdByClerkUserId: string;
  mediaExists: boolean;
};
