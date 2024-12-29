'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (formData.username.length < 3) {
      newErrors.username = 'يجب أن يكون اسم المستخدم 3 أحرف على الأقل';
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }
    
    if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // مسح رسالة الخطأ عند الكتابة
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ أثناء التسجيل');
      }

      router.push('/login?registered=true');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'حدث خطأ أثناء التسجيل');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {serverError && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {serverError}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          اسم المستخدم
        </label>
        <Input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={`mt-1 ${errors.username ? 'border-red-500' : ''}`}
          required
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-500">{errors.username}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          البريد الإلكتروني
        </label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
          required
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          كلمة المرور
        </label>
        <Input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`mt-1 ${errors.password ? 'border-red-500' : ''}`}
          required
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          تأكيد كلمة المرور
        </label>
        <Input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`mt-1 ${errors.confirmPassword ? 'border-red-500' : ''}`}
          required
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'جاري التسجيل...' : 'إنشاء حساب'}
      </Button>
    </form>
  );
} 