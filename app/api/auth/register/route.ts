import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const registerSchema = z.object({
  username: z.string().min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
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
    const { username, email, password } = registerSchema.parse(body);

    // التحقق من وجود المستخدم
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      },
      select: {
        email: true,
        username: true,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          message: existingUser.email === email 
            ? 'البريد الإلكتروني مستخدم بالفعل' 
            : 'اسم المستخدم مستخدم بالفعل'
        },
        { status: 400 }
      );
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 12);

    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    return NextResponse.json(
      { 
        message: 'تم إنشاء الحساب بنجاح',
        user
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    
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