import {
  ISSUE_TYPE_FILTER_OPTIONS,
  ISSUE_TYPE_LABEL,
  type IssueTypeFilterValue,
} from "./ShareComponent";
import AdminDropdown from "../../_components/AdminDropdown";

interface IssueTypeFilterProps {
  value: IssueTypeFilterValue;
  onChange: (value: IssueTypeFilterValue) => void;
}

export default function IssueTypeFilter({ value, onChange }: IssueTypeFilterProps) {
  const options = ISSUE_TYPE_FILTER_OPTIONS.map((option) => ({
    value: option,
    label: option === "All" ? "All Types" : ISSUE_TYPE_LABEL[option],
  }));

  return (
    <AdminDropdown
      value={value}
      options={options}
      onChange={onChange}
      placeholder="Issue Type"
      className="w-52"
      triggerClassName="h-10"
    />
  );
}
