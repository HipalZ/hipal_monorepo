import type { ReactNode } from "react";
import { useRoutes } from "react-router-dom";
import routes from "~react-pages";
//testing/

export default function MainRouter() {
  return <div>{useRoutes(routes) as ReactNode}</div>;
}
