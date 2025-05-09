"use client";

import { useState } from "react";
import CommonBottomButton from "../atoms/bottomButton/index";
import BookingFlow from "./BookingFlow";

const BookingBottomButton = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  return (
    <div>
      <BookingFlow
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
      <CommonBottomButton
        fixed={true}
        maxWidth="30rem"
        shadow
        buttons={[
          {
            text: "Book Now",
            onClick: () => setIsBookingOpen(true),
          },
        ]}
      />
    </div>
  );
};

export default BookingBottomButton;
