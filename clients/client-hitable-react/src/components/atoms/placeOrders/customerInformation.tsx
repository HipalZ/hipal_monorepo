import { useOrderStore } from "@/components/store/useOrderData";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { memo, useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Coins, Tag, Ticket, UserPlus } from "lucide-react";
import type {
  ICustomerInformation,
  ITag,
} from "@/components/types/hiClientzData";
import { Button } from "@/components/ui/button";
import AddCustomerModal from "./AddCustomerModal";

const MemoCustomerInformation = () => {
  const { selectedTable } = useOrderStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getCustomerInformation = useCallback(async () => {
    const response = await apiRpc.kot.table_user.$post({
      json: {
        userIds: selectedTable?.userIds || [],
      },
    });
    const res = await response.json();
    return (res?.data as ICustomerInformation[]) ?? [];
  }, [selectedTable]);

  const { isLoading, data, refetch } = useQuery({
    queryKey: ["getCustomerInformation", selectedTable?.userIds],
    queryFn: getCustomerInformation,
    enabled: !!selectedTable?.userIds?.length,
  });

  const handleAddCustomerSuccess = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="w-full mx-auto mt-16 md:mt-[8rem] space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Customer Information
        </h2>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-black"
        >
          <UserPlus className="w-4 h-4" />
          Add Customer
        </Button>
      </div>

      {!data?.length ? (
        <Card className="w-full max-w-md mx-auto mt-4">
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              No customer information available.
            </p>
          </CardContent>
        </Card>
      ) : (
        data?.map((customerInfo: ICustomerInformation, index: number) => {
          const tagMap = getTagCounts(customerInfo?.tagIds ?? []);
          return (
            <Card
              key={customerInfo?._id || index}
              className="overflow-hidden w-[22rem]"
            >
              <CardHeader className="bg-black">
                <CardTitle className="flex items-center justify-between text-white">
                  <span className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {customerInfo?.userId?.name}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    Visits: {customerInfo?.visitCount}
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="mt-4 space-y-4 !px-4">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2 text-purple-600">
                    <Coins className="w-4 h-4" />
                    <span>Coins: {customerInfo?.currentCoins}</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <Ticket className="w-4 h-4" />
                    <span>Coupons: {customerInfo?.couponCount}</span>
                  </div>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                    <Tag className="w-4 h-4" />
                    Tags:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object?.keys(tagMap).length > 0 ? (
                      Object?.entries(tagMap)?.map(([tagName, count]) => (
                        <Badge
                          key={tagName}
                          variant="outline"
                          className="text-xs"
                        >
                          #{tagName} {count > 1 && `x ${count}`}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No tags available.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}

      <AddCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleAddCustomerSuccess}
        tableId={selectedTable?._id || ""}
      />
    </section>
  );
};

const getTagCounts = (tags: ITag[]) => {
  const tagMap: Record<string, number> = {};
  for (const tag of tags) {
    const name = tag.name;
    tagMap[name] = (tagMap[name] || 0) + 1;
  }
  return tagMap;
};

const CustomerInformation = memo(MemoCustomerInformation);
export default CustomerInformation;
