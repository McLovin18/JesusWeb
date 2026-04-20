export type ProductReview = {
  id: string;
  productId: string;
  productName: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: number;
  status: 'pending' | 'approved' | 'rejected';
};
