import { memo, useMemo } from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, Calendar, Hash, QrCode, Download, Loader2 } from "lucide-react"
import LoadingSpinner from "@/components/atom/loadingSpinner/index"
import DateRangePicker from "@/components/molecules/dateRangePicker/index"
import usePaginationStore from "@/components/store/usePaginationStore"
import useTimings from "@/components/store/useTimings"
import { useFetchCheckInUsers, useDownloadCheckInCsv } from "@/hooks/useCheckIn"

interface CheckInUser {
  _id: string
  userId: {
    _id: string
    name: string
    phone: string
  }
  businessId: string
  code: string
  date: number
  qrId?: string
}

interface CheckInUserCardProps {
  user: CheckInUser
}

const CheckInUserCard = memo(({ user }: CheckInUserCardProps) => {
  const formattedDate = useMemo(() => {
    return new Date(user.date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }, [user.date])

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-2">
          {/* User Info - Left Side */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">{user.userId.name}</h3>
              {user.qrId && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  <QrCode className="h-3 w-3" />
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{user.userId.phone}</span>
            </div>
          </div>

          {/* Check-in Details - Right Side */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <Hash className="h-3 w-3 text-muted-foreground" />
              <Badge variant="outline" className="h-5 px-1.5 text-xs font-mono">
                {user.code}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

CheckInUserCard.displayName = "CheckInUserCard"

const CheckInUsersList = memo(({ users }: { users: CheckInUser[] }) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No check-in users found for the selected date range.</p>
      </div>
    )
  }

  return (
    <section className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
      {users.map((user) => (
        <CheckInUserCard key={user._id} user={user} />
      ))}
    </section>
  )
})

CheckInUsersList.displayName = "CheckInUsersList"

const SaveAllDataButton = memo(() => {
  const businessId = useParams<{ businessId: string }>().businessId
  const { timeStampStart, timeStampEnd } = useTimings((s) => ({
    timeStampStart: s.timeStampStart,
    timeStampEnd: s.timeStampEnd,
  }))

  const { downloadCheckInCsv, isDownloadingCsv } = useDownloadCheckInCsv()

  const handleSaveAllData = async () => {
    if (!businessId) return

    try {
      await downloadCheckInCsv({
        businessId,
        from: timeStampStart.toString(),
        to: timeStampEnd.toString(),
      })
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  return (
    <Button onClick={handleSaveAllData} disabled={isDownloadingCsv || !businessId} variant="outline" size="sm">
      {isDownloadingCsv ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Save All Data
        </>
      )}
    </Button>
  )
})

SaveAllDataButton.displayName = "SaveAllDataButton"

const MemoCheckInUsers = () => {
  const { pageNumber } = usePaginationStore((s) => ({
    pageNumber: s.pageNumber,
  }))
  const businessId = useParams<{ businessId: string }>().businessId
  const { timeStampStart, timeStampEnd } = useTimings((s) => ({
    timeStampStart: s.timeStampStart,
    timeStampEnd: s.timeStampEnd,
  }))

  const { checkInUsers, isLoadingCheckInUsers } = useFetchCheckInUsers({
    businessId: businessId || "",
    pageNumber: pageNumber.toString(),
    from: timeStampStart.toString(),
    to: timeStampEnd.toString(),
  })

  return (
    <main className="space-y-6">
      <section className="lg:-mt-12">
        <DateRangePicker />
      </section>

      {isLoadingCheckInUsers ? (
        <LoadingSpinner />
      ) : (
        <section className="space-y-6">
          {/* Users List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">Check-in Users</h2>
                <Badge variant="outline" className="text-sm">
                  {checkInUsers?.length || 0} entries
                </Badge>
              </div>
              <SaveAllDataButton />
            </div>

            <CheckInUsersList users={checkInUsers || []} />
          </div>
        </section>
      )}
    </main>
  )
}

const CheckInUsers = memo(MemoCheckInUsers)
export default CheckInUsers
