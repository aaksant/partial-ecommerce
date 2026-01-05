import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";

export interface AuthRequest extends Request {
  user: {
    id: string;
    role: "buyer" | "seller";
    email: string;
  };
}

export interface AuthRequestWithParams<
  P extends ParamsDictionary = ParamsDictionary
> extends AuthRequest {
  params: P;
}

export interface AuthRequestWithBody<T> extends AuthRequest {
  body: T;
}

export interface AuthRequestWithParamsAndBody<
  P extends ParamsDictionary = ParamsDictionary,
  T = any
> extends AuthRequest {
  params: P;
  body: T;
}
