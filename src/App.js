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
    this.setState({ loading: true });
    this.setState({ name: "" })
    this.setState({ gender: gender });
    if (gender === "f") { this.changeColor(0)}
    else if (gender === "m") {this.changeColor(1)}
    else if (gender === "u") {this.changeColor(2)}
    const baseUrl =
      "https://www.behindthename.com/api/random.json?key=be035335079&number=1";
    var genderParam = `&gender=${gender}`;
    var usageParam = "";
    if (this.state.usage.length > 0) {
      usageParam = `&usage=${this.state.usage[0]}`;
      if (this.state.usage.length > 1) {
        var i;
        for (i = 1; i < this.state.usage.length; i++) {
          usageParam += `&${this.state.usage[i]}`;
        }
      }
    }
    const results = await fetch(baseUrl + genderParam + usageParam);
    const results_1 = await results.json();
    console.log(baseUrl+genderParam+usageParam);
    let nameResult = "";
    try {
      nameResult = results_1.names[0];
    } catch (e) {
      nameResult = "Sorry, no match";
    }
    console.log(nameResult);
    this.setState({ name: nameResult });
    this.setState({ loading: false });
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
        </div>
      </div>
    );
  }
}

export default App;
