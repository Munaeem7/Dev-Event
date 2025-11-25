"use client";

import React, { useState } from "react";
import { createBooking } from "@/lib/actions/booking.actions";

const BookEvent = async ({
  eventId,
  slug,
}: {
  eventId: string;
  slug: string;
}) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    const { success, error } = await createBooking({ eventId, slug, email });

    if (success) {
      setSubmitted(true);
      posthog.capture('event-booked' , {eventId , slug , email})
    } else {
      console.error("Booking creation failed ", error);
      posthog.captureException(error)
    }

    e.preventDefault();

    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm ">Thank you for signing up</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email Address"></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder="Enter Your email Address"
            />
            <button type="submit" className="button-submit">
              Submit
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BookEvent;
