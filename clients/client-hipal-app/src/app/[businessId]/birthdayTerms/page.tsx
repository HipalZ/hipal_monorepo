import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import type { IBusinessData, IOutlet } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { Suspense } from "react";
import BirthdayTerm from "@/components/atoms/birthdayTerms";

export const revalidate = 300;

export async function generateMetadata({
    params,
}: {
    params: { businessId: string };
}) {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    const { businessId } = params;

    let bId = businessId;

    if (!objectIdRegex.test(businessId)) {
        const res = await apiRpc.businesses.n[":customLink"].$get({
            param: { customLink: businessId },
        });

        const response = (await res.json()) as {
            data: IBusinessData;
            message: string;
            error: boolean;
        };

        bId = response?.data?.businessId;

        if (!bId) {
            return {
                title: "Birthday Terms",
                description: "Birthday Terms for businesses",
            };
        }
    }

    try {
        const data = await apiRpc.businesses.outletInfo[":businessId"].$get({
            param: { businessId: bId },
        });
        const json = await data.json();
        const outletInfo = json?.data as IOutlet;

        if (!outletInfo?.name) {
            return {
                title: "Birthday Terms",
                description: "Birthday Terms for businesses",
            };
        }

        const { name, description, logoUrl } = outletInfo;
        const metaDescription = description || "Birthday Terms our business offerings!";

        return {
            title: name,
            description: metaDescription,
            openGraph: {
                title: name,
                description: metaDescription,
                images: [
                    {
                        url: logoUrl || "https://example.com/fallback-image.jpg",
                        width: 1200,
                        height: 630,
                        alt: name,
                    },
                ],
                type: "website",
            },
        };
    } catch (error) {
        return {
            title: "Birthday Terms",
            description: "Birthday Terms for businesses",
        };
    }
}

export default async function BirthdayTerms() {
    return (
        <Suspense fallback={<SkeletonLoader height={200} />}>
            <BirthdayTerm />
        </Suspense>
    );
}
