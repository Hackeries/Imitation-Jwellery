"use client";

import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDown, Check } from "lucide-react";

type Option = {
  label: string;
  value: string;
};

type CommonSelectProps = {
  label?: string;
  name: string;
  options: Option[];
  value?: Option;
  defaultValue?: Option | null;
  onChange?: (value: Option) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

const CommonSelect: React.FC<CommonSelectProps> = ({
  label,
  name,
  options,
  value,
  defaultValue = null,
  onChange,
  placeholder = "Select an option",
  required = false,
  disabled = false,
  className = "",
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-medium text-gray-800"
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          {/* Button */}
           <Listbox.Button
             className={`
               relative w-full cursor-pointer rounded-md bg-transparent border border-gray-200
               px-1.5 md:px-4 py-1.5 md:py-3 text-sm text-left
               outline-none transition
               focus:border-primary focus:ring-1 focus:ring-primary
               disabled:bg-foreground/10 disabled:cursor-not-allowed
               ${className}
             `}
           >
            <span className="block truncate">
              {value ? value.label : placeholder}
            </span>

            <span className="pointer-events-none absolute inset-y-0 right-2 md:right-4 flex items-center">
              <ChevronDown size={18} className="text-gray-500" />
            </span>
          </Listbox.Button>

          {/* Options */}
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className="
                absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md
                bg-white py-1 text-sm shadow-lg ring-1 ring-black/5
                focus:outline-none
              "
            >
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pr-4 pl-4
                    ${active ? "bg-primary/10 text-primary" : "text-gray-900"}`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {option.label}
                      </span>
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default CommonSelect;
