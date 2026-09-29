import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

type Props = {
  type?: "warning" | "success" | "info";
  title: string;
  description: string;
};

export default function AlertBox({
  type = "warning",
  title,
  description,
}: Props) {
  const variants = {
    warning: {
      wrapper: "border-yellow-300 bg-yellow-50 text-yellow-800",
      icon: ExclamationTriangleIcon,
    },

    success: {
      wrapper: "border-green-300 bg-green-50 text-green-800",
      icon: CheckCircleIcon,
    },

    info: {
      wrapper: "border-blue-300 bg-blue-50 text-blue-800",
      icon: InformationCircleIcon,
    },
  };

  const current = variants[type];
  const Icon = current.icon;

  return (
    <div className={`flex gap-3 rounded-[12px] border p-4 ${current.wrapper}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />

      <div>
        <h3 className="text-[14px] font-bold">{title}</h3>

        <p className="mt-1 text-[13px] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
