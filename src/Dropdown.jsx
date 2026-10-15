import React from 'react';
import Select, { components } from 'react-select';
import { options } from "./options.js";

const Option = props => {
  return (
    <components.Option
      {...props}
      innerProps={{ ...props.innerProps, title: props.data.value }}
    />
  );
};

const customStyles = {
  option: (styles) => ({
    ...styles,
    cursor: 'pointer',
  }),
  dropdownIndicator: (styles) => ({
    ...styles,
    cursor: 'pointer',
  }),
  control: (styles) => ({
    ...styles,
    cursor: 'text',
  }),
};

class Dropdown extends React.Component {
  state = {
    selectedOption: null,
  };

  handleChange = selectedOption => {
    this.setState(
      { selectedOption },
      this.updateUsageChange
    );
  };

  updateUsageChange = () => {
    var i;
    var code = [];
    if (this.state.selectedOption != null) {
    for (i = 0; i < this.state.selectedOption.length; i++) {
      code.push(this.state.selectedOption[i].key);
    }}
    this.props.onDropdown(code);
  }
  
  render() {
    const { selectedOption } = this.state;

    return (
      <Select
        aria-label="Languages"
        getOptionValue={option => option.key}
        isMulti={true}
        closeMenuOnSelect={false}
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
