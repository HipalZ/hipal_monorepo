import MiddlePopUp from '@/components/atom/middlePopUp';
import { normalizeInput, useAddTemplate } from '@/components/helpers/whatzAppHelpers';
import useBusinessData from '@/components/store/useBusinessData';
import useWhatsapp, { HeaderInterface } from '@/components/store/useWhatsapp';
import { cn } from '@/components/utils/helper';
import { lazy, memo, useCallback, useEffect } from 'react';
import { BiPlus } from 'react-icons/bi';
import { FiAlertTriangle } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';

const MediaContent = lazy(() => import('./mediaContent'));
const CouponContent = lazy(() => import('./couponContent'));

const defaultData = [
  // { label: 'additionalRate', value: '₹1,200 per night' },
  // { label: 'address', value: 'Bangalore' },
  // { label: 'amount', value: '₹4,500' },
  // { label: 'businessName', value: 'Business Name' },
  // { label: 'cancellationDate', value: '14 Jan 2025' },
  // { label: 'cancellationFee', value: 'Nil' },
  // { label: 'checkinDate', value: '15 Jan 2025' },
  // { label: 'checkinTime', value: '02:00 PM' },
  // { label: 'checkoutDate', value: '17 Jan 2025' },
  // { label: 'checkoutTime', value: '11:00 AM' },
  // { label: 'confirmationId', value: 'BMH123456' },
  // { label: 'contactInfo', value: '+91 90000 00000' },
  // { label: 'date', value: '31st Dec, 2024' },
  // { label: 'email', value: 'rajesh@gmail.com' },
  // { label: 'guestCount', value: '2' },
  // { label: 'hostelName', value: 'Sunset Hostel' },
  // { label: 'inclusions', value: 'Wi-Fi, Hot water' },
  // { label: 'mapsLink', value: 'https://maps.google.com/?q=BMH' },
  { label: 'name', value: 'Rajesh' },
  // { label: 'newCheckoutDate', value: '19 Jan 2025' },
  // { label: 'paymentMethod', value: 'UPI' },
  // { label: 'paymentStatus', value: 'Successful' },
  { label: 'phone', value: '+913456789090' },
  // { label: 'processingTime', value: '5-7 Business Days' },
  // { label: 'refundAmount', value: '₹4,500' },
  // { label: 'refundMethod', value: 'Original Payment Method' },
  // { label: 'roomNumber', value: '402' },
  // { label: 'roomType', value: 'Executive Suite' },
  // { label: 'sharingPreference', value: 'Twin Sharing' },
  // { label: 'time', value: '10:00 AM' },
  // { label: 'transactionDate', value: '15 Jan 2025' },
];

const defaultHotelOptions = [
  { label: 'businessName', value: 'businessName' },
  { label: 'roomLink', value: 'https://business name.com' },
  { label: 'roomKey', value: '1234' },
  { label: 'name', value: 'Rajesh' },
  { label: 'serviceName', value: 'Food Delivery' },
  { label: 'roomNumber', value: '402' },
  { label: 'staffName', value: 'John' },
  { label: 'chatLink', value: 'https://business name.com' },
  { label: 'googleReviewLink', value: 'Review Link' },
  { label: 'serviceRejectionReason', value: 'Maintainance Issue' },
];

const MemoContent = () => {
  const outLetType = useBusinessData((s) => s.outletInfo?.outLetType);
  const headerType = useWhatsapp((s) => s.headerType);
  const setHeaderType = useWhatsapp((s) => s.setHeaderType);
  const headerText = useWhatsapp((s) => s.headerText);
  const setHeaderText = useWhatsapp((s) => s.setHeaderText);
  const bodyText = useWhatsapp((s) => s.bodyText);
  const bodyVariableSequence = useWhatsapp((s) => s.bodyVariableSequence);
  const setBodyVariableSequence = useWhatsapp((s) => s.setBodyVariableSequence);
  const addVariable = useWhatsapp((s) => s.addVariable);
  const removeVariable = useWhatsapp((s) => s.removeVariable);
  const bodyVariables = useWhatsapp((s) => s.bodyVariables);
  const updateVariable = useWhatsapp((s) => s.updateVariable);
  const templateName = useWhatsapp((s) => s.templateName);
  const variableOptions = useWhatsapp((s) => s.variableOptions);
  const setVariableOptions = useWhatsapp((s) => s.setVariableOptions);
  const updateBodySequenceVariable = useWhatsapp((s) => s.updateBodySequenceVariable);
  const updateDisplayBodySequenceVariable = useWhatsapp((s) => s.updateDisplayBodySequenceVariable);
  const footerText = useWhatsapp((s) => s.footerText);
  const templateError = useWhatsapp((s) => s.templateError);
  const setTemplateError = useWhatsapp((s) => s.setTemplateError);
  const { addTemplateName, handleBodyTextChange, handleFooterInput } = useAddTemplate();

  const handleAddVariable = useCallback(() => {
    addVariable();
  }, [addVariable]);

  const handleRemoveVariable = useCallback(
    (index: number) => {
      removeVariable(index);
      const newSequence = bodyVariableSequence.filter((_, i) => i !== index);
      setBodyVariableSequence(newSequence);
    },
    [removeVariable, setBodyVariableSequence, bodyVariableSequence],
  );
  useEffect(() => {
    if (outLetType === 'HOTEL') {
      setVariableOptions(defaultHotelOptions);
    } else {
      setVariableOptions(defaultData);
    }
  }, [outLetType, setVariableOptions]);

  return (
    <section className="mx-auto mb-4 w-full rounded-lg border bg-white p-3 shadow-md">
      <MiddlePopUp show={Boolean(templateError)} onlyPopUp>
        <div className="w-full overflow-hidden rounded-[1.5rem] bg-white">
          <div className="flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-500 px-6 py-4 text-white">
            <FiAlertTriangle className="text-2xl" />
            <h3 className="text-lg font-semibold">Template could not be saved</h3>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm leading-relaxed text-gray-700">{templateError}</p>
            <p className="mt-3 text-xs italic text-gray-500">
              Your edits are preserved. Adjust the template and try again.
            </p>
          </div>
          <div className="flex justify-end border-t bg-gray-50 px-6 py-3">
            <button
              type="button"
              onClick={() => setTemplateError(null)}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Got it, let me fix
            </button>
          </div>
        </div>
      </MiddlePopUp>
      <div className="mb-4">
        <label htmlFor="templateName" className="mb-2 block font-bold">
          Template Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="templateName"
            type="text"
            value={templateName}
            maxLength={100}
            onChange={addTemplateName}
            placeholder="Enter template name"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <small className="absolute bottom-2 right-3 text-gray-500">{templateName?.length || 0}/100</small>
        </div>
      </div>
      <div className="mb-6">
        <label htmlFor="headerType" className="mb-3 block text-base font-semibold text-gray-800">
          Header <span className="font-normal text-gray-500">(optional)</span>
        </label>

        {/* Button group */}
        <div className="mb-4 flex flex-wrap gap-3">
          {[
            { type: HeaderInterface.Text, icon: '📝', label: 'Text' },
            { type: HeaderInterface.Image, icon: '🖼️', label: 'Image' },
            { type: HeaderInterface.Video, icon: '🎥', label: 'Video ' },
            { type: HeaderInterface.Document, icon: '📄', label: 'Document' },
          ].map((btn) => {
            const active = headerType === btn.type;
            return (
              <button
                key={btn.type}
                type="button"
                onClick={() => setHeaderType(btn.type)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200',
                  active
                    ? 'border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-300 hover:bg-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600',
                )}
              >
                <span className="text-lg">{btn.icon}</span>
                {btn.label}
              </button>
            );
          })}
        </div>

        {/* Conditional input for Text Header */}
        {headerType === HeaderInterface.Text ? (
          <div className="relative mt-2">
            <input
              id="headerText"
              type="text"
              maxLength={512}
              value={headerText}
              placeholder="Enter header text..."
              onChange={(e) => {
                const trimmedValue = normalizeInput(e.target.value);
                setHeaderText(trimmedValue);
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <small className="absolute bottom-2 right-3 text-xs text-gray-500">{headerText?.length || 0}/512</small>
          </div>
        ) : (
          <MediaContent />
        )}
      </div>

      <div>
        <label htmlFor="bodyText" className="mb-2 block font-bold">
          Message Body <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <textarea
            id="bodyText"
            rows={8}
            minLength={24}
            maxLength={1028}
            placeholder="Write your message content here"
            value={bodyText}
            onChange={handleBodyTextChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <small className="absolute bottom-2 right-3 text-gray-500">{bodyText?.length || 0}/1028</small>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-4 flex items-center justify-between">
          <label htmlFor="dynamicVariables" className="font-bold">
            Dynamic Variables
          </label>
          <button type="button" onClick={handleAddVariable} className="flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm text-white">
            <BiPlus className="mr-1" /> Add Variable
          </button>
        </div>
        <div id="dynamicVariables" className="group relative space-y-3 rounded-lg bg-white transition-all">
          {bodyVariables
            ? bodyVariables?.map((_, index) => (
                <div key={index?.toString()} className="flex flex-col gap-3">
                  <div className="flex w-full items-center gap-3 sm:w-auto">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-900">
                      {index + 1}
                    </div>
                    <div className="relative flex-1 sm:w-64 sm:flex-none">
                      <select
                        value={bodyVariableSequence[index]}
                        onChange={(e) => {
                          const selectedOption = e.target.selectedOptions[0];
                          const label = e.target.value;
                          const value = selectedOption.getAttribute('aria-valuetext') || '';

                          updateBodySequenceVariable(index, label);
                          updateDisplayBodySequenceVariable(index, value);
                          updateVariable(index, label);
                        }}
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select Variable</option>
                        {variableOptions.map((option) => (
                          <option key={option?.label} value={option?.label} aria-valuetext={option?.value}>
                            {option?.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariable(index)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-label="Remove variable"
                    >
                      <IoMdClose className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            : null}
        </div>
      </div>
      <CouponContent />
      <div className="relative">
        <input
          maxLength={60}
          placeholder="Write your message content here"
          value={footerText}
          onChange={handleFooterInput}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
        <small className="absolute bottom-2 right-3 text-gray-500">{footerText?.length || 0}/60</small>
      </div>
    </section>
  );
};

const Content = memo(MemoContent);
export default Content;
