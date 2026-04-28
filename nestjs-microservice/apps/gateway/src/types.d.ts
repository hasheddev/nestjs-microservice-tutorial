declare global {
  namespace Express {
    interface Request {
      user?: {
        clerkUserId: string;
        email: string;
        name: string;
        role: string;
      };
    }
  }
}

export {};
