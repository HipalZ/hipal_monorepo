import dynamic from "next/dynamic";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { memo } from "react";

// Dynamic imports
const BusinessData = dynamic(
	() => import("@/components/templates/businessData"),
	{
		loading: () => (
			<section className="absolute top-1/2 left-1/2">
				<LoadingSpinner />
			</section>
		),
	},
);

const Sales = dynamic(() => import("@/components/templates/sales"), {
	loading: () => (
		<section className="absolute top-1/2 left-1/2">
			<LoadingSpinner />
		</section>
	),
});
const Loyalty = dynamic(() => import("@/components/templates/loyalty"), {
	loading: () => (
		<section className="absolute top-1/2 left-1/2">
			<LoadingSpinner />
		</section>
	),
});
const Items = dynamic(() => import("@/components/templates/items"), {
	loading: () => (
		<section className="absolute top-1/2 left-1/2">
			<LoadingSpinner />
		</section>
	),
});
const Staff = dynamic(() => import("@/components/templates/staff"), {
	loading: () => (
		<section className="absolute top-1/2 left-1/2">
			<LoadingSpinner />
		</section>
	),
});
const Kitchen = dynamic(() => import("@/components/templates/kitchen"), {
	loading: () => (
		<section className="absolute top-1/2 left-1/2">
			<LoadingSpinner />
		</section>
	),
});
const BusinessSettings = dynamic(
	() => import("@/components/templates/settings"),
	{
		loading: () => (
			<section className="absolute top-1/2 left-1/2">
				
				<LoadingSpinner />
			</section>
		),
	},
);
const Analytics = dynamic(() => import("@/components/templates/analytics"), {
	loading: () => (
		<section className="absolute top-1/2 left-1/2">
			<LoadingSpinner />
		</section>
	),
});
const Reports = dynamic(() => import("@/components/templates/reports"), {
	loading: () => (
		<section className="absolute top-1/2 left-1/2">
			<LoadingSpinner />
		</section>
	),
});
const TaxAndCharges = dynamic(
	() => import("@/components/templates/taxesandcharges"),
	{
		loading: () => (
			<section className="absolute top-1/2 left-1/2">
				
				<LoadingSpinner />
			</section>
		),
	},
);
const Swiggy = dynamic(() => import("@/components/templates/swiggy"), {
	loading: () => (
		<section className="absolute top-1/2 left-1/2">
			<LoadingSpinner />
		</section>
	),
});
const Zomato = dynamic(() => import("@/components/templates/zomato"), {
	loading: () => (
		<section className="absolute top-1/2 left-1/2">
			<LoadingSpinner />
		</section>
	),
});

const DineIn = dynamic(() => import("@/components/templates/dinein"), {
	loading: () => (
		<section className="absolute top-1/2 left-1/2">
			<LoadingSpinner />
		</section>
	),
});

const Customerz = dynamic(()=> import("@/components/templates/customerz"), {
	loading: () => (
		<section className="absolute top-1/2 left-1/2">
			<LoadingSpinner />
		</section>
	),
});

const Reviewz = dynamic(()=> import("@/components/templates/reviewz"), {
	loading: () => (
		<section className="absolute top-1/2 left-1/2">
			<LoadingSpinner />
		</section>
	),
});

const Business = () => {
	const { selectedIcon } = useSelectedIcon();
	const Component = () => {
		switch (selectedIcon) {
			case "Home":
				return <BusinessData />;
			case "Sales":
				return <Sales />;
			case "Loyalty":
				return <Loyalty />;
			case "Items":
				return <Items />;
			case "Staff":
				return <Staff />;
			case "Analytics":
				return <Analytics />;
			case "Reports":
				return <Reports />;
			case "Taxes and charges":
				return <TaxAndCharges />;
			case "Kitchen":
				return <Kitchen />;
			case "Swiggy":
				return <Swiggy />;
			case "Settings":
				return <BusinessSettings />;
			case "Zomato":
				return <Zomato />;
			case "Menu":
				return <DineIn />
			case "Customerz":
				return <Customerz />
			case "Reviewz":
				return <Reviewz />
			default:
				return <BusinessData />;
		}
	};

	return <>{Component()}</>;
};

export default memo(Business);
