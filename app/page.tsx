import React from "react";
import ExploreBtn from "./components/ExploreBtn";
import EventCard from "./components/EventCard";
import {events} from "@/lib/constants";
import { IEvent } from "@/database/event.model";
import { cacheLife } from "next/cache";


const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const page = async() => {
  'use cache';
  cacheLife('hours');

  const response = await fetch (`${BASE_URL}/api/events`);
  const {events} = await response.json();

  return (
    <section>
      <h1 className="text-center">
        Hub for every event!! <br /> You can't miss
      </h1>

      <p className="text-center mt-5">
        Meetups , conferences , All in one Place
      </p>
      <ExploreBtn />
      <div>
        <h3 className="mt-20 space-y-7">Featured Events</h3>

        <ul className="events list-none">
          {events && events.length > 0 && events.map((e : IEvent) => (
            <li className="" key={e.title}>
              <EventCard {...e} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default page;
