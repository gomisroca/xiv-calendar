"use client";

import FullCalendar from "@fullcalendar/react";
import { type EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventWithAttendance } from "@/server/actions/events";
import { redirect } from "next/navigation";

interface CalendarProps {
  slug: string;
  events: EventWithAttendance[];
}

export default function Calendar({ slug, events }: CalendarProps) {
  const fcEvents: EventInput[] = events.map((e) => ({
    id: e.id,
    title: e.name,
    start: e.startsAt,
    end: e.endsAt ?? undefined,
    backgroundColor: "rgba(99, 102, 241, 0.85)", // indigo
    extendedProps: {
      description: e.description,
      location: e.location,
      attendance: e.attendance,
      createdBy: e.createdBy,
    },
  }));

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridWeek"
      firstDay={1}
      height="auto"
      nowIndicator
      navLinks
      events={fcEvents}
      headerToolbar={{
        left: "prev,next",
        center: "title",
        right: "today dayGridMonth,timeGridWeek,timeGridDay",
      }}
      buttonText={{
        today: "Today",
        month: "Month",
        week: "Week",
        day: "Day",
      }}
      eventDisplay="block"
      eventClick={(info) => {
        redirect(`/orgs/${slug}/${info.event.id}`);
      }}
    />
  );
}
