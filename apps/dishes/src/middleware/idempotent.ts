import { Request, Response, NextFunction } from "express";
import { LRUCache } from "lru-cache";

const options = {
  max: 500,
  // for use with tracking overall storage size
  maxSize: 1000,
  // how long to live in ms
  ttl: 15 * 1000,
  sizeCalculation: (value: any) => {
    return 1;
  },
};

const cache = new LRUCache(options);

export const idempotent = (req: Request, res: Response, next: NextFunction) => {
  const idemKey = req.headers["h-idem-id"] as string;
  if (cache.has(idemKey)) {
    const cachedResponse = cache.get(idemKey);
    return res.status(cachedResponse.statusCode).send(cachedResponse.body);
  } else {
    const orginalSend = res.send;
    const originalStatusCode = res.statusCode;
    res.send = function (body: any) {
      if (idemKey) {
        cache.set(idemKey, { body, statusCode: originalStatusCode });
      }
      orginalSend.call(this, body);
    } as any;
  }

  next();
};
