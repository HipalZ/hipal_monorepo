import { useState, useMemo, useCallback } from "react";
import { useFetchCheckInUsers } from "@/hooks/useCheckIn.ts";
import { useParams } from "react-router-dom";
import HeaderSection from "./header-section";
import FilterControls from "./filter-controls";
import UserCard from "./user-card";
import LoadingSkeleton from "./loading-skeleton";
import EmptyState from "./empty-state";
import ErrorAlert from "./error-alert";
import PasswordDialog from "./password-dialog";

type FilterType = "alphabetical" | "newest" | "oldest" | "descending";

const CheckInUsers = () => {
  const businessId = useParams().businessId;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("newest");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [revealedPhoneNumbers, setRevealedPhoneNumbers] = useState<Set<string>>(
    new Set(),
  );

  const { checkInUsers, isLoadingCheckInUsers, error, refetch } =
    useFetchCheckInUsers({
      businessId,
    });

  const formatTime = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      month: "short",
      day: "numeric",
    });
  }, []);

  const maskPhoneNumber = useCallback((phone: string) => {
    if (phone.length <= 4) return phone;
    const visibleDigits = phone.slice(-4);
    const maskedPart = "*".repeat(phone.length - 4);
    return maskedPart + visibleDigits;
  }, []);

  const filteredAndSortedUsers = useMemo(() => {
    if (!checkInUsers || checkInUsers.length === 0) return [];

    const filtered = checkInUsers.filter(
      (user) =>
        user.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userId.phone.includes(searchTerm),
    );

    return [...filtered].sort((a, b) => {
      switch (filterType) {
        case "alphabetical":
          return a.userId.name.localeCompare(b.userId.name);
        case "newest":
          return b.date - a.date;
        case "oldest":
          return a.date - b.date;
        case "descending":
          return b.userId.name.localeCompare(a.userId.name);
        default:
          return 0;
      }
    });
  }, [checkInUsers, searchTerm, filterType]);

  const handlePasswordSubmit = useCallback(() => {
    if (password === "2701") {
      if (selectedUserId) {
        setRevealedPhoneNumbers((prev) => {
          const newSet = new Set(prev);
          newSet.add(selectedUserId);
          return newSet;
        });
      }
      setIsPasswordDialogOpen(false);
      setPassword("");
      setPasswordError("");
      setSelectedUserId(null);
    } else {
      setPasswordError("Entered wrong password");
      setPassword("");
    }
  }, [password, selectedUserId]);

  const handleRevealPhone = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setIsPasswordDialogOpen(true);
    setPasswordError("");
  }, []);

  const handleHidePhone = useCallback((userId: string) => {
    setRevealedPhoneNumbers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsPasswordDialogOpen(open);
    if (!open) {
      setPassword("");
      setPasswordError("");
      setSelectedUserId(null);
    }
  }, []);

  const handleDialogCancel = useCallback(() => {
    setIsPasswordDialogOpen(false);
    setPassword("");
    setPasswordError("");
    setSelectedUserId(null);
  }, []);

  const emptyStateSearchTerm = useCallback(() => {
    setSearchTerm("");
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleFilterChange = useCallback((value: FilterType) => {
    setFilterType(value);
  }, []);

  return (
    <main>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          <HeaderSection
            filteredCount={filteredAndSortedUsers.length}
            totalCount={checkInUsers.length}
          />

          <FilterControls
            searchTerm={searchTerm}
            filterType={filterType}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
          />

          {error && <ErrorAlert onRetry={refetch} />}

          {isLoadingCheckInUsers ? (
            <LoadingSkeleton />
          ) : filteredAndSortedUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedUsers.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  isPhoneRevealed={revealedPhoneNumbers.has(user.userId._id)}
                  onRevealPhone={handleRevealPhone}
                  onHidePhone={handleHidePhone}
                  formatTime={formatTime}
                  maskPhoneNumber={maskPhoneNumber}
                />
              ))}
              
            </div>
          ) : (
            <EmptyState searchTerm={searchTerm} emptyStateSearchTerm={emptyStateSearchTerm} />
          )}
        </div>
      </div>

      <PasswordDialog
        isOpen={isPasswordDialogOpen}
        password={password}
        passwordError={passwordError}
        onOpenChange={handleDialogOpenChange}
        onPasswordChange={setPassword}
        onSubmit={handlePasswordSubmit}
        onCancel={handleDialogCancel}
      />
    </main>
  );
};

export default CheckInUsers;
