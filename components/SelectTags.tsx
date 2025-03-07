import React, { useMemo } from 'react';
import { useMyVariable } from '../context/MyVariableContext';
import { debounce } from 'lodash';
import CreatableSelect from 'react-select/creatable';
import { saveNewTags } from '../utils/saveNewTags';

interface SelectTagsProps {
  onSelect: (names: string) => void;
  initialValue: string;
  type: string;
}

const SelectTags: React.FC<SelectTagsProps> = ({ onSelect, initialValue, type }) => {
  const initialOptions = initialValue 
    ? initialValue.split(", ").map(val => ({ label: val, value: val })) 
    : [];
  const [selectedLabels, setSelectedLabels] = React.useState(initialOptions);
  const { myVariable } = useMyVariable();
  const options =
    myVariable.tags[type] ||
    [
      { value: 'chocolate', label: 'Chocolate' },
      { value: 'strawberry', label: 'Strawberry' },
      { value: 'vanilla', label: 'Vanilla' }
    ];

  React.useEffect(() => {
    const initialOpts = initialValue 
      ? initialValue.split(", ").map(val => ({ label: val, value: val })) 
      : [];
    setSelectedLabels(initialOpts);
  }, [initialValue]);

  // Debounced update that saves tags
  const debouncedHandleInputChange = useMemo(
    () =>
      debounce(async (selected: any) => {
        setSelectedLabels(selected); // Update local state
        const labs: string[] = selected.map((item: any) => item.label);
        await saveNewTags(labs, type);
        onSelect(labs.join(", ")); // Update parent component's state
      }, 1000),
    [onSelect, type]
  );

  // Handle creation of new option (e.g., when user types comma separated tags)
  const handleCreateOption = (inputValue: string) => {
    // Split the input on commas, trim whitespace and remove empty strings
    const newTags = inputValue
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);
    // Map each tag to the option format
    const newOptions = newTags.map(tag => ({ label: tag, value: tag }));
    // Merge with the existing selected labels
    const updatedSelected = [...selectedLabels, ...newOptions];
    setSelectedLabels(updatedSelected);
    debouncedHandleInputChange(updatedSelected);
  };

  return (
    <div title="When you type, hit enter to add item and start typing again to add another or select from the dropdown">
      <CreatableSelect
        isMulti
        options={options}
        value={selectedLabels}
        onChange={(selected) => {
          debouncedHandleInputChange(selected || []);
        }}
        onCreateOption={handleCreateOption}
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
