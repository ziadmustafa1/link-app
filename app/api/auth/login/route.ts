import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

export async function POST(request: Request) {
  try {
    // التأكد من وجود البيانات
    const body = await request.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json(
        { message: 'البيانات المرسلة غير صالحة' },
        { status: 400 }
      );
    }

    // التحقق من صحة البيانات
    const { email, password } = loginSchema.parse(body);

    // البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // التحقق من كلمة المرور
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // إنشاء JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // إعداد الكوكيز
    const response = NextResponse.json(
      { 
        message: 'تم تسجيل الدخول بنجاح',
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        }
      },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'بيانات غير صالحة', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
} 