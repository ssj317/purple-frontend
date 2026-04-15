const colors = {
  admin: "bg-purple-100 text-purple-700",
  manager: "bg-blue-100 text-blue-700",
  user: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  inactive: "bg-red-100 text-red-700",
};

export default function Badge({ value }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${colors[value] || "bg-gray-100 text-gray-600"}`}>
      {value}
    </span>
  );
}
