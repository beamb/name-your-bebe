import { Component } from "react";
import "./App.css";
import Dropdown from "./Dropdown";
import LoadingIndicator from "./InnerLoadingIndicator";
import Emoji from "./Emoji";
import type { UsageCode } from "./options";

const colorArray = ["linear-gradient(to bottom right, #ffa1db, #2cb2ff)", "linear-gradient(to bottom right, #2cb2ff, #ffa1db)", "linear-gradient(to bottom right, #fff280, #5cff64)"] as const;
const reversedColorArray = ["linear-gradient(to bottom left, #DFF2FB, #F9DDE5)", "linear-gradient(to bottom left, #F9DDE5, #DFF2FB)", "linear-gradient(to bottom left, #C9FCCC, #FDFBDB)"] as const;

type Gender = "f" | "m" | "u";

interface AppState {
  name: string;
  gender: Gender | "";
  usage: UsageCode[];
  color: string;
  reversedColor: string;
  loading: boolean;
  hasError: boolean;
}

class App extends Component<object, AppState> {
  override state: AppState = {
    name: "???",
    gender: "",
    usage: [],
    color: "linear-gradient(to bottom right, #5cff64, #fff280)",
    reversedColor: "linear-gradient(to bottom left, #FDFBDB, #C9FCCC)",
    loading: false,
    hasError: false,
  };

  changeColor(i: 0 | 1 | 2): void {
    this.setState({
      color: colorArray[i],
      reversedColor: reversedColorArray[i]
    });
  }

  async fetchName(gender: Gender): Promise<void> {
    this.setState({ loading: true, name: "", gender, hasError: false });
    if (gender === "f") { this.changeColor(0)}
    else if (gender === "m") {this.changeColor(1)}
    else if (gender === "u") {this.changeColor(2)}
    const params = new URLSearchParams({
      key: "be035335079",
      number: "1",
      gender,
    });
    // Snapshot the selection so changes in the dropdown affect the next click.
    const remainingUsages: (UsageCode | undefined)[] = Array.from(new Set(this.state.usage));
    if (remainingUsages.length === 0) {
      remainingUsages.push(undefined);
    }
    try {
      while (remainingUsages.length > 0) {
        // Pick without replacement so each language is tried at most once.
        const index = Math.floor(Math.random() * remainingUsages.length);
        const [usage] = remainingUsages.splice(index, 1);
        if (usage !== undefined) {
          params.set("usage", usage);
        }
        const response = await fetch(
          `https://www.behindthename.com/api/random.json?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error("Name request failed");
        }
        const result: unknown = await response.json();
        const name: unknown = result !== null && typeof result === "object" &&
          "names" in result && Array.isArray(result.names) ? result.names[0] : undefined;
        if (typeof name === "string" && name.trim()) {
          this.setState({ name });
          return;
        }
        if (remainingUsages.length > 0) {
          // Leave room for the API's limit of two requests per second.
          await new Promise<void>(resolve => setTimeout(resolve, 550));
        }
      }
      this.setState({ name: "Sorry, no match", hasError: true });
    } catch {
      this.setState({ name: "Sorry, please try again", hasError: true });
    } finally {
      this.setState({ loading: false });
    }
  }

  updateUsage = (code: UsageCode[]): void => {
      this.setState({
      usage: code
    });
  }

  override render() {

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
          <h1 className={`babyname${this.state.hasError ? " babyname--message" : ""}`}>
            {this.state.name}<LoadingIndicator loading={this.state.loading} />
          </h1>
          <div className="buttons">
            <button 
              className="genderButton"
              aria-label="genderButton"
              aria-hidden="false"
              aria-labelledby="buttons"
              onClick={() => this.fetchName("f")}
              disabled={this.state.loading}
              >
              <Emoji symbol="♀" label="Female sign"/>
            </button>
            <button
              className="genderButton"
              aria-label="genderButton"
              aria-hidden="false"
              aria-labelledby="buttons"
              onClick={() => this.fetchName("u")}
              disabled={this.state.loading}
              >
              <Emoji symbol="⚥" label="Male and female sign"/>
            </button>
            <button
              className="genderButton"
              aria-label="genderButton"
              aria-hidden="false"
              aria-labelledby="buttons"
              onClick={() => this.fetchName("m")}
              disabled={this.state.loading}
            >
              <Emoji symbol="♂" label="Male sign"/>
            </button>
          </div>
          <p className="language-label">In which language(s) do you expect people to call your baby&apos;s name?</p>
          <Dropdown onDropdown={this.updateUsage} />
          <p className="language-hint">We try your selected languages in a random order until we find a name.</p>
        </div>
      </div>
    );
  }
}

export default App;
