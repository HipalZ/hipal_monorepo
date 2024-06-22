import { ReactNode, Suspense } from 'react';
import { useRoutes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import routes from '~react-pages';
import Loader from '@/components/atom/loader';

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
        <Suspense fallback={<Loader />}>
          {element}
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}
