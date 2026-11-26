import { convertTo12HourFormat } from "../settingsForm/outletForm";
import { FaLocationDot } from "react-icons/fa6";
import { lazy, memo, useCallback } from "react";
import { MdOutlineWatchLater } from "react-icons/md";
import { useBizInfoChanges } from "../../helpers/bizInforHelpers";
import { useExploreTemp } from "@/components/store/useExploreTemp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type {
  CurrencyCode,
  CurrencyCodeSymbol,
} from "@/components/types/businessData.ts";

const SubHeader = lazy(() => import("@/components/atom/subHeader"));

const currencyOptions = [
  {
    code: "INR" as CurrencyCode,
    symbol: "₹" as CurrencyCodeSymbol,
    name: "Indian Rupee",
  },
  {
    code: "USD" as CurrencyCode,
    symbol: "$" as CurrencyCodeSymbol,
    name: "US Dollar",
  },
  {
    code: "EUR" as CurrencyCode,
    symbol: "€" as CurrencyCodeSymbol,
    name: "Euro",
  },
  {
    code: "GBP" as CurrencyCode,
    symbol: "£" as CurrencyCodeSymbol,
    name: "British Pound",
  },
  {
    code: "JPY" as CurrencyCode,
    symbol: "¥" as CurrencyCodeSymbol,
    name: "Japanese Yen",
  },
  {
    code: "AUD" as CurrencyCode,
    symbol: "A$" as CurrencyCodeSymbol,
    name: "Australian Dollar",
  },
  {
    code: "CAD" as CurrencyCode,
    symbol: "C$" as CurrencyCodeSymbol,
    name: "Canadian Dollar",
  },
  {
    code: "CNY" as CurrencyCode,
    symbol: "¥" as CurrencyCodeSymbol,
    name: "Chinese Yuan",
  },
  {
    code: "RUB" as CurrencyCode,
    symbol: "₽" as CurrencyCodeSymbol,
    name: "Russian Ruble",
  },
  {
    code: "BRL" as CurrencyCode,
    symbol: "R$" as CurrencyCodeSymbol,
    name: "Brazilian Real",
  },
  {
    code: "ZAR" as CurrencyCode,
    symbol: "R" as CurrencyCodeSymbol,
    name: "South African Rand",
  },
  {
    code: "KRW" as CurrencyCode,
    symbol: "₩" as CurrencyCodeSymbol,
    name: "South Korean Won",
  },
  {
    code: "MXN" as CurrencyCode,
    symbol: "$" as CurrencyCodeSymbol,
    name: "Mexican Peso",
  },
  {
    code: "NZD" as CurrencyCode,
    symbol: "$" as CurrencyCodeSymbol,
    name: "New Zealand Dollar",
  },
  {
    code: "SGD" as CurrencyCode,
    symbol: "$" as CurrencyCodeSymbol,
    name: "Singapore Dollar",
  },
];

const MemoContactInfo = () => {
  const {
    phone,
    location,
    avgPricingForTwo,
    address,
    fixedTime,
    currencyCode,
    currencySymbol,
    setCurrencyCode,
    setCurrencySymbol,
  } = useExploreTemp((s) => ({
    phone: s.phone,
    location: s.location,
    avgPricingForTwo: s.avgPricingForTwo,
    address: s.address,
    fixedTime: s.fixedTime,
    currencyCode: s.currencyCode,
    currencySymbol: s.currencySymbol,
    setCurrencyCode: s.setCurrencyCode,
    setCurrencySymbol: s.setCurrencySymbol,
  }));

  const {
    handlePhoneChange,
    handleLocationChange,
    handleChangeAddress,
    handlePricingChange,
    handleTimings,
  } = useBizInfoChanges();

  const handleCurrencyChange = useCallback(
    (selectedCode: string) => {
      const selectedCurrency = currencyOptions.find(
        (option) => option.code === selectedCode,
      );
      if (selectedCurrency) {
        setCurrencyCode(selectedCurrency.code);
        setCurrencySymbol(selectedCurrency.symbol);
      }
    },
    [setCurrencyCode, setCurrencySymbol],
  );

  return (
    <div className="lg:flex lg:justify-between lg:space-x-4">
      <section className="flex-1">
        <SubHeader text="Contact" />
        <article className="p-4 space-y-4 bg-white rounded-2xl">
          <div className="relative">
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              className="w-full rounded-2xl"
              placeholder="Enter phone number"
              maxLength={10}
              minLength={10}
            />
            <small className="absolute bottom-3 right-4">
              {phone?.length}/{10}
            </small>
          </div>
          <div className="relative">
            <input
              minLength={10}
              maxLength={100}
              placeholder="Add Location on map"
              type="text"
              value={location}
              className="w-full pr-10 rounded-2xl"
              onChange={handleLocationChange}
            />
            <small className="absolute bottom-4 right-4">
              <FaLocationDot />
            </small>
          </div>
          <div className="relative">
            <textarea
              minLength={10}
              maxLength={100}
              placeholder="Add Address"
              value={address}
              className="w-full h-24 pr-16 resize-none rounded-2xl"
              onChange={handleChangeAddress}
            />
            <small className="absolute bottom-3 right-4">
              {address?.length}/{100}
            </small>
          </div>
        </article>
      </section>
      <section className="mb-[5rem] flex-1">
        <article>
          <SubHeader text="Info" />
        </article>
        <article className="p-4 bg-white rounded-2xl">
          <section className="p-4 border border-1 rounded-2xl">
            <div className="relative mb-4">
              <input
                value={avgPricingForTwo}
                type="tel"
                maxLength={10}
                onChange={handlePricingChange}
                className="w-full mb-2 outline-none rounded-2xl"
                placeholder="Add Average Pricing For Two"
              />
              <small className="absolute bottom-5 right-4">
                {avgPricingForTwo?.toString().length}/{10}
              </small>
            </div>

            {/* Currency Selection */}
            <div className="mb-4 space-y-2">
              <Label htmlFor="currency-select" className="text-sm font-medium">
                Currency
              </Label>
              <Select value={currencyCode} onValueChange={handleCurrencyChange}>
                <SelectTrigger
                  id="currency-select"
                  className="w-full rounded-2xl"
                >
                  <SelectValue placeholder="Select currency">
                    {currencyCode && (
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{currencySymbol}</span>
                        <span>{currencyCode}</span>
                        <span className="text-sm text-gray-500">
                          {
                            currencyOptions.find(
                              (opt) => opt.code === currencyCode,
                            )?.name
                          }
                        </span>
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{option.symbol}</span>
                        <span>{option.code}</span>
                        <span className="text-sm text-gray-500">
                          {option.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>
          <section className="flex gap-6 my-4">
            <article
              onClick={handleTimings}
              onKeyDown={handleTimings}
              className="flex items-center px-2 py-1 space-x-4 bg-gray-100 border rounded-full border-1 cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <MdOutlineWatchLater />
              <h1>Add Timings</h1>
            </article>
          </section>
          {(fixedTime?.openTime || fixedTime?.closeTime) && (
            <div
              style={{ width: "max-content" }}
              className="px-4 py-1 text-sm text-[#8C63FF] bg-[#8C63FF20] rounded-full"
            >
              Business time from {convertTo12HourFormat(fixedTime?.openTime)} to{" "}
              {convertTo12HourFormat(fixedTime?.closeTime)}
            </div>
          )}
        </article>
      </section>
    </div>
  );
};

const ContactInfo = memo(MemoContactInfo);
export default ContactInfo;
