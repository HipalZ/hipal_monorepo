import { lazy, Suspense } from "react";

const AddTax = lazy(() => import("@/components/templates/tax/AddTax.tsx"));

const AddTaxPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddTax />
    </Suspense>
  );
};

export default AddTaxPage;