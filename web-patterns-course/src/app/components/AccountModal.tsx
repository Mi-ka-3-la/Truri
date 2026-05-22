import { useState } from "react";
import { X, ChevronDown, Search } from "lucide-react";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: AccountFormData) => void;
  editMode?: boolean;
  initialData?: Partial<AccountFormData>;
}

interface AccountFormData {
  classification: string;
  accountType: string;
  accountSubType: string;
  accountName: string;
  accountNumber: string;
  parentAccount: string;
}

const CLASSIFICATIONS = [
  { value: "asset", label: "Asset" },
  { value: "liability", label: "Liability" },
  { value: "equity", label: "Equity" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];

const ACCOUNT_TYPES: Record<string, { value: string; label: string }[]> = {
  asset: [
    { value: "current", label: "Current Assets" },
    { value: "fixed", label: "Fixed Assets" },
    { value: "other", label: "Other Assets" },
  ],
  liability: [
    { value: "current", label: "Current Liabilities" },
    { value: "long-term", label: "Long-term Liabilities" },
  ],
  equity: [
    { value: "capital", label: "Owner's Capital" },
    { value: "retained", label: "Retained Earnings" },
  ],
  income: [
    { value: "operating", label: "Operating Revenue" },
    { value: "non-operating", label: "Non-operating Revenue" },
  ],
  expense: [
    { value: "operating", label: "Operating Expenses" },
    { value: "non-operating", label: "Non-operating Expenses" },
  ],
};

const ACCOUNT_SUBTYPES: Record<string, { value: string; label: string }[]> = {
  current: [
    { value: "cash", label: "Cash and Cash Equivalents" },
    { value: "accounts-receivable", label: "Accounts Receivable" },
    { value: "inventory", label: "Inventory" },
    { value: "prepaid", label: "Prepaid Expenses" },
  ],
  fixed: [
    { value: "property", label: "Property" },
    { value: "equipment", label: "Equipment" },
    { value: "vehicles", label: "Vehicles" },
  ],
  operating: [
    { value: "salaries", label: "Salaries and Wages" },
    { value: "rent", label: "Rent" },
    { value: "utilities", label: "Utilities" },
    { value: "marketing", label: "Marketing" },
  ],
};

const PARENT_ACCOUNTS = [
  { value: "", label: "None (Top-level account)" },
  { value: "1000", label: "1000 - Assets" },
  { value: "1100", label: "1100 - Current Assets" },
  { value: "1200", label: "1200 - Fixed Assets" },
  { value: "2000", label: "2000 - Liabilities" },
  { value: "3000", label: "3000 - Equity" },
];

export function AccountModal({ isOpen, onClose, onSubmit, editMode = false, initialData }: AccountModalProps) {
  const [formData, setFormData] = useState<AccountFormData>({
    classification: initialData?.classification || "",
    accountType: initialData?.accountType || "",
    accountSubType: initialData?.accountSubType || "",
    accountName: initialData?.accountName || "",
    accountNumber: initialData?.accountNumber || "",
    parentAccount: initialData?.parentAccount || "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AccountFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof AccountFormData, boolean>>>({});
  const [parentAccountSearch, setParentAccountSearch] = useState("");

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof AccountFormData, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Reset dependent fields when classification changes
      if (field === "classification") {
        updated.accountType = "";
        updated.accountSubType = "";
      }
      
      // Reset subtype when account type changes
      if (field === "accountType") {
        updated.accountSubType = "";
      }
      
      return updated;
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof AccountFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: keyof AccountFormData) => {
    const requiredFields = ["classification", "accountType", "accountSubType", "accountName"];
    
    if (requiredFields.includes(field) && !formData[field]) {
      setErrors((prev) => ({ ...prev, [field]: "This field is required" }));
      return false;
    }
    
    return true;
  };

  const validateForm = () => {
    const requiredFields: (keyof AccountFormData)[] = ["classification", "accountType", "accountSubType", "accountName"];
    const newErrors: Partial<Record<keyof AccountFormData, string>> = {};
    
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This field is required";
      }
    });
    
    setErrors(newErrors);
    setTouched({
      classification: true,
      accountType: true,
      accountSubType: true,
      accountName: true,
    });
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit?.(formData);
      onClose();
    }
  };

  const availableAccountTypes = formData.classification ? ACCOUNT_TYPES[formData.classification] || [] : [];
  const availableSubTypes = formData.accountType ? ACCOUNT_SUBTYPES[formData.accountType] || [] : [];
  const filteredParentAccounts = PARENT_ACCOUNTS.filter((account) =>
    account.label.toLowerCase().includes(parentAccountSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-[500px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {editMode ? "Edit Account" : "Create Account"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            {/* Classification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Classification <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.classification}
                  onChange={(e) => handleFieldChange("classification", e.target.value)}
                  onBlur={() => handleBlur("classification")}
                  className={`w-full px-3 py-2 border rounded-md appearance-none cursor-pointer bg-white pr-10 focus:outline-none focus:ring-2 transition-colors ${
                    errors.classification && touched.classification
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                >
                  <option value="">Select classification</option>
                  {CLASSIFICATIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.classification && touched.classification ? (
                <p className="mt-1.5 text-xs text-red-600">{errors.classification}</p>
              ) : (
                <p className="mt-1.5 text-xs text-gray-500">Select the main category</p>
              )}
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Account Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.accountType}
                  onChange={(e) => handleFieldChange("accountType", e.target.value)}
                  onBlur={() => handleBlur("accountType")}
                  disabled={!formData.classification}
                  className={`w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 transition-colors ${
                    !formData.classification
                      ? "bg-gray-50 cursor-not-allowed text-gray-400"
                      : "bg-white cursor-pointer"
                  } ${
                    errors.accountType && touched.accountType
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                >
                  <option value="">Select account type</option>
                  {availableAccountTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.accountType && touched.accountType ? (
                <p className="mt-1.5 text-xs text-red-600">{errors.accountType}</p>
              ) : (
                <p className="mt-1.5 text-xs text-gray-500">Options depend on Classification selected</p>
              )}
            </div>

            {/* Account SubType */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Account SubType <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.accountSubType}
                  onChange={(e) => handleFieldChange("accountSubType", e.target.value)}
                  onBlur={() => handleBlur("accountSubType")}
                  disabled={!formData.accountType}
                  className={`w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 transition-colors ${
                    !formData.accountType
                      ? "bg-gray-50 cursor-not-allowed text-gray-400"
                      : "bg-white cursor-pointer"
                  } ${
                    errors.accountSubType && touched.accountSubType
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                >
                  <option value="">Select account subtype</option>
                  {availableSubTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.accountSubType && touched.accountSubType ? (
                <p className="mt-1.5 text-xs text-red-600">{errors.accountSubType}</p>
              ) : (
                <p className="mt-1.5 text-xs text-gray-500">Options depend on Account Type selected</p>
              )}
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Account Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => handleFieldChange("accountName", e.target.value)}
                onBlur={() => handleBlur("accountName")}
                placeholder="e.g., Business Checking Account"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                  errors.accountName && touched.accountName
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
              {errors.accountName && touched.accountName && (
                <p className="mt-1.5 text-xs text-red-600">{errors.accountName}</p>
              )}
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Account Number
              </label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => handleFieldChange("accountNumber", e.target.value)}
                placeholder="e.g., 1010"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Parent Account */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Parent Account
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <select
                  value={formData.parentAccount}
                  onChange={(e) => handleFieldChange("parentAccount", e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md appearance-none cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {filteredParentAccounts.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">Select to create as sub-account</p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            {editMode ? "Save Changes" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
