import React from 'react';
import { useMyVariable } from '../context/MyVariableContext';
import CreatableSelect from 'react-select/creatable';
import { saveNewNames } from '../utils/saveNewNames'

interface SelectNamesProps {
  onSelect: (names: string) => void;
  initialValue: string;
}

const SelectNames: React.FC<SelectNamesProps> = ({ onSelect, initialValue }) => {
  const initialOptions = initialValue ? initialValue.split(",").map(val => ({ label: val.trim(), value: val.trim() })) : [];
  const [selectedLabels, setSelectedLabels] = React.useState(initialOptions);
  const { myVariable } = useMyVariable();
  const options = myVariable.names ||  [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' }
  ];

  React.useEffect(() => {
    const initialOptions = initialValue ? initialValue.split(",").map(val => ({ label: val.trim(), value: val.trim() })) : [];
    setSelectedLabels(initialOptions);
  }, [initialValue]);
  
  async function handleInputChange(selected: any) {
    setSelectedLabels(selected);  // Update local state
    let labs: string[] = selected.map((item: any) => item.label);
    const status = await saveNewNames(labs);
    onSelect(labs.join(", ")); // Update parent component's state
  }
  
  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData('text');
    const pastedNames = pastedText.split(',').map(name => name.trim()).filter(Boolean);
    const newOptions = pastedNames.map(name => ({ label: name, value: name }));
    setSelectedLabels(prevLabels => [...prevLabels, ...newOptions]);
    handleInputChange([...selectedLabels, ...newOptions]);
  };

  return (
    <div 
      title="When you type, hit enter to add item and start typing again to add another or select from the dropdown. You can also paste a comma-separated list of names."
      onPaste={handlePaste}
    >
      <CreatableSelect
        isMulti
        options={options}
        value={selectedLabels}
        onChange={(selected) => {
          handleInputChange(selected || []);
        }}
        styles={{
          control: (baseStyles, state) => ({
            ...baseStyles,
            borderColor: state.isFocused ? '#007bff' : '#ced4da',
            backgroundColor: 'white',
            color: 'black',
          }),
          option: (baseStyles, { isFocused, isSelected }) => ({
            ...baseStyles,
            backgroundColor: isSelected ? '#007bff' : isFocused ? '#f8f9fa' : 'white',
            color: isSelected ? 'white' : 'black',
          }),
          multiValue: (baseStyles) => ({
            ...baseStyles,
            backgroundColor: '#e9ecef',
          }),
          multiValueLabel: (baseStyles) => ({
            ...baseStyles,
            color: 'black',
          }),
          input: (baseStyles) => ({
            ...baseStyles,
            color: 'black',
          }),
          menu: (baseStyles) => ({
            ...baseStyles,
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }),
        }}
      />
    </div>
  );
};

export default SelectNames;