import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeClosed } from "lucide-react";

type Props = {
  label: string;
  error?: string;
  suffix?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ label, error, type, suffix, ...props }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const isNumber = type === "number";

  // Convert number inputs to text with numeric validation to prevent spinner buttons
  const inputType = isNumber ? "text" : type;
  const inputMode = isNumber ? "decimal" : undefined;
  const pattern = isNumber ? "[0-9.]*" : undefined;

  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-primary">
        <span className="text-red-500">*</span> {label}
      </label>

      {type === "tel" ? (
        <div className="flex h-12 w-full items-center rounded-[10px] border border-light-grey bg-white px-4">
          <div className="flex items-center gap-2 border-r border-light-grey pr-3">
            <Image
              src="/assets/kh-flag.png"
              alt="flag"
              width={22}
              height={16}
              className="rounded-xs"
            />
            <span className="text-sm text-[#344054]">(+855)</span>
          </div>

          <input
            type="tel"
            {...props}
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
          />
        </div>
      ) : isPassword ? (
        <div className="flex h-12 w-full items-center rounded-[10px] border border-light-grey bg-white px-4">
          <input
            type={showPassword ? "text" : "password"}
            {...props}
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#667085] transition-colors duration-200 hover:bg-gray-100 active:scale-95"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={showPassword ? "hide-password" : "show-password"}
                initial={{ opacity: 0.75, scaleY: 0.12 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0.75, scaleY: 0.12 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="origin-center"
              >
                {showPassword ? (
                  <EyeClosed className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      ) : suffix ? (
        <div className="flex h-12 w-full items-center rounded-[10px] border border-light-grey bg-white px-4">
          <input
            type={inputType}
            inputMode={inputMode}
            pattern={pattern}
            {...props}
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
          />

          <span className="ml-2 shrink-0 text-sm font-medium text-[#667085]">
            {suffix}
          </span>
        </div>
      ) : (
        <input
          type={inputType}
          inputMode={inputMode}
          pattern={pattern}
          {...props}
          className="h-12 w-full rounded-[10px] border border-light-grey px-4 text-sm outline-primary"
        />
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}