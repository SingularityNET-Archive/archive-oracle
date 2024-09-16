import React from 'react';
import { useMyVariable } from '../context/MyVariableContext';
import styles from '../styles/typea.module.css';
import CreatableSelect from 'react-select/creatable';
import { saveNewTags } from '../utils/saveNewTags'

interface SelectTagsProps {
  onSelect: (names: string) => void;
  initialValue: string;
  type: string;
}

const SelectTags: React.FC<SelectTagsProps> = ({ onSelect, initialValue, type }) => {
  let initialOptions = initialValue ? initialValue.split(", ").map((val: any) => ({ label: val, value: val })) : [];
  const [selectedLabels, setSelectedLabels] = React.useState(initialOptions);
  const { myVariable } = useMyVariable();
  const options = myVariable.tags[`${type}`] ||  [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' }
  ];
  //console.log("options", options)
  async function handleInputChange(selected: any) {
    setSelectedLabels(selected);  // Update local state
    let labs: string[] = selected.map((item: any) => item.label);
    const status = await saveNewTags(labs, type);
    onSelect(labs.join(", ")); // Update parent component's state
  }
  
  React.useEffect(() => {
    let initialOptions = initialValue ? initialValue.split(", ").map((val) => ({ label: val, value: val })) : [];
    setSelectedLabels(initialOptions);
  }, [initialValue]);
  
  return (
    <div title="When you type, hit enter to add item and start typing again to add another or select from the dropdown">
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

export default SelectTags;
