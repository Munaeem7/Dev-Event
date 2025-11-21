import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import  Event from '@/database/event.model';

type RouteParams = {
  params: {
    slug: string;
  };
};

// Basic slug format guard (lowercase words separated by dashes)
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * GET /api/events/[slug]
 * Returns a single event by its slug.
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { slug } = await params;

  // Validate presence and basic format of slug
  if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
    return NextResponse.json(
      { error: 'Slug is required.' },
      { status: 400 }
    );
  }

  if (!slugPattern.test(slug)) {
    return NextResponse.json(
      { error: 'Slug format is invalid.' },
      { status: 400 }
    );
  }

  try {
    // Ensure database connection is established
    await connectDB();

    // Use lean() to return a plain object instead of a Mongoose document
    const event = await Event.findOne({ slug }).lean();

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { data: event },
      { status: 200 }
    );
  } catch (error) {
    // Log error server-side if you have logging in place
    return NextResponse.json(
      { error: 'Unexpected server error.' },
      { status: 500 }
    );
  }
}