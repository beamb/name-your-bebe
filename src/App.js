import React, { Component } from "react";
import "./App.css";
import Dropdown from "./Dropdown.js";
import { trackPromise } from 'react-promise-tracker';
import LoadingIndicator from "./InnerLoadingIndicator.js";
import Emoji from "./Emoji.js";

const colorArray = ["linear-gradient(to bottom right, #ffa1db, #2cb2ff)", "linear-gradient(to bottom right, #2cb2ff, #ffa1db)", "linear-gradient(to bottom right, #fff280, #5cff64)"];
const reversedColorArray = ["linear-gradient(to bottom left, #DFF2FB, #F9DDE5)", "linear-gradient(to bottom left, #F9DDE5, #DFF2FB)", "linear-gradient(to bottom left, #C9FCCC, #FDFBDB)"];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "???",
      gender: "",
      usage: [],
      color: "linear-gradient(to bottom right, #5cff64, #fff280)",
      reversedColor: "linear-gradient(to bottom left, #FDFBDB, #C9FCCC)",
      loading: false,
    };
  }

  changeColor(i) {
    this.setState({
      color: colorArray[i],
      reversedColor: reversedColorArray[i]
    });
  }

  async fetchName(gender) {
    this.setState({ loading: true, name: "", gender });
    if (gender === "f") { this.changeColor(0)}
    else if (gender === "m") {this.changeColor(1)}
    else if (gender === "u") {this.changeColor(2)}
    const params = new URLSearchParams({
      key: "be035335079",
      number: "1",
      gender,
    });
    if (this.state.usage.length > 0) {
      // The API accepts one usage. Give each selected language an equal chance.
      const index = Math.floor(Math.random() * this.state.usage.length);
      params.set("usage", this.state.usage[index]);
    }
    try {
      const response = await fetch(
        `https://www.behindthename.com/api/random.json?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Name request failed");
      }
      const result = await response.json();
      const name = result && Array.isArray(result.names) && result.names[0];
      this.setState({
        name: typeof name === "string" && name ? name : "Sorry, no match",
      });
    } catch (e) {
      this.setState({ name: "Sorry, please try again" });
    } finally {
      this.setState({ loading: false });
    }
  }

  updateUsage = (code) => {
      this.setState({
      usage: code
    });
  }

  render() {

    const stylesObj = {
      background: this.state.color
    };

    const stylesObj2 = {
      background: this.state.reversedColor
    }

    return (
      <div style={stylesObj} className="wrapper">
        <div style={stylesObj2} className="generator">
          <h1>Name your &quot;bébé&quot;!</h1>
          <h4>The intercultural baby name generator</h4>
          <h2>Hi citizen of the world! Are you hoping to find <strong>THE best international name</strong> for your newborn? Then you&apos;ve landed in the right place.<br/><br/>Pick a gender (or don&apos;t) and let the generator inspire you!</h2>
          <h1 className="babyname">{this.state.name}<LoadingIndicator /></h1>
          <div className="buttons">
            <button 
              className="genderButton"
              aria-label="genderButton"
              aria-hidden="false"
              aria-labelledby="buttons"
              onClick={() => trackPromise(this.fetchName("f"))}
              disabled={this.state.loading}
              >
              <Emoji symbol="♀" label="Female sign"/>
            </button>
            <button
              className="genderButton"
              aria-label="genderButton"
              aria-hidden="false"
              aria-labelledby="buttons"
              onClick={() => trackPromise(this.fetchName("u"))}
              disabled={this.state.loading}
              >
              <Emoji symbol="⚥" label="Male and female sign"/>
            </button>
            <button
              className="genderButton"
              aria-label="genderButton"
              aria-hidden="false"
              aria-labelledby="buttons"
              onClick={() => trackPromise(this.fetchName("m"))}
              disabled={this.state.loading}
            >
              <Emoji symbol="♂" label="Male sign"/>
            </button>
          </div>
          <p>In which language(s) do you expect people to call your baby&apos;s name?</p>
        <Dropdown onDropdown={this.updateUsage} />
          <p>Each suggestion comes from one randomly chosen selected language.</p>
        </div>
      </div>
    );
  }
}

export default App;
