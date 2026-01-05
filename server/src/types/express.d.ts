declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        role: "buyer" | "seller";
        email: string;
      };
    }
    interface Multer {
      File: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number; // varchar in schema
        buffer: Buffer;
      };
    }
  }
}

export {};
