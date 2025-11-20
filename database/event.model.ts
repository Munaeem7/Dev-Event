import { Schema, model, models, type Document, type Model } from 'mongoose';

// Event domain shape used across the app
export interface Event {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // Normalized to YYYY-MM-DD
  time: string; // Normalized to HH:mm (24h)
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Event document type
export interface EventDocument extends Event, Document {}

// Generate a URL-friendly slug from the title
const slugifyTitle = (title: string): string =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Normalize a date-like input into YYYY-MM-DD (ISO date-only)
const normalizeDate = (dateInput: string): string => {
  const parsed = new Date(dateInput);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid date format');
  }
  return parsed.toISOString().split('T')[0];
};

// Normalize a time-like input into HH:mm (24-hour)
const normalizeTime = (timeInput: string): string => {
  const trimmed = timeInput.trim();

  // Accept values like HH:mm or HH:mm:ss
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(trimmed);
  let hours: number;
  let minutes: number;

  if (match) {
    hours = Number(match[1]);
    minutes = Number(match[2]);
  } else {
    // Fall back to Date parsing for other valid time strings
    const parsed = new Date(`1970-01-01T${trimmed}`);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error('Invalid time format');
    }
    hours = parsed.getUTCHours();
    minutes = parsed.getUTCMinutes();
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('Invalid time value');
  }

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  return `${hh}:${mm}`;
};

const EventSchema = new Schema<EventDocument>(
  {
    title: { type: String, required: true, trim: true },
    // Slug is generated automatically; uniqueness is enforced via index
    slug: { type: String, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: { type: [String], required: true, default: [] },
    organizer: { type: String, required: true, trim: true },
    tags: { type: [String], required: true, default: [] },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Unique index on slug for fast lookups and to enforce uniqueness
EventSchema.index({ slug: 1 }, { unique: true });

// Validate fields, normalize date/time, and generate slug when title changes
EventSchema.pre<EventDocument>('save', function preSave(next) {
  // Validate that required string fields are present and non-empty
  type RequiredStringKeys =
    | 'title'
    | 'description'
    | 'overview'
    | 'image'
    | 'venue'
    | 'location'
    | 'date'
    | 'time'
    | 'mode'
    | 'audience'
    | 'organizer';

  const requiredStringFields: RequiredStringKeys[] = [
    'title',
    'description',
    'overview',
    'image',
    'venue',
    'location',
    'date',
    'time',
    'mode',
    'audience',
    'organizer',
  ];

  for (const field of requiredStringFields) {
    const value = this[field];
    if (typeof value !== 'string' || value.trim().length === 0) {
      return next(new Error(`Field "${field}" is required and cannot be empty.`));
    }
  }

  // Validate agenda and tags as non-empty string arrays
  const validateStringArray = (fieldName: 'agenda' | 'tags', value: string[]): void => {
    if (!Array.isArray(value) || value.length === 0) {
      throw new Error(`Field "${fieldName}" must be a non-empty array of strings.`);
    }
    for (const item of value) {
      if (typeof item !== 'string' || item.trim().length === 0) {
        throw new Error(`Field "${fieldName}" must contain only non-empty strings.`);
      }
    }
  };

  try {
    validateStringArray('agenda', this.agenda);
    validateStringArray('tags', this.tags);

    // Normalize date and time into consistent formats
    this.date = normalizeDate(this.date);
    this.time = normalizeTime(this.time);

    // Only regenerate the slug when the title has changed or slug is missing
    if (this.isModified('title') || !this.slug) {
      this.slug = slugifyTitle(this.title);
    }
  } catch (error) {
    if (error instanceof Error) {
      return next(error);
    }
    return next(new Error('Event validation failed'));
  }

  return next();
});

export const Event: Model<EventDocument> =
  (models.Event as Model<EventDocument> | undefined) || model<EventDocument>('Event', EventSchema);
