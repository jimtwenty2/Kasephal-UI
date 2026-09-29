import { DocumentCheckIcon } from "@heroicons/react/24/outline";

type Props = {
    label: string;

    onClick?: () => void;

    variant?: "solid" | "outline";

    fullWidth?: boolean;

    disabled?: boolean;
};

export default function ContractButton({
    label,
    onClick,
    variant = "solid",
    fullWidth = false,
    disabled = false,
}: Props) {
    const baseClass =
        "flex h-[38px] items-center justify-center gap-1.5 rounded-full px-3 text-[13px] font-bold transition-all ease-in sm:h-[42px] sm:gap-2 sm:px-8 sm:text-[14px]";

    if (disabled) {
        return (
            <button
                type="button"
                disabled
                className={`${baseClass} cursor-not-allowed border border-light-grey bg-light-grey/30 text-secondary-body ${fullWidth ? "w-full" : ""
                    }`}
            >
                {label}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={`${baseClass} transition hover:bg-green-700 ${fullWidth ? "w-full" : ""
                } ${variant === "solid"
                    ? "bg-primary text-white shadow-[0_10px_25px_rgba(0,128,48,0.22)]"
                    : "border border-light-grey bg-white text-primary-heading"
                }`}
        >
            {variant === "solid" && (
                <DocumentCheckIcon className="h-5 w-5" />
            )}

            {label}
        </button>
    );
}