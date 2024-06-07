import { useRoutes } from 'react-router-dom';
import routes from '~react-pages';
import { ReactNode } from 'react';


export default function MainRouter() {
    return <div>{useRoutes(routes) as ReactNode}</div>;
  }