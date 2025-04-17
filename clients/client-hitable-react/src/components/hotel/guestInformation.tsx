import { memo } from "react";
import { User } from "lucide-react";

interface GuestData {
    _id?: string;
    name?: string;
    phone?: string;
    source?: string;
}

const MemoGuestInformation = ({ guests }: { guests: GuestData[] }) => {
    return (
        <div className="space-y-3 border p-3 rounded-lg bg-white">
            <h1 className="text-sm font-medium text-black">
                <span className="inline-flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Guest Information
                </span>
            </h1>

            {guests && guests.length > 0 ? (
                guests.map((guest) => (
                    <div
                        key={guest._id}
                        className="pl-1 space-y-2 border-t pt-2 first:border-t-0 first:pt-0"
                    >
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Name:</span>
                            <span className="font-medium">{guest.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Phone:</span>
                            <span className="font-medium">{guest.phone}</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-sm text-gray-500 italic">
                    No guest information available
                </div>
            )}
        </div>
    );
};

const GuestInformation = memo(MemoGuestInformation);
export default GuestInformation;
