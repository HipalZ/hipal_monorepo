import { ReactNode } from 'react';
import { useRoutes } from 'react-router-dom';
import routes from '~react-pages';

export default function MainRouter() {
  return <div>{useRoutes(routes) as ReactNode}</div>;
}
