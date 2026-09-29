import {
    ChatBubbleLeftRightIcon,
    DocumentTextIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";

export default function EmptyChat() {
    return (
        <div className="flex h-full items-center justify-center bg-[#FAFAFA] px-6">
            <div className="text-center">
                <div className="relative mx-auto mb-8 flex h-[130px] w-[130px] items-center justify-center rounded-full bg-[#FFF8D9]">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 text-[#F5A300]" />

                    <div className="absolute -right-2 top-2 rounded-full bg-white p-3 shadow">
                        <span className="text-xl">🌾</span>
                    </div>

                    <div className="absolute -left-3 top-12 rounded-full bg-white p-3 shadow">
                        <DocumentTextIcon className="h-5 w-5 text-[#9A5B34]" />
                    </div>

                    <div className="absolute bottom-0 right-5 rounded-full bg-white p-3 shadow">
                        <UserGroupIcon className="h-5 w-5 text-green-500" />
                    </div>
                </div>

                <h2 className="text-[40px] font-bold text-black">
                    Ready to negotiate?
                </h2>

                <p className="mx-auto mt-4 max-w-[520px] text-[18px] text-secondary-body">
                    Connect directly with farmers and buyers. Discuss terms, share quality
                    reports, and finalize contracts all in one place.
                </p>
            </div>
        </div>
    );
}