import Loader from '@/components/atom/loader';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, Suspense } from 'react';
import { useLocation, useRoutes } from 'react-router-dom';
import routes from '~react-pages';
//testing
export default function MainRouter() {
  const location = useLocation();
  const element = useRoutes(routes) as ReactNode;

  const variants = {
    initial: {
      x: '100%',
    },
    animate: {
      x: 0,
    },
    exit: {
      x: '-100%',
    },
  };

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        {element}
      </motion.div>
    </AnimatePresence>
  );
}
