import { memo } from "react";
import pendingImage from "@/assets/pending.jpg";

function MemoPendingStatusStep() {
  return (
    <div className="max-w-2xl p-8 mx-auto text-center">
      <img
        src={pendingImage}
        alt="Registration Pending"
        className="w-auto mx-auto mb-6 h-72"
      />
      <h2 className="mb-4 text-2xl font-bold">Application in Progress</h2>
      <p className="mb-2 text-gray-600">
        Your WhatzApp Business application is currently under review by Meta.
      </p>
      <p className="mb-2 text-gray-600">
        We'll notify you as soon as your application is approved.
      </p>
      <p className="mb-2 text-gray-600">
        For any queries, our Hipalz consultation team is here to help.
      </p>
      <p className="text-sm text-gray-500">
        Contact us at{" "}
        <a
          href="mailto:info@paltribe.in"
          className="text-blue-500 hover:underline"
        >
          info@paltribe.in
        </a>
      </p>
    </div>
  );
}

const PendingStatusStep = memo(MemoPendingStatusStep);
export default PendingStatusStep;
