import useWhatsapp from "@/components/store/useWhatsapp";
import CTAButton from "@/components/templates/whatsappTemplates/CTAButton";
import { memo, useState } from "react";
import { ActionType } from "@/components/store/useWhatsapp";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MemoCallOfAction = () => {
  const firstActionType = useWhatsapp((s) => s.firstActionType);
  const setFirstActionType = useWhatsapp((s) => s.setFirstActionType);
  const secondActionType = useWhatsapp((s) => s.secondActionType);
  const setSecondActionType = useWhatsapp((s) => s.setSecondActionType);

  const buttonText = useWhatsapp((s) => s.buttonText);
  const setButtonText = useWhatsapp((s) => s.setButtonText);
  const secondButtonText = useWhatsapp((s) => s.secondButtonText);
  const setSecondButtonText = useWhatsapp((s) => s.setSecondButtonText);

  const websiteUrl = useWhatsapp((s) => s.websiteUrl);
  const setWebsiteUrl = useWhatsapp((s) => s.setWebsiteUrl);
  const phoneNumber = useWhatsapp((s) => s.phoneNumber);
  const setPhoneNumber = useWhatsapp((s) => s.setPhoneNumber);

  const secondWebsiteUrl = useWhatsapp((s)=>s.secondWebsiteUrl);
  const setSecondWebsiteUrl = useWhatsapp((s)=>s.setSecondWebsiteUrl);

  const secondPhoneNumber = useWhatsapp((s)=>s.secondPhoneNumber);
  const setSecondPhoneNumber = useWhatsapp((s)=>s.setSecondPhoneNumber)

  const firstButtonEnable = useWhatsapp((s)=>s.firstButtonEnable)
  const secondButtonEnable = useWhatsapp((s)=>s.secondButtonEnable)

  const setFirstButtonEnable = useWhatsapp((s)=>s.setFirstButtonEnable)
  const setSecondButtonEnable = useWhatsapp((s)=>s.setSecondButtonEnable)


  const [dropdownFor, setDropdownFor] = useState<0 | 1 | null>(null);

  const handleSelect = (index: 0 | 1, type: ActionType) => {
    if (index === 0) {
      setFirstActionType(type);
      setFirstButtonEnable(true);
    } else {
      setSecondActionType(type);
      setSecondButtonEnable(true);
    }
    setDropdownFor(null);
  };

  const isWebsiteDisabledForCta1 = secondButtonEnable && secondActionType === ActionType.VisitWebsite;

  const isWebsiteDisabledForCta2 = firstButtonEnable && firstActionType === ActionType.VisitWebsite;

  const isPhoneDisabledForCta1 = secondButtonEnable && secondActionType === ActionType.CallUs;

  const isPhoneDisabledForCta2 = firstButtonEnable && firstActionType === ActionType.CallUs;

  return (
    <div className="rounded-lg border bg-white p-4 shadow-md space-y-6 relative">

      {/* CTA 1 */}
      {!firstButtonEnable ? (
        <DropdownMenu
          open={dropdownFor === 0}
          onOpenChange={(isOpen) => setDropdownFor(isOpen ? 0 : null)}
        >
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-full rounded-md border py-2 text-center text-sm text-gray-700 hover:bg-gray-50"
            >
              ➕ Add First Button
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
            <DropdownMenuItem
              onClick={() => !isWebsiteDisabledForCta1 && handleSelect(0, ActionType.VisitWebsite)}
              disabled={isWebsiteDisabledForCta1}
              className={isWebsiteDisabledForCta1 ? "cursor-not-allowed opacity-40" : ""}
            >
              🌐 Visit Website
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => !isPhoneDisabledForCta1 && handleSelect(0, ActionType.CallUs)}
              disabled={isPhoneDisabledForCta1}
              className={isPhoneDisabledForCta1 ? "cursor-not-allowed opacity-40" : ""}
            >
              📞 Call Phone Number
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <CTAButton
          index={0}
          title="Primary Call To Action"
          actionType={firstActionType}
          text={buttonText}
          setText={setButtonText}
          url={websiteUrl}
          setUrl={setWebsiteUrl}
          phone={phoneNumber}
          setPhone={setPhoneNumber}
          onRemove={() => {
            setFirstButtonEnable(false);
            setFirstActionType(ActionType.VisitWebsite);
          }}
        />
      )}

      {/* CTA 2 */}
      {!secondButtonEnable ? (
        <>
          {!firstButtonEnable ? null : (
            <DropdownMenu
              open={dropdownFor === 1}
              onOpenChange={(isOpen) => setDropdownFor(isOpen ? 1 : null)}
            >
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="w-full rounded-md border py-2 text-center text-sm text-gray-700 hover:bg-gray-50"
                >
                  ➕ Add Second Button
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                <DropdownMenuItem
                  onClick={() => !isWebsiteDisabledForCta2 && handleSelect(1, ActionType.VisitWebsite)}
                  disabled={isWebsiteDisabledForCta2}
                  className={isWebsiteDisabledForCta2 ? "cursor-not-allowed opacity-40" : ""}
                >
                  🌐 Visit Website
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => !isPhoneDisabledForCta2 && handleSelect(1, ActionType.CallUs)}
                  disabled={isPhoneDisabledForCta2}
                  className={isPhoneDisabledForCta2 ? "cursor-not-allowed opacity-40" : ""}
                >
                  📞 Call Phone Number
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </>
      ) : (
        <CTAButton
          index={1}
          title="Second Call To Action"
          actionType={secondActionType}
          text={secondButtonText}
          setText={setSecondButtonText}
          url={secondWebsiteUrl}
          setUrl={setSecondWebsiteUrl}
          phone={secondPhoneNumber}
          setPhone={setSecondPhoneNumber}
          onRemove={() => {
            setSecondButtonEnable(false);
            setSecondActionType(ActionType.VisitWebsite);
          }}
        />
      )}
    </div>
  );
};

export default memo(MemoCallOfAction);