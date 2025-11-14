// src/components/molecules/staff/StaffWizard/StaffDetailsStep.tsx
import { useAddStaffStore } from '@/components/store/useAddStaffStore';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

const StaffDetailsStepComponent = () => {
  const name = useAddStaffStore((s) => s.name);
  const phone = useAddStaffStore((s) => s.phone);
  const password = useAddStaffStore((s) => s.password);
  const setName = useAddStaffStore((s) => s.setName);
  const setPhone = useAddStaffStore((s) => s.setPhone);
  const setPassword = useAddStaffStore((s) => s.setPassword);
  const selectedRole = useAddStaffStore((s) => s.selectedRole);
  const isEditing = useAddStaffStore((s) => s.isEditing);

  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = useCallback(() => setShowPassword((prev) => !prev), []);

  return (
    <section className="mx-4 pb-[7rem] md:mx-0">
      <header className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-semibold">{isEditing ? 'Edit Staff Details' : 'Staff Details'}</h1>
        {selectedRole ? (
          <Badge variant="outline" className="text-xs md:text-sm">
            Role: {selectedRole}
          </Badge>
        ) : null}
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Staff Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              disabled={isEditing}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter staff name"
              maxLength={20}
              required
            />
            <Input
              type="tel"
              disabled={isEditing}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              maxLength={10}
              required
            />
            {!isEditing && (
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  minLength={4}
                  maxLength={4}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEditing ? 'New 4-digit PIN (optional)' : 'Enter 4-digit PIN'}
                />
                <button type="button" className="absolute inset-y-0 right-3 flex items-center text-gray-600" onClick={togglePassword}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2 text-sm">
            <p>• Phone is used as login username.</p>
            <p>• 4-digit PIN is used to login on POS / Captain app.</p>
            <p>• Role + Permissions decide what all this staff can do.</p>
            {isEditing && <p>• Leave PIN empty to keep the current password unchanged.</p>}
          </CardContent>
        </Card>
      </section>
    </section>
  );
};

export const StaffDetailsStep = memo(StaffDetailsStepComponent);
