import React from 'react';
import { useMyVariable } from '../context/MyVariableContext';
import styles from '../styles/typea.module.css';
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
              borderColor: state.isFocused ? 'grey' : 'white',
              backgroundColor: 'black',
              color: 'white',
            }),
            option: (baseStyles, { isFocused, isSelected }) => ({
              ...baseStyles,
              backgroundColor: isSelected ? 'darkblue' : isFocused ? 'darkgray' : 'black',
              color: 'white',
            }),
            multiValue: (baseStyles) => ({
              ...baseStyles,
              backgroundColor: 'darkblue',
            }),
            multiValueLabel: (baseStyles) => ({
              ...baseStyles,
              color: 'white',
            }),
            input: (baseStyles) => ({
              ...baseStyles,
              color: 'white',
            }),
            menu: (baseStyles) => ({
              ...baseStyles,
              backgroundColor: 'black',
            }),
          }}
        />
    </div>
  );
};

export default SelectNames;