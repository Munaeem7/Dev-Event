import { Schema, model, models, type Document, type Model, type Types } from 'mongoose';
import { Event } from './event.model';

// Booking domain shape used across the app
export interface Booking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Booking document type
export interface BookingDocument extends Booking, Document {}

// Simple, production-friendly email regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<BookingDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Index on eventId for faster queries by event
BookingSchema.index({ eventId: 1 });

// Validate email format and ensure referenced Event exists before saving
BookingSchema.pre<BookingDocument>('save', async function preSave(next) {
  // Email format validation in pre-save for consistent enforcement
  if (typeof this.email !== 'string' || this.email.trim().length === 0) {
    return next(new Error('Email is required and cannot be empty.'));
  }

  if (!emailRegex.test(this.email)) {
    return next(new Error('Email format is invalid.'));
  }

  try {
    const eventExists = await Event.exists({ _id: this.eventId });
    if (!eventExists) {
      return next(new Error('Referenced event does not exist.'));
    }

    return next();
  } catch (error) {
    if (error instanceof Error) {
      return next(error);
    }
    return next(new Error('Booking validation failed'));
  }
});

export const Booking: Model<BookingDocument> =
  (models.Booking as Model<BookingDocument> | undefined) || model<BookingDocument>('Booking', BookingSchema);
