import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
export const authentication = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const bearerToken = req.headers["authorization"];
    if (!bearerToken) {
      return res
        .status(404)
        .send({ status: false, msg: "Token must be present" });
    }

    const tokens = bearerToken.split(" ");
    const accessToken = tokens[1];
    const refreshToken = tokens[2];

    if (!accessToken) {
      return res
        .status(404)
        .send({ status: false, msg: "Access token must be present" });
    }

    const secret = process.env.JWT_SECRET as string;
    console.log("secret", secret);
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is not defined");
    }
    console.log("accessToken", accessToken);
    console.log("refreshToken", refreshToken);

    jwt.verify(accessToken, secret, (error, decodedToken) => {
      if (error) {
        if (error.name === "TokenExpiredError") {
          if (!refreshToken) {
            return res
              .status(404)
              .send({ status: false, msg: "Refresh token must be present" });
          }

          jwt.verify(
            refreshToken,
            secret,
            (refreshError, decodedRefreshToken) => {
              if (refreshError) {
                return res
                  .status(401)
                  .send({ status: false, msg: refreshError.message });
              }

              // Optional: Refresh the access token if needed and send it back to the client
              const newAccessToken = jwt.sign(
                { ...(decodedRefreshToken as object) },
                secret,
                { expiresIn: "3m" }
              );

              // Set the new access token as a cookie
              res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
              });

              next();
            }
          );

          return res.status(401).send({ status: false, msg: error.message });
        } else {
          return res.status(401).send({ status: false, msg: error.message });
        }
      } else {
        // @ts-ignore
        req.user = decodedToken;
        next();
      }
    });
  } catch (error) {
    return res
      .status(500)
      .send({ status: false, msg: (error as Error).message });
  }
};
