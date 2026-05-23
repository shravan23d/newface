import { NextRequest, NextResponse } from 'next/server';
import { findFaceMatch, getEmergencyByUserId } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { faceDescriptor } = body;

    if (!faceDescriptor || faceDescriptor.length === 0) {
      return NextResponse.json(
        { error: 'Face descriptor is required' },
        { status: 400 }
      );
    }

    const match = findFaceMatch(faceDescriptor);

    if (!match) {
      return NextResponse.json(
        { error: 'Face is not registered or match is not confident enough' },
        { status: 404 }
      );
    }

    const user = match.user;
    const emergencyDetails = getEmergencyByUserId(user.id);

    return NextResponse.json({
      user: {
        name: user.name,
        phone: user.phone,
      },
      emergencyDetails: emergencyDetails || null,
      match: {
        confidence: match.confidence,
        distance: Number(match.distance.toFixed(4)),
      },
    });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
