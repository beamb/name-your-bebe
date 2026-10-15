import { Component } from 'react';
import Select, { components } from 'react-select';
import type { MultiValue, OptionProps, StylesConfig } from 'react-select';
import { options } from "./options";
import type { LanguageOption, UsageCode } from "./options";

const Option = (props: OptionProps<LanguageOption, true>) => {
  return (
    <components.Option
      {...props}
      innerProps={{ ...props.innerProps, title: props.data.value }}
    />
  );
};

const customStyles: StylesConfig<LanguageOption, true> = {
  container: (styles) => ({
    ...styles,
    width: '100%',
    minWidth: 0,
  }),
  option: (styles) => ({
    ...styles,
    cursor: 'pointer',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
  }),
  dropdownIndicator: (styles) => ({
    ...styles,
    cursor: 'pointer',
  }),
  control: (styles) => ({
    ...styles,
    cursor: 'text',
    minHeight: 48,
  }),
  multiValue: (styles) => ({
    ...styles,
    alignItems: 'center',
    maxWidth: '100%',
  }),
  multiValueRemove: (styles) => ({
    ...styles,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
  }),
};

interface DropdownProps {
  onDropdown: (usage: UsageCode[]) => void;
}

interface DropdownState {
  selectedOption: MultiValue<LanguageOption>;
}

class Dropdown extends Component<DropdownProps, DropdownState> {
  override state: DropdownState = {
    selectedOption: [],
  };

  handleChange = (selectedOption: MultiValue<LanguageOption>): void => {
    this.setState(
      { selectedOption },
      this.updateUsageChange
    );
  };

  updateUsageChange = (): void => {
    this.props.onDropdown(this.state.selectedOption.map(option => option.key));
  }
  
  override render() {
    const { selectedOption } = this.state;

    return (
      <Select<LanguageOption, true>
        className="language-select"
        aria-label="Languages"
        getOptionValue={option => option.key}
        isMulti={true}
        closeMenuOnSelect={false}
        menuPlacement="auto"
        maxMenuHeight={240}
        components={{ Option }}
        placeholder="Select language(s)... Type to narrow your search."
        value={selectedOption}
        onChange={this.handleChange}
        options={options}
        styles={customStyles}
      />
    );
  }
}

export default Dropdown;
