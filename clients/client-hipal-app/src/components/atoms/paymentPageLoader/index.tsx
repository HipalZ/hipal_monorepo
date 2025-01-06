import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export function HeaderSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4">
            <Skeleton className="h-8 w-8 rounded-full bg-gray-800" />
            <Skeleton className="h-4 w-24 bg-gray-800" />
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="flex flex-col items-center gap-2 p-4">
            <Skeleton className="h-16 w-16 rounded-full bg-gray-800" />
            <Skeleton className="h-4 w-20 bg-gray-800" />
        </div>
    );
}

export function AmountSkeleton() {
    return (
        <div className="bg-white rounded-lg p-4">
            <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-32" />
            </div>
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-purple-600/20 rounded-lg p-4 space-y-4">
            <Skeleton className="h-32 w-full bg-purple-600/20" />
            <Skeleton className="h-4 w-24 bg-purple-600/20" />
            <Skeleton className="h-10 w-full bg-yellow-400/50 rounded-full" />
        </div>
    );
}

export function RewardSkeleton() {
    return (
        <div className="space-y-4 p-4">
            <Skeleton className="h-24 w-32 bg-gray-800" />
            <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full bg-gray-800 rounded-lg" />
                <Skeleton className="h-24 w-full bg-gray-800 rounded-lg" />
            </div>
        </div>
    );
}

export function BottomBarSkeleton() {
    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black">
            <div className="flex items-center justify-between max-w-md mx-auto">
                <div className="space-y-1">
                    <Skeleton className="h-3 w-24 bg-gray-800" />
                    <Skeleton className="h-4 w-16 bg-gray-800" />
                </div>
                <Skeleton className="h-10 w-24 bg-gray-800 rounded-full" />
            </div>
        </div>
    );
}