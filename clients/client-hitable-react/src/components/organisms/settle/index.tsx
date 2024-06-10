import DayOutPopup from "@/components/atoms/dayoutPopup";
import ApplyDiscount from "@/components/atoms/discountPassword";
import MiddlePopUp from "@/components/atoms/middlePopUp";
import SplitPaymentModal from "@/components/atoms/splitPaymentModule";
import AvailedCoins from "@/components/molecules/availedCoins";
import { playSound } from "@/components/molecules/loyaltyCoinsUsage";
import { useBillStore } from "@/components/store/useBillStore";
import { useBusinessStore } from "@/components/store/useBusinessData";
import useDiscountStore from "@/components/store/useDiscountStore";
import { useLogin } from "@/components/store/useLogin";
import { useLoyaltyStore } from "@/components/store/useLoyaltyData";
import { useTable } from "@/components/store/useTable";
import { paths } from "@/components/utils/paths";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import type React from "react";
import {
	Suspense,
	lazy,
	memo,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { BiPlus } from "react-icons/bi";
import { ImPrinter } from "react-icons/im";
import { MdOutlineReceiptLong } from "react-icons/md";
import { FaRupeeSign } from "react-icons/fa";
import { toast } from "react-toastify";
import RemoveServiceTax from "@/components/atoms/removeServiceTax";
import { HiX } from "react-icons/hi";
import { useCart } from "@/components/store/useCart";
import { usePaymentMethodsStore } from "@/components/store/useModesData";
import Loader from "@/components/atoms/loader";
import type {
	DishDetails,
	IFinalBill,
	ILoyaltyUser,
	SettlePageTypes,
	User,
} from "./type";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/components/utils/axios";
import { Link, useNavigate, useParams } from "react-router-dom";

const DiscountComponent = lazy(() => import("../discount"));

const MobileNumberForCoinz = lazy(() => import("../hicoins"));

const SplitPaymentSelector = lazy(() => import("../splitPayment"));

const PaymentModeSelector = lazy(() => import("../paymentModeSelector"));
const DuesUserSelector = lazy(() => import("../dues"));
const PrintBillComponent = lazy(() => import("../printBill"));
const EBillComponent = lazy(() => import("../eBill"));
const AddTipComponent = lazy(() => import("../AddTip"));
const ClaimCoinzSelector = lazy(() => import("../claimCoinZ"));

const LoyaltyCoinzUsage = lazy(() => import("../loyaltyCoinz"));
const BillDetails = lazy(() => import("../billDetails"));
const TotalBill = lazy(() => import("../totalBill"));

interface POSProps {
	activeButton: string;
}

const Settle: React.FC<POSProps> = ({ activeButton }) => {
	const { billData, setBillData } = useBillStore();
	const [updatedBillData, setUpdatedBillData] = useState<IFinalBill>({
		subTotal: 0,
		Total: 0,
		discount: 0,
		CGST: 0,
		SGST: 0,
		businessName: "",
		claimedAmount: 0,
		serviceCharge: 0,
		tips: 0,
		customerName: "",
		duesPersonId: "",
		customerPhone: "",
		coinsGivenBy: "",
		discountGivenBy: "",
		discountRemovedBy: "",
		itemAddedby: "",
		kickedOutBy: "",
		mergedBy: "",
		serviceChargeAddedBy: "",
		serviceChargeRemovedBy: "",
		switchedBy: "",
		tipsGivenBy: "",
		transferBy: "",
	});
	const prevBillDataRef = useRef<IFinalBill>(updatedBillData);
	const retryCount = useRef(0);
	const loyaltyId = useLoyaltyStore((s) => s.loyaltyId);
	const claim = useLoyaltyStore((s) => s.setClaimAmount);
	const businessName = useLogin((s) => s.businessName);
	const reward = useLoyaltyStore((s) => s.setReward);
	const [loading, setLoading] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isMiddle, setIsMiddle] = useState(false);
	const [isUserModalOpen, setIsUserModalOpen] = useState(false);
	const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
	const [users, setUsers] = useState<User[]>([]);
	const { discount, setDiscount } = useDiscountStore();
	const [discountMode, setDiscountMode] = useState("percent");
	const [discountValue, setDiscountValue] = useState(0);
	const [footButton, setFootButton] = useState<SettlePageTypes>("");
	const [settleError, setSettleError] = useState<boolean>(false);
	const navigate = useNavigate();
	const zone = useLogin((s) => s.selectedZone);
	const {
		selectedPaymentMethod,
		setSelectedPaymentMethod,
		multiplePaymentMethods,
		setMultiplePaymentMethods,
		duesPersons,
		setDuesPersons,
		selectedPerson,
		setSelectedPerson,
		discountDescription,
		setDiscountDescription,
	} = useDiscountStore();
	const [tip, setTip] = useState(0);
	const { paymentMethods, lastUpdated, setPaymentMethods } =
		usePaymentMethodsStore();
	const grouped_customers = useLogin((s) => s.grouped_customers);
	const tableData = useTable((s) => s.tableData);
	const setTableData = useTable((s) => s.setTableData);
	const params = useParams<{ businessId: string; zoneId: string,tableId:string }>();
	const { businessId, zoneId,tableId } = params;
	const clearCartForTable = useCart((s) => s.clearCartForTable);
	const [newPhoneNumber, setNewPhoneNumber] = useState<string>("");
	const [selectedPhoneNumbers, setSelectedPhoneNumbers] = useState<any>([]);
	const { businessData } = useBusinessStore();
	const userData = useLogin((s) => s.userDetails);
	const [isCoinzModalOpen, setIsCoinzModalOpen] = useState(false);
	const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
	const [redeemCoins, setRedeemCoins] = useState(false);
	const [cvv, setCvv] = useState("");
	const [coinsToRedeem, setCoinsToRedeem] = useState(0);
	const [userDetails, setUserDetails] = useState<ILoyaltyUser | null>(null);
	const [selectedUser, setSelectedUser] = useState<string | null>(null);
	const [enteredAmount, setEnteredAmount] = useState(0);
	const [isFabOpen, setIsFabOpen] = useState(false);
	const fabRef = useRef<null | HTMLDivElement>(null);
	const handleAmountChange = (event:Event) => {
		const enteredValue = Number.parseInt((event.target as HTMLInputElement).value, 10);
		setEnteredAmount(enteredValue);
	};
	const handleUpdateBillData = (newValues: Partial<IFinalBill>) => {
		prevBillDataRef.current = updatedBillData;
		setUpdatedBillData((prevValues) => ({
			...prevValues,
			...newValues,
		}));
	};
	const finalBillAmount = updatedBillData?.Total;
	const changeToGiveBack = enteredAmount - finalBillAmount;
	const maxClaimableByBill = (updatedBillData?.subTotal || 0) * (claim / 100);
	const maxCoinsUserHas = userDetails?.rewards || 0;
	const maxClaimableAmount = Math.min(maxClaimableByBill, maxCoinsUserHas);
	const items = useMemo(() => {
		const result: DishDetails[] = [];
		if (billData) {
			const newBill = billData;
			for (let i = 0; i < newBill.length; i++) {
				const newObj: DishDetails = {};

				const dish = newBill[i].dish;
				if (dish) {
					newObj.name = dish.name;
					newObj.qty = dish.qty;
					newObj.price = dish.price;
					newObj.portions = dish.portions;
					newObj.extras = dish.extras;
					result.push(newObj);
				}
			}

			for (const item of result) {
				let price = 0;

				if (item?.portions?.price) {
					price = Number.parseInt(item.portions.price) * (item?.qty || 0);
				} else {
					price = item?.price || 0;
				}

				let extrasPrice = 0;
				if (item?.extras?.length) {
					for (const extra of item.extras!) {
						extrasPrice +=
							(Number.parseInt(extra.price || "0") || 0) * (extra.qty || 0);
					}
				}

				item.price = price + extrasPrice;
			}
		}
		return result;
	}, [billData]);

	const toggleFab = () => {
		setIsFabOpen(!isFabOpen);
	};

	useEffect(() => {
		const handleClickOutside = (event:Event) => {
			if (fabRef.current && !fabRef?.current?.contains(event.target as HTMLInputElement)) {
				setIsFabOpen(false);
			}
		};

		document.addEventListener("touchstart", handleClickOutside);
		return () => {
			document.removeEventListener("touchstart", handleClickOutside);
		};
	}, []);

	const updatedGetBill = async () => {
		try {
			const hasServiceCharge = businessData?.serviceCharge;
			const serviceChargePercentage = businessData?.serviceChargePercentage;
			const gstPercentage = businessData?.gstPercentage;

			const response = await axiosInstance.get(
				`/v1/kitchens/:id/temp-bill?tableId=${tableId}&hasServiceCharge=${hasServiceCharge}&serviceChargePercentage=${serviceChargePercentage}&gstPercentage=${gstPercentage}`,
			);
			setUpdatedBillData(response.data[response.data.length - 1]);
			setBillData(response.data.slice(0, response.data.length - 1));
			return response.data;
		} catch (error) {
			toast.error("Error fetching bill");
		}
	};

	const handlePhoneNumberChange = async (event:Event) => {
		const phoneNumber = (event.target as HTMLInputElement).value;

		if (phoneNumber.length === 10) {
			try {
				const staffResponse = await axiosInstance.get(`/v1/users/${businessId}`);
				const staffMembers = staffResponse.data;

				const isStaffMember = staffMembers.some(
					(staff:any) => staff.phone === phoneNumber,
				);
				if (isStaffMember) {
					toast.error("Can't give hi-coinz to staff");
				} else {
					const url = paths.getUserReward(phoneNumber, loyaltyId);
					const response = await axiosInstance.get(url);

					if (response.data.exists === false) {
						toast.error("User not exist");
					} else {
						setUserDetails(response.data);
						setIsCoinzModalOpen(true);
						closeModal();
					}
				}
			} catch (err) {
				console.error("Error verifying number:", err);
				toast.error("User not exist");
			}
		}
	};

	const handlePhoneNumberChange2 = async (number) => {
		let processedNumber = number;
		if (number > 10) {
			processedNumber = number.substring(2);
		}
		try {
			const url = paths.getUserReward(processedNumber, loyaltyId);
			const response = await axiosInstance.get(url);
			if (response.data.exists === false) {
			} else {
				setUserDetails(response.data);
				setIsUserModalOpen(false);
				setIsCoinzModalOpen(true);
				closeModal();
			}
		} catch (err) {
			toast.error("User not exist");
			console.error("Error verifying number:", err);
		}
	};

	const activeUsers = async (show) => {
		try {
			const url = paths.getActiveUser(tableId, zoneId, businessId);
			const response = await axiosInstance.get(url);
			const user = response.data.filter((ele) => ele.customerPhone.length > 10);
			console.log(user.length);
			if (user.length > 0) {
				setUsers(user);
				setSelectedUser(user[0].customerPhone);
				setUserDetails(user[0]);
				setIsUserModalOpen(show);
				setRedeemCoins(false);
				setCvv("");
				setCoinsToRedeem(0);
			} else if (user.length === 0) {
				setIsModalOpen(true);
			} else {
				setFootButton("SETTLE");
				setIsModalOpen(true);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const openModal = (modalContent: SettlePageTypes) => {
		if (modalContent === "SETTLE") {
			fetchPaymentMethods();
		}
		if (modalContent === "HI_COINS") {
			activeUsers(true);
			setFootButton(modalContent);
		} else {
			setFootButton(modalContent);
			setIsModalOpen(true);
		}
	};
	const closeModal = () => {
		setIsModalOpen(false);
		setFootButton("");
	};

	const handleDiscountModeChange = (e: any) => {
		setDiscountMode(e.target.value);
	};

	const handleDiscountChange = (e: any) => {
		const value = e.target.value.replace(/[^0-9\b]/g, "");
		setDiscountValue(Math.abs(value));
	};
	const handleTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const tipValue = e.target.value;

		if (tipValue.length <= 5 && Number.parseFloat(tipValue) <= 10000) {
			setTip(Number.parseFloat(tipValue));
		} else if (Number.parseFloat(tipValue) > 10000) {
			setTip(10000);
		}
	};

	const calculation = (discount: number, tip: number, claim: number) => {
		let { subTotal, CGST, SGST, serviceCharge } = updatedBillData;
		let serviceChargePercent = businessData?.serviceChargePercentage || 0;
		if (serviceChargePercent > 0) {
			serviceChargePercent = serviceChargePercent / 100;
		}
		const gstCharge = businessData?.gstPercentage || 0;

		// Calculate service charge
		let taxableAmount = subTotal - discount;

		if (claim > 0) {
			taxableAmount = taxableAmount - claim;
		}
		if (serviceChargePercent > 0 && serviceCharge !== 0 && serviceCharge) {
			serviceCharge = taxableAmount * serviceChargePercent;
		} else {
			serviceCharge = 0;
		}

		let GST = (taxableAmount + serviceCharge) * gstCharge;
		GST = Math.max(GST, 0);
		CGST = GST / 2;
		SGST = CGST;
		let total = taxableAmount + serviceCharge + GST;

		if (tip > 0) {
			total += tip;
		}
		total = Math.max(total, 0);

		handleUpdateBillData({
			subTotal: subTotal,
			discount: discount,
			serviceCharge: Math.ceil(serviceCharge),
			Total: Math.ceil(total),
			CGST: CGST,
			SGST: SGST,
			tips: tip || 0,
			claimedAmount: claim || 0,
			discountGivenBy:
				discount > 0
					? updatedBillData.discountGivenBy
						? updatedBillData.discountGivenBy
						: userData?.name
					: userData?.name,
			tipsGivenBy:
				tip > 0
					? updatedBillData.tipsGivenBy
						? updatedBillData.tipsGivenBy
						: userData?.name
					: userData?.name,
		});
	};

	const removeDiscount = async () => {
		setLoading(true);
		try {
			const discount = 0;
			await axiosInstance.put("/v1/kitchens/:id/applyDiscount", {
				discountAmount: discount,
				tableId,
				discountDescription: "removed discount",
				discountMode: discountMode,
				discountPercentage: discountValue,
				discountRemovedBy: userData?.name || "Captain",
			});
			setDiscount(0);
			setDiscountDescription("");
			setIsModalOpen(false);
			calculation(
				discount,
				updatedBillData.tips,
				updatedBillData.claimedAmount,
			);
		} catch (error) {
			toast.error("Error removing discount");
		} finally {
			setLoading(false);
		}
	};

	const applyDiscount = async () => {
		if (discountDescription.trim() === "") {
			toast.error("Please enter a reason for the discount");
			return;
		}
		setLoading(true);

		// Calculate the subtotal of the order
		const total = updatedBillData.subTotal;
		let totalDiscount = 0;
		if (discountMode === "rupees") {
			// For fixed amount discount
			totalDiscount = Math.min(discountValue, total);
		} else {
			// For percentage discount
			const maxDiscountValue = Math.min(discountValue, 100);
			totalDiscount = (total * maxDiscountValue) / 100;
		}
		calculation(
			totalDiscount,
			updatedBillData.tips,
			updatedBillData.claimedAmount,
		);
		try {
			const response = await axiosInstance.put("/v1/kitchens/:id/applyDiscount", {
				discountAmount: totalDiscount,
				discountDescription,
				tableId,
				discountMode: discountMode,
				discountPercentage: discountValue,
				discountGivenBy: userData?.name,
			});
			setIsModalOpen(false);
		} catch (error) {
			toast.error("Error applying discount");
		} finally {
			setLoading(false);
		}
	};

	const addingTip = async () => {
		if (tip === null || tip === undefined || tip === 0 || Number.isNaN(tip)) {
			toast.error("Invalid tip amount. Please enter a valid tip.");
			return;
		}
		setLoading(true);
		try {
			const response = await axiosInstance.put("/v1/kitchens/:id/applyTips", {
				tableId: tableId,
				tipsAmount: tip,
				tipsGivenBy: userData?.name,
			});
			calculation(updatedBillData.discount, tip, updatedBillData.claimedAmount);
		} catch (error) {
			console.error("Error adding tip:", error);
			toast.error("Error adding tip");
		} finally {
			setLoading(false);
			closeModal();
		}
	};

	const handlePaymentMethodSelection = async (methodId: SettlePageTypes) => {
		const paymentMode = methodId.split(" ").join("_").toUpperCase();
		if (paymentMode === "DUES") {
			try {
				const url = paths.getDues(businessId);
				const response = await axiosInstance.get(url);

				if (response.data.length === 0) {
					toast.error("No due person added");
				} else {
					setSelectedPaymentMethod(paymentMode);
					openModal(paymentMode);
					setDuesPersons(response.data);
				}
			} catch (error) {
				console.error("Error fetching dues persons:", error);
				toast.error("Error fetching dues persons");
			}
		} else if (paymentMode === "SPLIT_PAYMENT") {
			setSelectedPaymentMethod(paymentMode);
			openModal(paymentMode);
		} else if (selectedPaymentMethod === paymentMode) {
			setSelectedPaymentMethod("");
		} else {
			setSelectedPaymentMethod(paymentMode);
		}
	};
	const handleMultiplePaymentMethodSelection = (methodId) => {
		if (multiplePaymentMethods.includes(methodId)) {
			setMultiplePaymentMethods(
				multiplePaymentMethods.filter((method) => method !== methodId),
			);
		} else {
			setMultiplePaymentMethods([...multiplePaymentMethods, methodId]);
		}
	};

	const sendWatsAppAlert = async () => {
		try {
			const config = {
				phone: businessData?.ownerPhone || "919588413799",
				businessName: businessData?.businessName.trim(),
				tableName: tableData?.name,
				billId: "76567",
				discountPercentage:
					discountMode === "percent"
						? `${discountValue} %`
						: `₹ ${discountValue}`,
				discountReason: discountDescription,
				discount: discount,
				waiterName: userData?.name,
			};
			const res = await axiosInstance.post("/v1/payments/discountAlert", config);
		} catch (error) {
			console.log(error);
		}
	};

	const handleUserSelection = (userName, userId) => {
		setSelectedPerson({ name: userName, id: userId });
		handleUpdateBillData({
			duesPersonId: userId,
			customerName: userName,
			customerPhone: userData.phoneNumber || userData.phone,
		});
	};
	const formatPhoneNumber = (phone:string) => {
		if (phone.length <= 8) return phone;
		const start = phone.substring(2, 4);
		const end = phone.substring(phone.length - 3);
		return `${start}XXXXX${end}`;
	};

	async function settleMergeTable() {
		try {
			const config = {
				method: "put",
				url: "/v1/zones/:zoneId/settleMergeTables",
				data: {
					mergeTables: tableData?.mergeTables,
				},
			};
			const res = await axiosInstance(config);
			if (res.status === 200) {
				setTableData({
					...tableData,
					mergeTables: [],
					isMerge: false,
					hierarchy: "",
					parentTableId: "",
					parentZoneId: "",
				});
			}
		} catch (err) {
			toast.error("Error settling merge tables");
		}
	}

	const sendPrintBill = async () => {
		if (loading) return;
		setLoading(true);
		try {
			const url = "/v1/kitchens/:id/printBill";
			const res = await axiosInstance.put(url, {
				tableId: tableId,
				discountAmount: updatedBillData.discount,
				businessId: businessId,
				businessName: businessData?.businessName,
				logo: businessData?.logo,
				gstNumber: businessData?.gstNumber || "",
				fssaiLicenseNumber: businessData?.fssaiLicenseNumber || "",
				hasServiceCharge: businessData?.serviceCharge || false,
				serviceChargePercentage: businessData?.serviceChargePercentage || 0,
				zoneId: zoneId,
			});
			const billId = res.data.billId;
			const config = {
				method: "GET",
				url: `/v1/kitchens/Get/UserBill/${billId}`,
			};
			if (res.status === 200) {
				const response = await axiosInstance(config);
				if (businessData?.kotPrinter) {
					const config2 = {
						method: "POST",
						url: "https://ws.hipal.life/bill",
						data: {
							payload: {
								...response?.data,
								waiterName: userData?.name,
							},
							bill: "bill",
						},
					};
					const billPrint = axios(config2);
					toast.success("Bill send successfully");
				}
			}
		} catch (error) {
			console.error("Error sending bill:", error);
		} finally {
			setLoading(false);
		}
	};
	const handleAddPhoneNumber = () => {
		if (newPhoneNumber) {
			const phoneNumberWithPrefix = `91${newPhoneNumber}`;
			setSelectedPhoneNumbers((prevPhoneNumbers) => {
				if (!prevPhoneNumbers.includes(phoneNumberWithPrefix)) {
					return [...prevPhoneNumbers, phoneNumberWithPrefix];
				}
				return prevPhoneNumbers;
			});
			setNewPhoneNumber("");
		}
	};
	const handleCheckboxChange = (phone: string) => {
		const phoneNumberWithPrefix = `91${phone}`;
		setSelectedPhoneNumbers((prevPhoneNumbers: string[]) => {
			if (prevPhoneNumbers.includes(phoneNumberWithPrefix)) {
				return prevPhoneNumbers.filter(
					(prevPhone) => prevPhone !== phoneNumberWithPrefix,
				);
			}
			return [...prevPhoneNumbers, phoneNumberWithPrefix];
		});
	};

	const sendBill = async () => {
		if (loading) return;
		setLoading(true);
		try {
			const url = "/v1/kitchens/:id/e-bill";

			const res = await axiosInstance.put(url, {
				tableId: tableId,
				discountAmount: updatedBillData.discount,
				businessId: businessId,
				businessName: businessData?.businessName,
				logo: businessData?.logo,
				gstNumber: businessData?.gstNumber || "",
				fssaiLicenseNumber: businessData?.fssaiLicenseNumber || "",
				hasServiceCharge: businessData?.serviceCharge || false,
				serviceChargePercentage: businessData?.serviceChargePercentage || 0,
				zoneId: zoneId,
			});
			const billId = res.data.billId;
			const config = {
				method: "post",
				url: "/v1/users/Bill/generateBill",
				data: {
					mobiles: selectedPhoneNumbers,
					businessname: businessName,
					time: new Date().toLocaleTimeString("it-IT"),
					bill: `https://pro.hipal.life/E-bill/${billId}`,
				},
			};
			if (res.status === 200) {
				await axiosInstance(config);
				setSelectedPhoneNumbers([]);
				closeModal();
				toast.success("Bill send sucessfully");
			}
		} catch (error) {
			console.error("Error sending bill:", error);
		} finally {
			setLoading(false);
		}
	};
	const calcAfterServiceChargeRemoval = () => {
		let { subTotal, CGST, SGST, serviceCharge, claimedAmount, tips } =
			updatedBillData;
		const gstCharge = businessData?.gstPercentage || 0;
		let taxableAmount = subTotal - updatedBillData.discount;
		if (claimedAmount > 0) {
			taxableAmount = taxableAmount - claimedAmount;
		}
		const GST = (taxableAmount + serviceCharge) * gstCharge;
		CGST = GST / 2;
		SGST = CGST;
		let total = taxableAmount + GST;

		if (tips > 0) {
			total += tips;
		}
		handleUpdateBillData({
			subTotal: subTotal,
			serviceCharge: 0,
			Total: total,
			CGST: CGST,
			SGST: SGST,
			claimedAmount,
			tips: tips || 0,
			serviceChargeRemovedBy: userData.name || "",
		});
	};
	const removeServiceTax = async (password: string, action: boolean) => {
		const currentDate = new Date();
		const formattedDate = `${currentDate.getDate()}/${
			currentDate.getMonth() + 1
		}/${currentDate.getFullYear()}`;

		const actionKey = action
			? "serviceChargeRemovedBy"
			: "serviceChargeAddedBy";

		const config = {
			phone: businessData?.ownerPhone || "919177914130",
			businessName: businessData?.businessName.trim(),
			tableName: tableData?.name,
			date: formattedDate,
			billNumber: "125460",
			serviceCharge: updatedBillData?.serviceCharge,
			reason: "user request",
			customerName: userDetails?.userName || userData?.name,
			waiterName: userData?.name,
		};

		const sendAlert = async () => {
			try {
				const res = await axiosInstance.post("/v1/payments/serviceChargeAlert", config);
			} catch (error) {
				console.error("Error sending alert:", error);
			}
		};

		try {
			const response = await axiosInstance.put(
				`/v1/businesses/${businessId}/removalServiceCharge`,
				{ password, tableId, [actionKey]: userData.name, reapply: !action },
			);
			if (action) {
				calcAfterServiceChargeRemoval();
			}
			if (response.status === 200) {
				toast.success(`Service tax ${action ? "removed" : "added"}`);
				closeModal();
				updatedGetBill();
				sendAlert();
			} else {
				toast.error(`Error ${action ? "removed" : "added"} service tax`);
			}
		} catch (error) {
			toast.error("Wrong password");
			console.error("Error:", error);
		}
	};

	const handleRedeemCoins = async () => {
		try {
			if (userDetails?.password !== Number(cvv)) {
				toast.error("Invalid CVV");
				return;
			}

			// Check if coins to be redeemed are valid
			if (coinsToRedeem > userDetails?.rewards) {
				toast.error(
					"You cannot redeem more coins than you have in your wallet.",
				);
				return;
			}

			if (coinsToRedeem > maxClaimableAmount) {
				toast.error(
					"You cannot redeem more coins than the maximum claimable amount.",
				);
				return;
			}

			if (coinsToRedeem > updatedBillData.subTotal) {
				toast.error("You cannot redeem more coins than the bill value.");
				return;
			}

			const response = await axiosInstance.put("/v1/kitchens/:id/applyCoins", {
				tableId: tableId,
				claimedAmount: coinsToRedeem,
			});
			if (response.status === 200) {
				calculation(
					updatedBillData.discount,
					updatedBillData.tips,
					coinsToRedeem,
				);
				toast.success("Coins redeemed successfully!");
				setIsCoinzModalOpen(false);
				setIsMiddle(true);
				playSound();
			}
		} catch (error) {
			toast.error("Error redeeming coins:");
		}
	};

	const handleRedeemCoinsSettle = async () => {
		let amtClaimed = coinsToRedeem;
		if (
			updatedBillData?.claimedAmount ||
			updatedBillData?.claimedAmount === 0
		) {
			amtClaimed = updatedBillData?.claimedAmount;
		}

		try {
			const response = await axiosInstance.post(
				`/v1/users/Reward?claim=${redeemCoins}&settle=true`,
				{
					userPhone: userDetails?.userPhone || userDetails?.customerPhone,
					userName: userDetails?.userName || userDetails?.customerName,
					loyaltyId: loyaltyId,
					claimedAmount: amtClaimed,
					waiterName: userData.name,
					businessName: businessName,
					rewards:
						(updatedBillData?.subTotal -
							(updatedBillData?.discount || 0) -
							(amtClaimed || 0)) *
						(reward / 100),
					password: Number(cvv),
					items: items,
					total: updatedBillData?.Total,
					subTotal: updatedBillData?.subTotal,
					cgst: updatedBillData?.CGST,
					sgst: updatedBillData?.SGST,
					tableName: billData[0]?.tableName,
				},
			);
			if (response.data) {
				toast.success("Coins redeemed successfully!");
				setIsCoinzModalOpen(false);
			} else {
				toast.error("There was an issue redeeming the coins.");
			}
		} catch (error: any) {
			console.error("Error redeeming coins:", error);
			toast.error(error?.response?.data);
		}
	};

	const fetchPaymentMethods = async () => {
		if (loyaltyId && !userDetails) {
			activeUsers(false);
		}
		if (!(lastUpdated === null || Date.now() - lastUpdated > 3 * 60000)) {
			return;
		}
		try {
			const response = await axiosInstance.get(
				`/v1/payments/Get/Modes?businessId=${businessId}`,
			);
			setPaymentMethods(response.data);
		} catch (error) {
			console.error("Failed to fetch payment methods", error);
			toast.error("Failed to fetch payment methods");
		}
	};

	const finalClick = async () => {
		if (!selectedPaymentMethod) {
			return toast.error("Please Select the Mode");
		}
		if (selectedPaymentMethod === "split payment") {
			return toast.error("Please Select different Mode");
		}
		if (loading) {
			return;
		}

		const date = new Date();

		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = date.getFullYear();
		const dayAndDate = `${day}-${month}-${year}`;
		const time = new Date().toLocaleTimeString("it-IT");

		setLoading(true);

		try {
			const config = {
				method: "put",
				url: "/v1/kitchens/:id/settle-bill",
				data: {
					...updatedBillData,
					discountDescription,
					waiterName: userData?.name,
					zoneType: zone?.zoneType,
					mode: selectedPaymentMethod.toLowerCase(),
					dayAndDate: dayAndDate,
					indianTime: time.slice(0, 5),
					hiCode: tableData?.hiCode || "",
				},
			};
			const res = await axiosInstance(config);
			if (discountDescription) {
				sendWatsAppAlert();
			}

			if (res.status) {
				setDiscountDescription("");
				setSelectedPaymentMethod("");
				setSelectedPerson({ id: "", name: "" });
				if (tableData?.isMerge) {
					toast("Merge Tables are settled");
				} else {
					toast(`${tableData.name} is settled`);
				}
				setSettleError(false);

				console.log(userDetails, loyaltyId);
				if (
					loyaltyId &&
					(userDetails?.userPhone || userDetails?.customerPhone)
				) {
					handleRedeemCoinsSettle();
				}
				if (tableData?.isMerge) {
					await settleMergeTable();
				}
				clearCartForTable(tableId);
				closeModal();
				navigate(routePaths[PAGE_TYPES.TABLES](businessId, zoneId));
			}
		} catch (error: any) {
			if (error.response.status === 400) {
				setSettleError(true);
				toast.error("please try again");
			}
			console.log("Error settling bill:", error);
		} finally {
			setLoading(false);
		}
	};
	const splitFinalClick = async (data) => {
		if (!selectedPaymentMethod) {
			return toast.error("Please Select the Mode");
		}
		if (loading) {
			return;
		}

		const date = new Date();
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = date.getFullYear();
		const dayAndDate = `${day}-${month}-${year}`;
		const time = new Date().toLocaleTimeString("it-IT");

		setLoading(true);

		try {
			const config = {
				method: "put",
				url: "/v1/kitchens/:id/settle-bill",
				data: {
					...updatedBillData,
					mode: "multiple",
					modeBreakDown: data,
					waiterName: userData?.name,
					discountDescription,
					zoneType: zone?.zoneType,
					dayAndDate: dayAndDate,
					indianTime: time.slice(0, 5),
					hiCode: tableData?.hiCode || "",
				},
			};

			const res = await axiosInstance(config);

			if (res.status) {
				if (discountDescription) {
					sendWatsAppAlert();
				}
				setDiscount(0);
				setDiscountDescription("");
				setSelectedPaymentMethod("");
				setSelectedPerson({ id: "", name: "" });
				toast(`${tableData.name} is settled`);
				closeModal();
				setIsSplitModalOpen(false);
				if (loyaltyId && userDetails?.userPhone) {
					handleRedeemCoinsSettle();
				}
				if (tableData?.isMerge) {
					await settleMergeTable();
				}
				clearCartForTable(tableId);
				navigate(routePaths[PAGE_TYPES.TABLES](businessId, zoneId));
			}
		} catch (error) {
			console.log("Error settling multiple payment:", error);
			toast.error("Error settling multiple payment");
		} finally {
			setLoading(false);
		}
	};

	const handleRetryClick = () => {
		retryCount.current += 1;
		if (retryCount.current >= 5) {
			navigate(`/r/${businessId}/zone`);
		} else {
			finalClick();
		}
	};

	const { isLoading, error, data } = useQuery({
		queryKey: [
			"updatedGetBill",
			tableId,
			businessData?.serviceCharge,
			businessData?.serviceChargePercentage,
			businessData?.gstPercentage,
		],
		queryFn: updatedGetBill,
		enabled: !!tableId,
	});

	if (isLoading) {
		return <Loader />;
	}

	return (
		<Suspense fallback={<Loader />}>
			<div className="pb-[7rem]">
				{" "}
				<div className="relative w-[85%] mx-auto mt-6 md:w-[60%] lg:w-[40%] xl:w-[30%] bg-base-100 rounded-2xl">
					{billData?.length > 0 && (
						<>
							<BillDetails billData={billData} />
							<TotalBill openModal={openModal} billData={updatedBillData} />
						</>
					)}
				</div>
				<DayOutPopup show={isModalOpen} onClose={closeModal}>
					{footButton === "DISCOUNT" &&
						(loading ? (
							<Loader />
						) : (
							<DiscountComponent
								billData={updatedBillData}
								discountMode={discountMode}
								handleDiscountModeChange={handleDiscountModeChange}
								discountValue={discountValue}
								handleDiscountChange={handleDiscountChange}
								discountDescription={discountDescription}
								setDiscountDescription={setDiscountDescription}
								removeDiscount={removeDiscount}
								applyDiscount={applyDiscount}
							/>
						))}
					{footButton === "HI_COINS" && (
						<MobileNumberForCoinz
							handlePhoneNumberChange={handlePhoneNumberChange}
							setIsCoinzModalOpen={setIsCoinzModalOpen}
							closeModal={closeModal}
						/>
					)}
					{footButton === "SETTLE" &&
						(settleError ? (
							<div className="flex items-center justify-center h-screen">
								<Link to={`/r/${businessId}/zone`}>
									<button className="btn" type="button">
										Retry
									</button>
								</Link>
								<button
									onClick={handleRetryClick}
									className="btn"
									type="button"
								>
									Retry
								</button>
							</div>
						) : (
							<PaymentModeSelector
								billData={updatedBillData}
								loading={loading}
								paymentMethods={paymentMethods}
								selectedPaymentMethod={selectedPaymentMethod}
								handlePaymentMethodSelection={handlePaymentMethodSelection}
								handleAmountChange={handleAmountChange}
								changeToGiveBack={changeToGiveBack}
								finalClick={finalClick}
							/>
						))}
					{footButton === "DUES" && (
						<DuesUserSelector
							billData={updatedBillData}
							duesPersons={duesPersons}
							handleUserSelection={handleUserSelection}
							selectedPerson={selectedPerson}
							finalClick={finalClick}
							loading={loading}
						/>
					)}
					{footButton === "SPLIT_PAYMENT" && (
						<SplitPaymentSelector
							billData={updatedBillData}
							handleMultiplePaymentMethodSelection={
								handleMultiplePaymentMethodSelection
							}
							loading={loading}
							multiplePaymentMethods={multiplePaymentMethods}
							paymentMethods={paymentMethods}
							setIsSplitModalOpen={setIsSplitModalOpen}
						/>
					)}
					{footButton === "PRINT_BILL" &&
						(loading ? (
							<Loader />
						) : (
							<PrintBillComponent
								sendPrintBill={sendPrintBill}
								closeModal={closeModal}
							/>
						))}
					{footButton === "E_BILL" && (
						<EBillComponent
							billData={updatedBillData}
							formatPhoneNumber={formatPhoneNumber}
							grouped_customers={grouped_customers}
							handleAddPhoneNumber={handleAddPhoneNumber}
							handleCheckboxChange={handleCheckboxChange}
							loading={loading}
							newPhoneNumber={newPhoneNumber}
							selectedPhoneNumbers={selectedPhoneNumbers}
							sendBill={sendBill}
							setNewPhoneNumber={setNewPhoneNumber}
						/>
					)}
					{footButton === "TIP" && (
						<AddTipComponent
							tip={tip}
							handleTipChange={handleTipChange}
							addingTip={addingTip}
						/>
					)}
					{footButton === "REMOVE_SERVICE_TAX" && (
						<RemoveServiceTax
							updatedBillData={updatedBillData}
							removeServiceTax={removeServiceTax}
						/>
					)}
				</DayOutPopup>
				{isSplitModalOpen && (
					<DayOutPopup
						show={isSplitModalOpen}
						onClose={() => {
							setIsSplitModalOpen(false);
						}}
					>
						<SplitPaymentModal
							onClose={() => {
								setIsSplitModalOpen(false);
							}}
							billAmount={updatedBillData?.Total}
							selectedMethods={multiplePaymentMethods}
							splitFinalClick={splitFinalClick}
						/>
					</DayOutPopup>
				)}
				{isUserModalOpen && (
					<DayOutPopup
						show={isUserModalOpen}
						onClose={() => {
							setIsUserModalOpen(false);
							setSelectedUser(null);
						}}
					>
						<ClaimCoinzSelector
							billData={updatedBillData}
							users={users}
							selectedUser={selectedUser}
							setSelectedUser={setSelectedUser}
							setIsUserModalOpen={setIsUserModalOpen}
							setIsModalOpen={setIsModalOpen}
							handlePhoneNumberChange2={handlePhoneNumberChange2}
							setFootButton={setFootButton}
						/>
					</DayOutPopup>
				)}
				{isCoinzModalOpen && (
					<DayOutPopup
						show={isCoinzModalOpen}
						onClose={() => {
							setIsCoinzModalOpen(false);
							setCvv("");
							setCoinsToRedeem(0);
						}}
					>
						<LoyaltyCoinzUsage
							userDetails={userDetails}
							redeemCoins={redeemCoins}
							setRedeemCoins={setRedeemCoins}
							setIsCoinzModalOpen={setIsCoinzModalOpen}
							setCvv={setCvv}
							setCoinsToRedeem={setCoinsToRedeem}
							maxClaimableAmount={maxClaimableAmount}
							handleRedeemCoins={handleRedeemCoins}
						/>
					</DayOutPopup>
				)}
				{isPasswordModalOpen && (
					<DayOutPopup
						show={isPasswordModalOpen}
						onClose={() => {
							setIsPasswordModalOpen(false);
						}}
					>
						<ApplyDiscount
							openModal={openModal}
							onClose={() => setIsPasswordModalOpen(false)}
						/>
					</DayOutPopup>
				)}
				{isMiddle && (
					<MiddlePopUp show={isMiddle} onClose={() => setIsMiddle(false)}>
						<AvailedCoins
							userName={userDetails?.userName}
							coinz={coinsToRedeem}
							bill={updatedBillData.subTotal}
						/>
					</MiddlePopUp>
				)}
				<div
					className={`${
						activeButton.toLowerCase() === "settle" && billData.length > 0
							? ""
							: "hidden"
					} w-full h-[4rem] fixed bottom-0 z-20 py-2 shadow-lg shadow-base-100 bg-primary`}
				>
					<div ref={fabRef} className="absolute bottom-[5rem] left-6">
						<div
							className={`flex flex-col space-y-2 transform origin-bottom ${
								isFabOpen ? "opacity-100 scale-y-1" : "opacity-0 scale-y-0"
							} fab-transition`}
						>
							<button
								type="button"
								onClick={() => openModal("PRINT_BILL")}
								className="flex items-center justify-center px-4 py-2 text-sm shadow-lg text-base-100 bg-primary rounded-xl"
							>
								<ImPrinter className="mr-2" /> Print Bill
							</button>
							<button
								type="button"
								onClick={() => openModal("E_BILL")}
								className="flex items-center justify-center px-4 py-2 text-sm bg-green-400 shadow-lg text-base-100 rounded-xl"
							>
								<MdOutlineReceiptLong className="mr-2" /> E-Bill
							</button>
							<button
								type="button"
								onClick={() => openModal("TIP")}
								className="flex items-center justify-center px-4 py-2 text-sm shadow-lg text-base-100 bg-primary rounded-xl"
							>
								<FaRupeeSign className="mr-2" /> Add Tip
							</button>
							{businessData?.serviceCharge && (
								<button
									type="button"
									onClick={() => openModal("REMOVE_SERVICE_TAX")}
									className="flex items-center justify-center px-4 py-2 text-sm shadow-lg text-base-100 bg-primary rounded-xl"
								>
									<FaRupeeSign className="mr-2" /> Service Tax
								</button>
							)}
						</div>
						<button
							type="button"
							onClick={toggleFab}
							className="flex items-center justify-center w-12 h-12 mt-2 rounded-full shadow-lg text-base-100 bg-primary"
						>
							{isFabOpen ? (
								<HiX className="text-2xl" />
							) : (
								<BiPlus className="text-3xl" />
							)}
						</button>
					</div>
					<button
						type="button"
						onClick={() => setIsPasswordModalOpen(true)}
						className="absolute px-4 py-2 mr-2 font-[500] text-sm border-base-100 border text-base-100 bg-primary rounded-full bottom-3 left-6"
					>
						Discount
					</button>
					{loyaltyId && (
						<button
							type="button"
							onClick={() => openModal("HI_COINS")}
							className="absolute px-4 py-2 mr-2 font-[500] text-sm border-base-100 border text-base-100 bg-primary rounded-full bottom-3 left-[8rem]"
						>
							Hi Coinz
						</button>
					)}
					<button
						type="button"
						onClick={() => {
							openModal("SETTLE");
						}}
						className={`${
							billData.length > 0
								? "absolute text-sm font-[500] px-4 py-2 mr-2 border-base-100 border text-primary bg-base-100 rounded-full right-6 bottom-3"
								: "hidden"
						}`}
					>
						Settle
					</button>
				</div>
			</div>
		</Suspense>
	);
};

export default memo(Settle);
