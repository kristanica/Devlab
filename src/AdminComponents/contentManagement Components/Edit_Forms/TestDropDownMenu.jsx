
const blockTypes = ["Header", "Paragraph", "Divider","Image"]; // 

function TestDropDownMenu({ selectedItem, setSelectedItem }) {
  return (
    <select
      value={selectedItem}
      onChange={(e) => setSelectedItem(e.target.value)}
      className="w-full bg-[#0d13207c] text-white border border-cyan-400 rounded-2xl p-2 focus:outline-none cursor-pointer">
      <option value="">Select a Block Type</option>
      {blockTypes.map((type) => (
        <option key={type} value={type} className="bg-[#111827]">
          {type}
        </option>
      ))}
    </select>
  );
}

export default TestDropDownMenu;
