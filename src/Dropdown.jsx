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
    maxWidth: '100%',
  }),
  multiValueRemove: (styles) => ({
    ...styles,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
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
