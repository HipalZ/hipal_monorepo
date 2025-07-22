import { memo, useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import MemoizedHeader from "@/components/molecules/header/index";
import {
  useGetAllPasswords,
  useUpdateDiscountPassword,
  useUpdateDeleteKotPassword,
  type Password,
  useUpdateServiceChargePassword,
} from "@/hooks/usePassword";

interface PasswordItemProps {
  password: {
    _id: string;
    name: string;
    password: string;
    isActive: boolean;
  };
  onUpdate: (id: string, newPassword: string, isActive: boolean) => void;
  isUpdating: boolean;
}

const PasswordItem = memo(
  ({ password, onUpdate, isUpdating }: PasswordItemProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(password.password);
    const [editActive, setEditActive] = useState(password.isActive);
    const [error, setError] = useState("");

    const toggleVisibility = useCallback(() => {
      setIsVisible((prev) => !prev);
    }, []);

    const startEditing = useCallback(() => {
      setIsEditing(true);
      setEditValue(password.password);
      setEditActive(password.isActive);
      setError("");
    }, [password.password, password.isActive]);

    const cancelEditing = useCallback(() => {
      setIsEditing(false);
      setEditValue(password.password);
      setEditActive(password.isActive);
      setError("");
    }, [password.password, password.isActive]);

    const validatePassword = useCallback((value: string) => {
      if (value.length === 0) {
        return "Password cannot be empty";
      }
      if (value.length < 4) {
        return "Password must be at least 4 characters";
      }
      if (value.length > 15) {
        return "Password cannot exceed 15 characters";
      }
      return "";
    }, []);

    const handlePasswordChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEditValue(value);
        setError(validatePassword(value));
      },
      [validatePassword],
    );

    const saveChanges = useCallback(async () => {
      const validationError = validatePassword(editValue);
      if (validationError) {
        setError(validationError);
        return;
      }

      try {
        await onUpdate(password._id, editValue, editActive);
        setIsEditing(false);
        setError("");
      } catch (err) {
        setError("Failed to update password");
      }
    }, [editValue, editActive, password._id, onUpdate, validatePassword]);

    const displayPassword = isVisible
      ? password.password
      : "•".repeat(password.password.length);

    // Format the password name for display
    const formatPasswordName = (name: string) => {
      return name
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {formatPasswordName(password.name)}
            </CardTitle>
            <Badge variant={password.isActive ? "default" : "secondary"}>
              {password.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditing ? (
            <>
              <div className="flex items-center gap-2">
                <div className="flex-1 font-mono text-lg tracking-wider bg-muted p-2 rounded">
                  {displayPassword}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleVisibility}
                  className="shrink-0 bg-transparent"
                >
                  {isVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {isVisible ? "Hide password" : "Show password"}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={startEditing}
                  className="shrink-0 bg-transparent"
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="sr-only">Edit password</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`password-${password._id}`}>Password</Label>
                <Input
                  id={`password-${password._id}`}
                  value={editValue}
                  onChange={handlePasswordChange}
                  placeholder="Enter password (4–15 chars)"
                  minLength={4}
                  maxLength={15}
                  className={error ? "border-red-500" : ""}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <p className="text-xs text-muted-foreground">
                  {editValue.length}/15 characters
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id={`active-${password._id}`}
                  checked={editActive}
                  onCheckedChange={setEditActive}
                />
                <Label htmlFor={`active-${password._id}`}>
                  {editActive ? "Active" : "Inactive"}
                </Label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={saveChanges}
                  disabled={isUpdating || !!error}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelEditing}
                  disabled={isUpdating}
                  className="flex-1 bg-transparent"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  },
);

PasswordItem.displayName = "PasswordItem";

const MemoPassword = () => {
  const navigate = useNavigate();
  const businessId = useParams().businessId as string;
  const { isLoading, passwords } = useGetAllPasswords();
  const { updateDiscountPassword, updatingDiscountPassword } =
    useUpdateDiscountPassword();
  const { updateKotPassword, updatingKotPassword } =
    useUpdateDeleteKotPassword();
  const { updateServiceChargePassword, updatingServiceChargePassword } =
    useUpdateServiceChargePassword();

  const goBack = useCallback(() => {
    navigate(`/app/business/${businessId}`);
  }, [navigate, businessId]);

  const handlePasswordUpdate = useCallback(
    async (passwordId: string, newPassword: string, isActive: boolean) => {
      const password = passwords?.find((p) => p._id === passwordId);
      console.log(password);
      if (!password) return;

      if (password.name === "DISCOUNT") {
        await updateDiscountPassword({
          discountPasswordId: passwordId,
          password: newPassword,
          isActive,
        });
      } else if (password.name === "DELETE_KOT") {
        await updateKotPassword({
          deletePasswordId: passwordId,
          password: newPassword,
          isActive,
        });
      } else if (password.name === "SERVICE_CHARGE") {
        await updateServiceChargePassword({
          serviceChargePasswordId: passwordId,
          password: newPassword,
          isActive,
        });
      }
    },
    [
      passwords,
      updateDiscountPassword,
      updateKotPassword,
      updateServiceChargePassword,
    ],
  );

  if (isLoading) {
    return (
      <main>
        <header className="linear_gradient_background">
          <MemoizedHeader title="Password Management" onBack={goBack} />
        </header>
        <div className="container mx-auto p-4 space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main>
      <header className="linear_gradient_background">
        <MemoizedHeader title="Password Management" onBack={goBack} />
      </header>
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {passwords && passwords.length > 0 ? (
            passwords.map((password: Password) => (
              <PasswordItem
                key={password._id}
                password={password}
                onUpdate={handlePasswordUpdate}
                isUpdating={
                  updatingDiscountPassword ||
                  updatingKotPassword ||
                  updatingServiceChargePassword
                }
              />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No passwords found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
};

const PasswordMain = memo(MemoPassword);
export default PasswordMain;
