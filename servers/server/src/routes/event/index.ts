import { Event } from "@hi/db-models";
import { eventSchema, updatedEventSchema } from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { pushToken } from "../../services/token";

const eventRouter = new Hono()
  .post(
    "/createDefaults",
    zValidator(
      "json",
      z.object({
        businessId: z.string(),
      }),
    ),
    async (c) => {
      const { businessId } = await c.req.json();
      const defaults = [
        {
          businessId,
          title: "Exclusive Wins",
          heading: "this is heading",
          description: "this is description",
          image: "",
          isActive: true,
        },
        {
          businessId,
          title: "Complimentary Wins",
          heading: "sss",
          description: "sss",
          image: "",
          isActive: false,
        },
        {
          businessId,
          title: "Decoration",
          heading: "ddd",
          description: "ddd",
          image: "",
          isActive: false,
        },
        {
          businessId,
          title: "Games & Activities",
          heading: "ddd",
          description: "ddd",
          image: "",
          isActive: false,
        },
      ];

      await Event.insertMany(defaults);

      return c.json({
        message: "Default sections created",
        data: defaults,
      });
    },
  )
  .post("/addevent", zValidator("json", eventSchema), async (c) => {
    const eventsData = await c.req.json(); // Array of event objects
    const existingEvent = await Event.findOne({
      businessId: eventsData.businessId,
      title: eventsData.title,
    });
    if (existingEvent) {
      return c.json(
        {
          message: "Event with this title already exists",
          err: true,
          data: {},
        },
        409,
      );
    }
    const newEvent = new Event(eventsData);
    await newEvent.save();
    return c.json(
      {
        message: "Events processed",
        err: false,
        data: {
          _id: newEvent._id,
        },
      },
      201,
    );
  })
  .put("/updateevent", zValidator("json", updatedEventSchema), async (c) => {
    const eventData = await c.req.json();
    // Ensure the event belongs to the given businessId
    const existingEvent = await Event.findByIdAndUpdate(
      { _id: eventData.eventId },
      { ...eventData },
      { new: true },
    );
    if (!existingEvent) {
      return c.json(
        {
          message: "Event not found for the given business",
          err: true,
          data: {},
        },
        404,
      );
    }
    return c.json(
      {
        message: "Event updated successfully",
        err: false,
        data: {
          _id: existingEvent._id,
        },
      },
      200,
    );
  })
  .get(
    "/getevents",
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.query();
      const events = await Event.find({ businessId });
      pushToken(c);

      return c.json(
        {
          message: "Events fetched successfully",
          err: false,
          data: events,
        },
        200,
      );
    },
  );

export default eventRouter;
