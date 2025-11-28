"use client";

import React, { useState } from "react";
import { createBooking } from "@/lib/actions/booking.actions";

const BookEvent = ({
  eventId,
  slug,
}: {
  eventId: string;
  slug: string;
}) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { success, error } = await createBooking({ eventId, slug, email });

      if (success) {
        setSubmitted(true);
        // posthog.capture('event-booked', { eventId, slug, email });
      } else {
        console.error("Booking creation failed", error);
        setError(error || "Failed to book event. Please try again.");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }  };

  return (
    <div id="book-event">
      {submitted ? (
        <div className="text-sm text-green-600">
          Thank you for signing up! We'll send you event details shortly.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder="Enter your email address"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
          <button 
            type="submit" 
            className="button-submit w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Booking..." : "Book Now"}
          </button>
        </form>
      )}
    </div>
  );
};

export default BookEvent;