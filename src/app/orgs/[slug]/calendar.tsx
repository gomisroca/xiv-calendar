"use client";

import FullCalendar from "@fullcalendar/react";
import { type EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventWithAttendance } from "@/server/actions/events";

interface CalendarProps {
  events: EventWithAttendance[];
}

export default function Calendar({ events }: CalendarProps) {
  const fcEvents: EventInput[] = events.map((e) => ({
    id: e.id,
    title: e.name,
    start: e.startsAt,
    end: e.endsAt ?? undefined,
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
      events={fcEvents}
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      }}
      eventClick={(info) => {
        const { title, extendedProps } = info.event;
        alert(
          `Event: ${title}\nLocation: ${extendedProps.location}\nDescription: ${extendedProps.description}`,
        );
      }}
    />
  );
}
