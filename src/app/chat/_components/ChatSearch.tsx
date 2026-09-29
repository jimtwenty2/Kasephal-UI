import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { forwardRef } from "react";

type Props = {
    value: string;
    onChange: (value: string) => void;
};

const ChatSearch = forwardRef<HTMLInputElement, Props>(function ChatSearch(
    { value, onChange },
    ref
) {
    return (
        <div className="flex h-11 items-center gap-3 rounded-[18px] border border-light-grey bg-white px-4 shadow-sm">
            <MagnifyingGlassIcon className="h-5 w-5 text-secondary-body" />

            <input
                ref={ref}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-[14px] outline-none placeholder:text-secondary-body"
            />
        </div>
    );
});

export default ChatSearch;
