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
  let initialOptions = initialValue ? initialValue.split(", ").map((val: any) => ({ label: val, value: val })) : [];
  const [selectedLabels, setSelectedLabels] = React.useState(initialOptions);
  const { myVariable } = useMyVariable();
  const options = myVariable.names ||  [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' }
  ];

  async function handleInputChange(selected: any) {
    setSelectedLabels(selected);  // Update local state
    let labs: string[] = selected.map((item: any) => item.label);
    const status = await saveNewNames(labs);
    onSelect(labs.join(", ")); // Update parent component's state
  }
  
  return (
    <div title="When you type, hit enter to add item and start typing again to add another or select from the dropdown">
       <CreatableSelect
          isMulti
          options={options}
          value={selectedLabels} // Make it a controlled component
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
