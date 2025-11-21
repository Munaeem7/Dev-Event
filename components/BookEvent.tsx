'use client'

import React, { useState } from "react";


const BookEvent = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e : React.FormEvent) => {
    e.preventDefault();

    setTimeout(() => {
        setSubmitted(true);
    } , 1000)
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
            <button type="submit" className="button-submit">Submit</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BookEvent;
