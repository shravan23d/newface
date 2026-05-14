import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail, getUserByFaceDescriptor } from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, faceDescriptor } = body;

    let user;

    if (faceDescriptor && faceDescriptor.length > 0) {
      user = getUserByFaceDescriptor(faceDescriptor);
    } else if (email && password) {
      user = getUserByEmail(email);
      if (user && !(await bcrypt.compare(password, user.password))) {
        user = undefined;
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials or face not recognized' },
        { status: 401 }
      );
    }

    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
